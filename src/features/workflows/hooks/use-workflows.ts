
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"


// hook to fetch all workflows --- using suspense
export const useSuspenseWorkflows = () => {
    const trpc = useTRPC()

    return useSuspenseQuery(trpc.workflow.getmany.queryOptions())
}


// hook to create new workflow

export const useCreateWorkflow = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.workflow.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}" created !`)
            queryClient.invalidateQueries(
                trpc.workflow.getmany.queryOptions()
            )
        },
        onError: (error) => {
            toast.error(`Failed to create workflow ${error.message}`)
        }
    }))

}