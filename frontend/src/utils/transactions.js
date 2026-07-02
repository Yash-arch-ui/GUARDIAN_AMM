// src/utils/transaction.js
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, ORACLE_SHARED_OBJ_ID, POOL_ID, COIN_X_TYPE, COIN_Y_TYPE } from './constants';
const toMist = (amount) => BigInt(Math.floor(Number(amount) * 1_000_000_000));

export function buildSwapTx({ coinObjectId, amountIn, minAmountOut, isXtoY }) {
  const tx = new Transaction();
    const amountInMist = toMist(amountIn);
      const minOutMist = toMist(minAmountOut);
  const [splitCoin] = tx.splitCoins(tx.object(coinObjectId), tx.pure.u64(amountInMist));
  
  tx.moveCall({
    target: isXtoY 
      ? `${PACKAGE_ID}::swap::swap_x_to_y` 
      : `${PACKAGE_ID}::swap::swap_y_to_x`,
    typeArguments: isXtoY ? [COIN_X_TYPE, COIN_Y_TYPE] : [COIN_Y_TYPE, COIN_X_TYPE],
    arguments: [
      tx.object(POOL_ID),// pool id 
      splitCoin,// COIN TO SWAP
      tx.pure.u64(toMist(minAmountOut)),
      tx.object(ORACLE_SHARED_OBJ_ID),// oracle feed id
    ],
  });
  
  return tx;
} 

export function buildAddLiquidityTx({ coinXObjectId, coinYObjectId, amountX, amountY }) {
  const tx = new Transaction();
  
  const [splitX] = tx.splitCoins(tx.object(coinXObjectId), tx.pure.u64(toMist(amountX)));
  const [splitY] = tx.splitCoins(tx.object(coinYObjectId), tx.pure.u64(toMist(amountY)));

  tx.moveCall({
    target: `${PACKAGE_ID}::pool::add_liquidity`, 
    typeArguments: [COIN_X_TYPE, COIN_Y_TYPE],
    arguments: [
      tx.object(POOL_ID), 
      splitX, 
      splitY
    ],
  });

  return tx;
}
export function buildRemoveLiquidityTx({ lpCoinObjectId, lpAmount }) {
  const tx = new Transaction();
  
  const [splitLP] = tx.splitCoins(tx.object(lpCoinObjectId), tx.pure.u64(toMist(lpAmount)));

  tx.moveCall({
    target: `${PACKAGE_ID}::pool::remove_liquidity`,
    typeArguments: [COIN_X_TYPE, COIN_Y_TYPE],
    arguments: [
      tx.object(POOL_ID), 
      splitLP
    ],
  });
  
  return tx;
}