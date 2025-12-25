
import { useTRPC } from "@/trpc/client"
import { keepPreviousData, useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { toast } from "sonner"
import { useCredentialsParams } from "./use-credentials-params"
import { CredentialType } from "@/generated/prisma"


// hook to fetch all credentials
// Use non-suspense query + keepPreviousData so pagination/search doesn't
// blank the whole UI while the next page loads.
export const useCredentialsList = () => {
    const trpc = useTRPC()
    const [params] = useCredentialsParams()

    return useQuery({
        ...trpc.credentials.getmany.queryOptions(params),
        placeholderData: keepPreviousData,
    })
}


// hook to create new credentials
export const useCreateCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.credentials.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Credential "${data.name}" created!`)
            queryClient.invalidateQueries(
                trpc.credentials.getmany.queryOptions({})
            )
        },
        onError: (error) => {
            toast.error(`Failed to create credential: ${error.message}`)
        }
    }))
}

// hook to remove a credential
export const useRemoveCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.credentials.remove.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Credential "${data.name}" removed!`)
            queryClient.invalidateQueries(
                trpc.credentials.getmany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.credentials.getOne.queryFilter({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to remove credential: ${error.message}`)
        }
    }))
}

// suspense hook to fetch a single credential
export const useSuspenseCredential = (id: string) => {
    const trpc = useTRPC()
    return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }))
}

// hook to prefetch a single credential (for hover prefetch)
export const usePrefetchCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useCallback((id: string) => {
        queryClient.prefetchQuery(trpc.credentials.getOne.queryOptions({ id }))
    }, [queryClient, trpc])
}

// non-suspense hook to fetch a single credential (uses cached data)
export const useCredential = (id: string) => {
    const trpc = useTRPC()
    return useQuery({
        ...trpc.credentials.getOne.queryOptions({ id }),
        placeholderData: keepPreviousData,
        enabled: !!id, // prevent fetch when id is empty
    })
}

// hook to update credential
export const useUpdateCredential = () => {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    return useMutation(trpc.credentials.update.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Credential "${data.name}" saved!`)
            queryClient.invalidateQueries(
                trpc.credentials.getmany.queryOptions({})
            )
            queryClient.invalidateQueries(
                trpc.credentials.getOne.queryOptions({ id: data.id })
            )
        },
        onError: (error) => {
            toast.error(`Failed to save credential: ${error.message}`)
            console.error(error)
        }
    }))
}

// hook to fetch credentials by type
export const useCredentialsByType = (type: CredentialType) => {
    const trpc = useTRPC()

    return useQuery({
        ...trpc.credentials.getByType.queryOptions({ type }),
        enabled: !!type, // prevent fetch when type is undefined
    })
}