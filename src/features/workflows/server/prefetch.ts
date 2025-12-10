import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.workflow.getmany>

// prefetch all workflows utils

export const prefetchWorkflows = (params: Input) => {
    return prefetch(trpc.workflow.getmany.queryOptions(params))
}