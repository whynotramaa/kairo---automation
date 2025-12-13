import { WorkflowsContainer, WorkflowsList } from "@/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils"
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    searchParams: Promise<SearchParams>
}

const Page = async ({ searchParams }: Props) => {
    const params = await workflowsParamsLoader(searchParams)
    await requireAuth();
    await prefetchWorkflows(params);
    return (
        <HydrateClient>
            <WorkflowsContainer>
                <ErrorBoundary fallback={<p>Error !!!</p>}>
                    <WorkflowsList />
                </ErrorBoundary>
            </WorkflowsContainer>
        </HydrateClient>
    )
}

export default Page