"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useImportWorkflow, usePrefetchWorkflow, useRemoveWorkflow, useWorkflows } from "../hooks/use-workflows"
import { useUpgradeModal } from "@/hooks/use-upgrade-mobile";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "@/generated/prisma";
import { PlusIcon, UploadIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRef, useMemo } from "react";
import { toast } from "sonner";
import { getRandomWorkflowIcon } from "@/lib/random-workflow-icon";


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
            grid
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <WorkflowsItem data={workflow} />}
            emptyView={<WorkflowsEmpty />}
        />)
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const router = useRouter()
    const createWorflow = useCreateWorkflow()
    const importWorkflow = useImportWorkflow()
    const { handleError, modal } = useUpgradeModal()
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)

                if (!json.nodes || !Array.isArray(json.nodes) || !json.edges || !Array.isArray(json.edges)) {
                    toast.error("Invalid workflow JSON: must have nodes and edges arrays")
                    return
                }

                importWorkflow.mutate(
                    {
                        name: json.name || file.name.replace(".json", ""),
                        nodes: json.nodes,
                        edges: json.edges,
                    },
                    {
                        onSuccess: (data) => {
                            router.push(`/workflows/${data.id}`)
                        },
                        onError: (error) => {
                            handleError(error)
                        }
                    }
                )
            } catch {
                toast.error("Invalid JSON file")
            }
        }
        reader.readAsText(file)
        e.target.value = ""
    }

    return (
        <>
            {modal}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
            />
            <div className="flex flex-row items-center justify-between gap-x-4 pb-1 border-b border-border/10">
                <div className="flex flex-col gap-y-0.5">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/90">Workflows</h1>
                    <p className="text-xs md:text-sm text-muted-foreground/80 font-normal">Create and manage your workflows</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full font-semibold border-border/40 hover:bg-secondary active:scale-[0.98] transition-all text-xs px-4"
                        isLoading={importWorkflow.isPending}
                        disabled={disabled}
                        onClick={handleImportClick}
                    >
                        {!importWorkflow.isPending && <UploadIcon className="size-3.5 mr-1" />}
                        Import JSON
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-full font-semibold hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs px-4 shadow-xs"
                        isLoading={createWorflow.isPending}
                        disabled={disabled}
                        onClick={handleCreate}
                    >
                        {!createWorflow.isPending && <PlusIcon className="size-3.5 mr-1" />}
                        New Workflow
                    </Button>
                </div>
            </div>
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
                isCreating={createWorflow.isPending}
                title="No workflows yet"
                actionLabel="New Workflow"
                message="Create your first workflow to start automating tasks."
            />
        </>
    )
}

export const WorkflowsItem = ({ data }: { data: Workflow }) => {
    const removeWorkflow = useRemoveWorkflow()
    const prefetchWorkflow = usePrefetchWorkflow()
    const Icon = useMemo(() => getRandomWorkflowIcon(), [data.id]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <EntityItem
            href={`/workflows/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <Icon className="size-5 text-primary" />
                </div>
            }
            onRemove={() => removeWorkflow.mutate({ id: data.id })}
            isRemoving={removeWorkflow.isPending}
            onMouseEnter={() => prefetchWorkflow(data.id)}
        />
    )
}