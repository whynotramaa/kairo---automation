import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.executions.getmany>

// prefetch all executions utils

export const prefetchExecutions = (params: Input) => {
    return prefetch(trpc.executions.getmany.queryOptions(params))
}
// prefetch one executions utils

export const prefetchExecution = (id: string) => {
    return prefetch(trpc.executions.getOne.queryOptions({ id }))
} 