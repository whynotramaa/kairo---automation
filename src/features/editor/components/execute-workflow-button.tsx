import { Button } from "@/components/ui/button"
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows"
import { FlaskConicalIcon } from "lucide-react"

export const ExecuteWorkflowBtn = ({ workflowId }: { workflowId: string }) => {
    const executeWorkflow = useExecuteWorkflow();

    const handleExecute = () => {
        executeWorkflow.mutate({ id: workflowId })
    }

    return (
        <Button size="lg" isLoading={executeWorkflow.isPending} onClick={handleExecute}>
            {!executeWorkflow.isPending && <FlaskConicalIcon className="size-4" />}
            Execute Workflow
        </Button>
    )
}