import { useQueryStates } from "nuqs";
import { credentialsParams } from "../params";


export const useCredentialsParams = () => {
    // Keep pagination/search updates client-side (no route navigation / RSC refresh)
    // while still reflecting state in the URL.
    return useQueryStates(credentialsParams, {
        history: "push",
        shallow: true,
        scroll: false,
    })
}