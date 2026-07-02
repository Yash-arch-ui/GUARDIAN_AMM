import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { buildSwapTx } from "../utils/transactions";

export function useSwap() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const swap = ({ coinObjectId, amountIn, minAmountOut, isXtoY, onSuccess }) => {
    console.log("swap() entered");
    const tx = buildSwapTx({ coinObjectId, amountIn, minAmountOut, isXtoY });
    console.log("Transaction built:", tx)
    conosole.log("Calling sign and execute with transaction:", tx);
    signAndExecute(
      {
        transaction: tx,},
      {onSuccess: (result) => {
          console.log('Swap digest:', result.digest);
          queryClient.invalidateQueries({ queryKey: ['pool'] });  
          onSuccess?.(result);
          console.log("SUCCESS");
        },
        onError: (err) => {
          console.error('Swap execution failed:', err);
        },
      }
    );
  };

  return { swap, isPending };
}