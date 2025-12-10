"use client"

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows"
import { useUpgradeModal } from "@/hooks/use-upgrade-mobile";
import { useRouter } from "next/navigation";

export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <p>
            {JSON.stringify(workflows.data, null, 2)}
        </p>
    )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const router = useRouter()
    const createWorflow = useCreateWorkflow()
    const { handleError, modal } = useUpgradeModal()

    const handleCreate = () => {
        createWorflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            },
            onError: (error) => {
                console.error(error)
                handleError(error)
            }
        })
    }


    return (
        <>
            {modal}
            <EntityHeader
                title="Workflows"
                description="Create and manage your workflows"
                onNew={() => { handleCreate() }}
                newBtnLabel="New Workflow"
                disabled={disabled}
                isCreating={createWorflow.isPending}
            />
        </>
    )
}

export const WorkflowsContainer = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <EntityContainer header={<WorkflowsHeader />} search={<></>} pagination={<></>} >
            {children}
        </EntityContainer>
    )
}

