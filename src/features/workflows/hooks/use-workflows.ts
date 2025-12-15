
import { useTRPC } from "@/trpc/client"
import { keepPreviousData, useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { toast } from "sonner"
import { useWorkflowsParams } from "./use-workflows-params"


// hook to fetch all workflows
// Use non-suspense query + keepPreviousData so pagination/search doesn't
// blank the whole UI while the next page loads.
export const useWorkflows = () => {
    const trpc = useTRPC()

    const [params] = useWorkflowsParams()

    return useQuery({
        ...trpc.workflow.getmany.queryOptions(params),
        placeholderData: keepPreviousData,
    })
}


// hook to create new workflow

export const useCreateWorkflow = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.workflow.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}" created !`)
            queryClient.invalidateQueries(
                trpc.workflow.getmany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create workflow ${error.message}`)
        }
    }))

}
// hook to remove a workflow

export const useRemoveWorkflow = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.workflow.remove.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}" removed !`)
            queryClient.invalidateQueries(
                trpc.workflow.getmany.queryOptions({})
            );
            queryClient.invalidateQueries(
                trpc.workflow.getOne.queryFilter({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to create workflow ${error.message}`)
        }
    }))

}

export const useSuspenseWorkflow = (id: string) => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.workflow.getOne.queryOptions({ id }))
}

// hook to prefetch a single workflow (for hover prefetch)
export const usePrefetchWorkflow = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useCallback((id: string) => {
        queryClient.prefetchQuery(trpc.workflow.getOne.queryOptions({ id }))
    }, [queryClient, trpc])
}

// non-suspense hook to fetch a single workflow (uses cached data)
export const useWorkflow = (id: string) => {
    const trpc = useTRPC()
    return useQuery({
        ...trpc.workflow.getOne.queryOptions({ id }),
        placeholderData: keepPreviousData,
    })
}

// hook to update workflow name

export const useUpdateWorkflowName = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.workflow.updateName.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}" updated !`)
            queryClient.invalidateQueries(
                trpc.workflow.getmany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.workflow.getOne.queryOptions({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to update workflow ${error.message}`)
        }
    }))

}