import { useState } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { useRemoveLiquidity } from '../hooks/useRemoveLiquidity';
import { PACKAGE_ID } from '../utils/constants';

export default function RemoveLiquidityCard() {
  const account = useCurrentAccount();
  const { removeLiquidity, isPending } = useRemoveLiquidity();
  const [lpAmount, setLpAmount] = useState('');

  const lpCoinType = `${PACKAGE_ID}::pool::LPCoin`;
  
  const { data: lpCoins } = useSuiClientQuery('getCoins', {
    owner: account?.address || '',
    coinType: lpCoinType,
  }, { enabled: !!account });

  const handleRemoveLiquidity = () => {
    if (!account || !lpAmount) return;
    
    const lpCoinObjectId = lpCoins?.data[0]?.coinObjectId;
    if (!lpCoinObjectId) {
      alert("No valid LP tokens found in your connected wallet.");
      return;
    }

    removeLiquidity({
      lpCoinObjectId,
      lpAmount: rawLpAmount,
      onSuccess: () => {
        setLpAmount('');
        alert('Liquidity withdrawn successfully!');
      }
    });
  };

  return (
    <div className="w-full max-w-[380px] bg-[#131316] border border-[#222226] rounded-2xl p-7 flex flex-col justify-between">
      <h3 className="text-white text-[0.85rem] font-semibold uppercase tracking-wider mb-6">
        Withdraw Liquidity
      </h3>

      <div className="bg-[#0b0b0d] border border-[#1c1c21] rounded-xl p-3 mb-4">
        <label className="text-[#555560] text-[0.65rem] font-bold uppercase block mb-1">
          Burn Amount
        </label>
        <div className="flex justify-between items-center">
          <input
            type="number"
            value={lpAmount}
            onChange={(e) => setLpAmount(e.target.value)}
            placeholder="0.00"
            disabled={!account}
            className="bg-transparent border-0 text-white text-lg font-medium outline-none w-[70%] focus:ring-0 p-0"
          />
          <span className="text-[#888896] text-[0.85rem] font-semibold tracking-wide">
            LP TOKENS
          </span>
        </div>
      </div>

      <button
        onClick={handleRemoveLiquidity}
        disabled={isPending || !account || !lpAmount}
        className="w-full bg-[#252529] border border-[#303035] rounded-xl text-[#e4e4e7] text-xs font-semibold tracking-wider uppercase p-4 mt-4 transition-all duration-200 opacity-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1c1c1f]"
      >
        {isPending ? 'Burning LP Tokens...' : 'Remove Liquidity →'}
      </button>
    </div>
  );
}