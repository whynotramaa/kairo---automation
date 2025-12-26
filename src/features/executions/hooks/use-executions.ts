
import { useTRPC } from "@/trpc/client"
import { keepPreviousData, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useExecutionsParams } from "./use-executions-params"


// hook to fetch all credentials
// Use non-suspense query + keepPreviousData so pagination/search doesn't
// blank the whole UI while the next page loads.
export const useExecutionsList = () => {
    const trpc = useTRPC()
    const [params] = useExecutionsParams()

    return useQuery({
        ...trpc.executions.getmany.queryOptions(params),
        placeholderData: keepPreviousData,
    })
}


// suspense hook to fetch a single execution
export const useSuspenseExecutions = (id: string) => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }))
}

// hook to prefetch a single execution (for hover prefetch)
export const usePrefetchExecutions = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useCallback((id: string) => {
        queryClient.prefetchQuery(trpc.executions.getOne.queryOptions({ id }))
    }, [queryClient, trpc])
}

// non-suspense hook to fetch a single execution (uses cached data)
export const useExecutions = (id: string) => {
    const trpc = useTRPC()
    return useQuery({
        ...trpc.executions.getOne.queryOptions({ id }),
        placeholderData: keepPreviousData,
        enabled: !!id, // prevent fetch when id is empty
    })
}

