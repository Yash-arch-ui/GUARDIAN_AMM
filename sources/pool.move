
module circuit_breaker_amm::pool {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::clock::{Self, Clock};

    const EZeroAmount: u64 = 0;
    const EPoolPaused: u64 = 1;
    const ESlippageExceeded: u64 = 2;
    const EInsufficientLiquidity: u64 = 3;

    const THRESHOLD_BPS: u128 = 1000;
    const COOLDOWN_MS: u64 = 300_000;
    const STATE_NORMAL: u8 = 0;
    const STATE_COOLDOWN: u8 = 1;
    const BPS_DENOMINATOR: u128 = 10000;

    public struct Pool<phantom X, phantom Y> has key {
        id: UID,
        reserve_x: Balance<X>,
        reserve_y: Balance<Y>,
        lp_supply: u64,
        twap_price: u128,
        last_update_ts: u64,
        state: u8,
        paused_until: u64,
    }

    public struct PoolCreated has copy, drop {
        pool_id: address,
    }

    public struct LiquidityAdded has copy, drop {
        pool_id: address,
        amount_x: u64,
        amount_y: u64,
        lp_minted: u64,
    }

    public struct LiquidityRemoved has copy, drop {
        pool_id: address,
        amount_x: u64,
        amount_y: u64,
        lp_burned: u64,
    }

    public struct CircuitBreakerTripped has copy, drop {
        pool_id: address,
        spot_price: u128,
        twap_price: u128,
        deviation_bps: u128,
        paused_until: u64,
    }

    public fun create_pool<X, Y>(ctx: &mut TxContext) {
        let pool = Pool<X, Y> {
            id: object::new(ctx),
            reserve_x: balance::zero<X>(),
            reserve_y: balance::zero<Y>(),
            lp_supply: 0,
            twap_price: 0,
            last_update_ts: 0,
            state: STATE_NORMAL,
            paused_until: 0,
        };
        transfer::share_object(pool);
    }

    public fun add_liquidity<X, Y>(
        pool: &mut Pool<X, Y>,
        coin_x: Coin<X>,
        coin_y: Coin<Y>,
        ctx: &mut TxContext
    ): u64 {
        assert!(pool.state == STATE_NORMAL, EPoolPaused);
        let amount_x = coin::value(&coin_x);
        let amount_y = coin::value(&coin_y);
        assert!(amount_x > 0, EZeroAmount);
        assert!(amount_y > 0, EZeroAmount);

        let lp_to_mint = if (pool.lp_supply == 0) {
            sqrt(amount_x * amount_y)
        } else {
            let reserve_x = balance::value(&pool.reserve_x);
            let reserve_y = balance::value(&pool.reserve_y);
            let lp_from_x = (amount_x as u128) * (pool.lp_supply as u128) / (reserve_x as u128);
            let lp_from_y = (amount_y as u128) * (pool.lp_supply as u128) / (reserve_y as u128);
            let lp = if (lp_from_x < lp_from_y) { lp_from_x } else { lp_from_y };
            (lp as u64)
        };

        assert!(lp_to_mint > 0, EInsufficientLiquidity);

        balance::join(&mut pool.reserve_x, coin::into_balance(coin_x));
        balance::join(&mut pool.reserve_y, coin::into_balance(coin_y));
        pool.lp_supply = pool.lp_supply + lp_to_mint;

        sui::event::emit(LiquidityAdded {
            pool_id: object::uid_to_address(&pool.id),
            amount_x,
            amount_y,
            lp_minted: lp_to_mint,
        });

        lp_to_mint
    }

    public fun remove_liquidity<X, Y>(
        pool: &mut Pool<X, Y>,
        lp_amount: u64,
        ctx: &mut TxContext
    ): (Coin<X>, Coin<Y>) {
        assert!(lp_amount > 0, EZeroAmount);
        assert!(pool.lp_supply > 0, EInsufficientLiquidity);

        let reserve_x = balance::value(&pool.reserve_x);
        let reserve_y = balance::value(&pool.reserve_y);

        let amount_x = (lp_amount as u128) * (reserve_x as u128) / (pool.lp_supply as u128);
        let amount_y = (lp_amount as u128) * (reserve_y as u128) / (pool.lp_supply as u128);

        assert!(amount_x > 0 && amount_y > 0, EInsufficientLiquidity);

        pool.lp_supply = pool.lp_supply - lp_amount;

        let coin_x = coin::from_balance(
            balance::split(&mut pool.reserve_x, (amount_x as u64)),
            ctx
        );
        let coin_y = coin::from_balance(
            balance::split(&mut pool.reserve_y, (amount_y as u64)),
            ctx
        );

        sui::event::emit(LiquidityRemoved {
            pool_id: object::uid_to_address(&pool.id),
            amount_x: (amount_x as u64),
            amount_y: (amount_y as u64),
            lp_burned: lp_amount,
        });

        (coin_x, coin_y)
    }

    public fun reserve_x<X, Y>(pool: &Pool<X, Y>): u64 {
        balance::value(&pool.reserve_x)
    }

    public fun reserve_y<X, Y>(pool: &Pool<X, Y>): u64 {
        balance::value(&pool.reserve_y)
    }

    public fun lp_supply<X, Y>(pool: &Pool<X, Y>): u64 {
        pool.lp_supply
    }

    public fun twap_price<X, Y>(pool: &Pool<X, Y>): u128 {
        pool.twap_price
    }

    public fun state<X, Y>(pool: &Pool<X, Y>): u8 {
        pool.state
    }

    public fun paused_until<X, Y>(pool: &Pool<X, Y>): u64 {
        pool.paused_until
    }

    public fun is_paused<X, Y>(pool: &Pool<X, Y>, clock: &Clock): bool {
        pool.state == STATE_COOLDOWN && clock::timestamp_ms(clock) < pool.paused_until
    }

    public fun state_normal(): u8 { STATE_NORMAL }
    public fun state_cooldown(): u8 { STATE_COOLDOWN }
    public fun threshold_bps(): u128 { THRESHOLD_BPS }
    public fun cooldown_ms(): u64 { COOLDOWN_MS }
    public fun bps_denominator(): u128 { BPS_DENOMINATOR }

    fun sqrt(x: u64): u64 {
        if (x == 0) return 0;
        let mut result = x;
        let mut y = (x + 1) / 2;
        while (y < result) {
            result = y;
            y = (y + x / y) / 2;
        };
        result
    }
}
