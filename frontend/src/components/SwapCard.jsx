import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { usePool } from '../hooks/usePool';
import { useSwap } from '../hooks/useSwap';

export default function SwapCard() {
  const account = useCurrentAccount();
  const { data: pool } = usePool();
  const { swap, isPending } = useSwap();
  const [amountIn, setAmountIn] = useState('');

  const handleSwap = () => {
    if (!account || !amountIn) return;

    const amountInMist = BigInt(Math.floor(Number(amountIn) * 1e9));
    // 1% slippage
    const minOut = (amountInMist * pool.reserveY / pool.reserveX) * 99n / 100n;

    swap({
      coinObjectId: 'YOUR_COIN_OBJECT_ID', // fetch from wallet
      amountIn: amountInMist,
      minAmountOut: minOut,
      isXtoY: true,
    });
  };

  return (
    <div>
      <p>Spot Price: {pool?.spotPrice.toFixed(6)}</p>
      <p>Reserve X: {pool?.reserveX.toString()}</p>
      <p>Reserve Y: {pool?.reserveY.toString()}</p>
      {pool?.paused && <p style={{color:'red'}}>⚠️ Pool is paused</p>}

      <input
        value={amountIn}
        onChange={e => setAmountIn(e.target.value)}
        placeholder="Amount in"
      />
      <button onClick={handleSwap} disabled={isPending || !account}>
        {isPending ? 'Signing...' : 'Swap'}
      </button>
    </div>
  );
}