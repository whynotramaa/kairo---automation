import { Editor } from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface PageProps {
    params: Promise<{
        workflowId: string;
    }>
}

const Page = async ({ params }: PageProps) => {
    await requireAuth()

    const { workflowId } = await params;
    await prefetchWorkflow(workflowId)

    return (
        <HydrateClient>
            <EditorHeader workflowId={workflowId} />
            <main className="flex-1">
                <Editor workflowId={workflowId} />
            </main>
        </HydrateClient>
    )
}

export default Page