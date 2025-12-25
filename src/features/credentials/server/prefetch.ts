import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.credentials.getmany>

// prefetch all credentials utils

export const prefetchCredentials = (params: Input) => {
    return prefetch(trpc.credentials.getmany.queryOptions(params))
}
// prefetch one credentials utils

export const prefetchCredential = (id: string) => {
    return prefetch(trpc.credentials.getOne.queryOptions({ id }))
} 