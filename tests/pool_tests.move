#[test_only]
module circuit_breaker_amm::pool_tests {

    use circuit_breaker_amm::pool;
    use sui::test_scenario;
    use sui::coin;
    use sui::sui::SUI;
    use sui::clock::Clock;

    public struct USDC has drop {}

    #[test]
    fun test_create_pool_add_liquidity() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        // Create pool
        test_scenario::next_tx(&mut scenario, user);
        {
            pool::create_pool<SUI, USDC>(
                test_scenario::ctx(&mut scenario)
            );
        };

        // Add liquidity
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut p =
                test_scenario::take_shared<
                    pool::Pool<SUI, USDC>
                >(&scenario);
            let clock = sui::clock::create_for_testing(test_scenario::ctx(&mut scenario));

            let coin_x = coin::mint_for_testing<SUI>(
                1000,
                test_scenario::ctx(&mut scenario)
            );

            let coin_y = coin::mint_for_testing<USDC>(
                2000,
                test_scenario::ctx(&mut scenario)
            );

            let lp = pool::add_liquidity(
                &mut p,
                coin_x,
                coin_y,
                &clock,
                test_scenario::ctx(&mut scenario)
            );

            assert!(lp > 0, 0);
            assert!(pool::reserve_x(&p) == 1000, 1);
            assert!(pool::reserve_y(&p) == 2000, 2);
            assert!(pool::lp_supply(&p) == lp, 3);

            test_scenario::return_shared(p);
            sui::clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_remove_liquidity() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);

        // Create pool
        test_scenario::next_tx(&mut scenario, user);
        {
            pool::create_pool<SUI, USDC>(
                test_scenario::ctx(&mut scenario)
            );
        };

        // Add liquidity and remove it
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut p =
                test_scenario::take_shared<
                    pool::Pool<SUI, USDC>
                >(&scenario);

            // Create the clock properly at the start of the block
            let clock = sui::clock::create_for_testing(test_scenario::ctx(&mut scenario));

            let coin_x = coin::mint_for_testing<SUI>(
                1000,
                test_scenario::ctx(&mut scenario)
            );

            let coin_y = coin::mint_for_testing<USDC>(
                1000,
                test_scenario::ctx(&mut scenario)
            );

            let lp = pool::add_liquidity(
                &mut p,
                coin_x,
                coin_y,
                &clock,
                test_scenario::ctx(&mut scenario)
            );

            let (out_x, out_y) = pool::remove_liquidity(
                &mut p,
                lp,
                &clock,
                test_scenario::ctx(&mut scenario)
            );

            assert!(coin::value(&out_x) > 0, 4);
            assert!(coin::value(&out_y) > 0, 5);

            coin::burn_for_testing(out_x);
            coin::burn_for_testing(out_y);
            
            // Clean up resources safely
            test_scenario::return_shared(p);
            sui::clock::destroy_for_testing(clock);
        };

        test_scenario::end(scenario);
    }
}