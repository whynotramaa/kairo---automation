import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params";


export const useWorkflowsParams = () => {
    // Keep pagination/search updates client-side (no route navigation / RSC refresh)
    // while still reflecting state in the URL.
    return useQueryStates(workflowsParams, {
        history: "push",
        shallow: true,
        scroll: false,
    })
}