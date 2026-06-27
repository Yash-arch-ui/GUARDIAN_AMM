import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useQueryClient} from "@tanstack/react-query";
import {buildSwapTx} from "../utils/transactions";

export function useSwap(){
    const {mutate: signAndExecute, isPending} = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    const swap =({coinObjectId, amountIn, minAmountOut, isXtoY,onSuccess}) => {
        const tx = buildSwapTx({ coinObjectId, amountIn, minAmountOut, isXtoY});

        signAndExecute({
            transaction: tx
        },
         {
        onSuccess: (result) => {
          console.log('Swap digest:', result.digest);
          // Invalidate pool cache → triggers refetch
          queryClient.invalidateQueries({ queryKey: ['pool'] });
          onSuccess?.(result);
        },
        onError: (err) => console.error('Swap failed:', err),
      }
    );
    };
    return {swap, isPending};
}