import { useState } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { useAddLiquidity } from '../hooks/useAddLiquidity';
import { COIN_X_TYPE, COIN_Y_TYPE } from '../utils/constants';

export default function AddLiquidityCard() {
  const account = useCurrentAccount();
  const { addLiquidity, isPending } = useAddLiquidity();

  const [amountX, setAmountX] = useState('');
  const [amountY, setAmountY] = useState('');
  
  const { data: coinsX, refetch: refetchX } = useSuiClientQuery('getCoins', {
    owner: account?.address || '',
    coinType: COIN_X_TYPE,
  }, { enabled: !!account });

  const { data: coinsY, refetch: refetchY } = useSuiClientQuery('getCoins', {
    owner: account?.address || '',
    coinType: COIN_Y_TYPE,
  }, { enabled: !!account });

  const balanceX = coinsX?.data?.[0]?.balance 
    ? (Number(coinsX.data[0].balance) / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2 }) 
    : '0.00';

  const balanceY = coinsY?.data?.[0]?.balance 
    ? (Number(coinsY.data[0].balance) / 1e9).toLocaleString(undefined, { minimumFractionDigits: 2 }) 
    : '0.00';

  const handleAddLiquidity = () => {
    if (!account || !amountX || !amountY) return;

    const coinXObjectId = coinsX?.data?.[0]?.coinObjectId;
    const coinYObjectId = coinsY?.data?.[0]?.coinObjectId;

    if (!coinXObjectId || !coinYObjectId) {
      alert("Insufficient asset objects found in your wallet for this pool.");
      return;
    }
    console.log(" CHECKING INPUTS:", { 
       coinXObjectId, 
       coinYObjectId, 
       amountX,
       amountY,
    });

    addLiquidity({
      coinXObjectId,
      coinYObjectId,
      amountX,
      amountY,
      onSuccess: () => {
        setAmountX('');
        setAmountY('');
        refetchX();
        refetchY();
      }
    });
  };

  return (
    <div className="w-full max-w-[380px] bg-[#131316] border border-[#222226] rounded-2xl p-7 flex flex-col justify-between">
      <h3 className="text-white text-[0.85rem] font-semibold uppercase tracking-wider mb-6">
        Deposit Liquidity
      </h3>
      
      <div>
        <div className="bg-[#0b0b0d] border border-[#1c1c21] rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[#555560] text-[0.65rem] font-bold uppercase block">
              Pool Supply (Asset X)
            </label>
            <span className="text-[#888896] text-[0.70rem] font-medium">
              Max: {balanceX}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={amountX}
              onChange={(e) => setAmountX(e.target.value)}
              placeholder="0.00"
              disabled={!account}
              className="bg-transparent border-0 text-white text-lg font-medium outline-none w-[70%] focus:ring-0 p-0"
            />
            <span className="text-[#888896] text-[0.85rem] font-semibold tracking-wide">
              COIN X
            </span>
          </div>
        </div>

        <div className="bg-[#0b0b0d] border border-[#1c1c21] rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[#555560] text-[0.65rem] font-bold uppercase block">
              Pool Supply (Asset Y)
            </label>
            <span className="text-[#888896] text-[0.70rem] font-medium">
              Max: {balanceY}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={amountY}
              onChange={(e) => setAmountY(e.target.value)}
              placeholder="0.00"
              disabled={!account}
              className="bg-transparent border-0 text-white text-lg font-medium outline-none w-[70%] focus:ring-0 p-0"
            />
            <span className="text-[#888896] text-[0.85rem] font-semibold tracking-wide">
              COIN Y
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleAddLiquidity} 
        disabled={isPending || !account || !amountX || !amountY}
        className="w-full bg-[#252529] border border-[#303035] rounded-xl text-[#e4e4e7] text-xs font-semibold tracking-wider uppercase p-4 mt-4 transition-all duration-200 opacity-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1c1c1f]"
      >
        {isPending ? 'Supplying Assets...' : 'Supply Liquidity →'}
      </button>
    </div>
  );
}