"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useRemoveWorkflow, useWorkflows } from "../hooks/use-workflows"
import { useUpgradeModal } from "@/hooks/use-upgrade-mobile";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "@/generated/prisma";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";


export const WorkflowsSearch = () => {
    const [params, setParams] = useWorkflowsParams();

    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams })

    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Workflows"
        />
    )
}

export const WorkflowsList = () => {
    const workflows = useWorkflows();

    if (workflows.data?.items.length == 0) {
        return (
            <WorkflowsEmpty />
        )
    }

    if (workflows.isLoading && !workflows.data) {
        return <WorkflowsLoading />
    }

    if (workflows.isError) {
        return <WorkflowsError />
    }

    if (!workflows.data) {
        return <WorkflowsLoading />
    }
    // When changing pages/search, keepPreviousData keeps the old page in place.
    if (workflows.isFetching && workflows.isPlaceholderData) {
        return <WorkflowsLoading />
    }

    return (
        <EntityList
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <p>{<WorkflowsItem data={workflow} />}</p>}
            emptyView={<WorkflowsEmpty />}
        />)
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

export const WorkflowsPagination = () => {
    const workflows = useWorkflows()
    const [params, setParams] = useWorkflowsParams()

    const page = workflows.data?.page ?? params.page
    const totalPages = workflows.data?.totalPages ?? 0

    return (
        <EntityPagination
            disabled={workflows.isFetching || workflows.isLoading}
            isLoading={workflows.isFetching || workflows.isLoading}
            totalPages={totalPages}
            page={page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )

}

export const WorkflowsContainer = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <EntityContainer header={<WorkflowsHeader />} search={<WorkflowsSearch></WorkflowsSearch>} pagination={<WorkflowsPagination></WorkflowsPagination>} >
            {children}
        </EntityContainer>
    )
}


export const WorkflowsLoading = () => {
    return <LoadingView entity="workflows" />
}

export const WorkflowsError = () => {
    return <ErrorView entity="Error loading workflows" />
}

export const WorkflowsEmpty = () => {
    const router = useRouter()

    const createWorflow = useCreateWorkflow()
    const { handleError, modal } = useUpgradeModal()

    const handleCreate = () => {
        createWorflow.mutate(undefined, {
            onError: (error) => {
                handleError(error)
            },
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            }
        })
    }

    return (
        <>
            {modal}
            <EmptyView
                onNew={handleCreate}
                title="No workflows yet"
                actionLabel="Create workflow"
                message="Create your first workflow to start automating tasks."
            />
        </>
    )
}

export const WorkflowsItem = ({
    data
}: { data: Workflow }) => {

    const removeWorkflow = useRemoveWorkflow()
    const handleRemove = () => {
        removeWorkflow.mutate({ id: data.id })

    }

    return (
        <EntityItem
            href={`/workflows/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })} {" "}
                    &bull; Created {formatDistanceToNow(data.createdAt, { addSuffix: true })} {" "}

                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <WorkflowIcon className="size-5 text-muted-foreground" />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeWorkflow.isPending}
        />
    )
}