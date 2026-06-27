import {useSuiClient, useQuery} from "@mysten/dapp-kit";
import {POOL_ID} from "../utils/constants";

export function usePool(){
    const client = useSuiClient();
    return useQuery({
        queryKey:['pool',POOL_ID],
        queryFn: async() => {
            const obj = await client.getObject({
                id:POOL_ID,
                options:{showContent: true},
            });

            const field = obj.data.content.fields;
        return {
        reserveX:   BigInt(fields.reserve_x),
        reserveY:   BigInt(fields.reserve_y),
        spotPrice:  Number(fields.reserve_y) / Number(fields.reserve_x),
        twap:       BigInt(fields.last_price_cumulative),
        paused:     fields.paused,
        cooldown:   Number(fields.last_swap_timestamp),
        lpSupply:   BigInt(fields.lp_supply?.fields?.value ?? 0),
      };
        },
              refetchInterval: 5000,

    });
}