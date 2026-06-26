#[test_only]
module circuit_breaker_amm::attacker_tests {
    use sui::test_scenario;
    use sui::coin;
    use sui::clock;
    use std::debug;
    use std::string::utf8; // Fixes: Unbound function 'utf8'
    use circuit_breaker_amm::pool::{Self, Pool};

    // Mock coins for testing
    public struct TEST_X has drop {}
    public struct TEST_Y has drop {}

    #[test] // Fixes: Unexpected '[' error
    fun test_twap_manipulation_attack() {
        let mut scenario_val = test_scenario::begin(@0xB0B); // Attacker address
        let scenario = &mut scenario_val;
        
        let mut clock = clock::create_for_testing(test_scenario::ctx(scenario));
        
        pool::create_pool<TEST_X, TEST_Y>(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, @0xB0B);
        
        let mut pool_obj = test_scenario::take_shared<Pool<TEST_X, TEST_Y>>(scenario);
        let coin_x = coin::mint_for_testing<TEST_X>(10_000_000, test_scenario::ctx(scenario));
        let coin_y = coin::mint_for_testing<TEST_Y>(10_000_000, test_scenario::ctx(scenario));
        
        pool::add_liquidity(&mut pool_obj, coin_x, coin_y, &clock, test_scenario::ctx(scenario));
        
        let initial_twap = pool::twap_price(&pool_obj);
        
        debug::print(&utf8(b"=== INITIAL TWAP ==="));
        debug::print(&initial_twap);
        
        // Added explicit type 'u64' to clean up literal type warnings
        let mut i: u64 = 0; 
        
        // Added spaces around '<' so the parser doesn't get confused
        while (i < 5) { 
            // Fixes: changed ctz to ctx
            let attacker_coin = coin::mint_for_testing<TEST_X>(100_000, test_scenario::ctx(scenario)); 
            
            // Fixes: changed single colon (pool:) to double colon (pool::)
            let received_y = pool::swap_x_for_y(
                &mut pool_obj, 
                attacker_coin, 
                0, 
                &clock, 
                test_scenario::ctx(scenario)
            );
                        coin::burn_for_testing(received_y); // Fixes: Added missing semicolon
            sui::clock::increment_for_testing(&mut clock, 60_000); // Advance clock by 60 seconds.
            i = i + 1;
        };

        let final_twap = pool::twap_price(&pool_obj);
        
        debug::print(&utf8(b"=== FINAL TWAP ==="));
        debug::print(&final_twap);
        
        assert!(final_twap > initial_twap, 1);

        test_scenario::return_shared(pool_obj);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario_val);
    }
}