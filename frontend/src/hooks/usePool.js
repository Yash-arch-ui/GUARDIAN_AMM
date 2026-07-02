import { useSuiClient } from "@mysten/dapp-kit";
import { POOL_ID } from "../utils/constants";
import { useQuery } from "@tanstack/react-query";

export function usePool() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['pool', POOL_ID],
    queryFn: async () => {
      const obj = await client.getObject({
        id: POOL_ID,
        options: { showContent: true },
      });
      
      console.log("raw pool object:", obj);
      
      const fields = obj.data?.content?.fields;
      console.log(" EXACT FIELDS DATA:", JSON.stringify(fields, null, 2));
            if (!fields) {
        console.log("No fields found yet.....");
        return null;
      }
      
      const rawReserveX = fields.balance_x?.fields?.value ?? fields.balance_x ?? 0;
      const rawReserveY = fields.balance_y?.fields?.value ?? fields.balance_y ?? 0;
      const rawLpSypply = fields.lp_supply?.fields?.value ?? fields.lp_supply ?? 0;
      const resX = Number(rawReserveX);
      const resY = Number(rawReserveY);
      const computedSpotPrice = resX > 0 ? resY / resX : 0;

      return {
        balance_x: BigInt(rawReserveX),
        balance_y: BigInt(rawReserveY),
        lpSupply: BigInt(rawLpSypply),
        spotPrice: computedSpotPrice,
      };
      
    },
    refetchInterval: 5000, 
  });
}