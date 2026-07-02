module circuit_breaker_amm::oracle {
    
    public struct PriceOracle has key, store {
        id: UID,
        price: u64, 
    }
    fun init(ctx: &mut TxContext) {
        sui::transfer::share_object(PriceOracle {
            id: object::new(ctx),
            price: 1_000_000_000, // Normalized default reference price at 1.0
        });
    }

    public fun get_reference_price(oracle: &PriceOracle): u64 {
        oracle.price
    }

    public entry fun update_price(oracle: &mut PriceOracle, new_price: u64, _ctx: &mut TxContext) {
        oracle.price = new_price;
    }
}
