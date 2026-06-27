import {Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, POOL_ID, COIN_X_TYPE, COIN_Y_TYPE } from './constants';

// Build a swap transaction
export function buildSwapTx({coinObjectId, amountIn, minAmountOut, isXtoY}){
    const tx = new Transaction();
    const [splitCoin]= tx.splitCoins(tx.object(coinObjectId),[amountIn]);
    tx.moveCall({
        target: `${PACKAGE_ID}::amm::swap`,   // module::function
    typeArguments: isXtoY
      ? [COIN_X_TYPE, COIN_Y_TYPE]
      : [COIN_Y_TYPE, COIN_X_TYPE],
    arguments: [
      tx.object(POOL_ID),   // &mut Pool
      splitCoin,            // coin in
      tx.pure.u64(minAmountOut), // slippage floor
      tx.object('0x6'),     // Clock object (required for TWAP)
    ],
    });
    return tx;

    // Add liquidity 
    export function buildAddLiquidityTx({coinXId, coinYId,amountX,amountY}){
        const tx= new Transaction();
        const [splitX] = tx.splitCoins(tx.object(coinXId), [amountX]);
        const [splitY] = tx.splitCoins(tx.object(coinYId), [amountY]);

      tx.moveCall({
       target: `${PACKAGE_ID}::amm::add_liquidity`,
       typeArguments: [COIN_X_TYPE, COIN_Y_TYPE],
       arguments: [tx.object(POOL_ID), splitX, splitY],
  });

  return tx;
    }
}