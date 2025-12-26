import { useQueryStates } from "nuqs";
import { executionsParams } from "../params";


export const useExecutionsParams = () => {
    // Keep pagination/search updates client-side (no route navigation / RSC refresh)
    // while still reflecting state in the URL.
    return useQueryStates(executionsParams, {
        history: "push",
        shallow: true,
        scroll: false,
    })
}