"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, ErrorView, LoadingView } from "@/components/entity-components";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { Execution, ExecutionStatus } from "@/generated/prisma";
import { CheckCircle2Icon, Clock8Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useExecutionsList } from "../hooks/use-executions";


export const ExecutionsList = () => {
    const executions = useExecutionsList();

    if (executions.data?.items.length == 0) {
        return (
            <ExecutionsEmpty />
        )
    }

    if (executions.isLoading && !executions.data) {
        return <ExecutionsLoading />
    }

    if (executions.isError) {
        return <ExecutionsError />
    }

    if (!executions.data) {
        return <ExecutionsLoading />
    }
    // When changing pages/search, keepPreviousData keeps the old page in place.
    if (executions.isFetching && executions.isPlaceholderData) {
        return <ExecutionsLoading />
    }

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(credential) => <ExecutionsItem data={credential} />}
            emptyView={<ExecutionsEmpty />}
        />)
}

export const ExecutionsHeader = () => {
    return (
        <EntityHeader
            title="Executions"
            description="View your workflow execution history"
        />
    )
}

export const ExecutionsPagination = () => {
    const executions = useExecutionsList()
    const [params, setParams] = useExecutionsParams()

    const page = executions.data?.page ?? params.page
    const totalPages = executions.data?.totalPages ?? 0

    return (
        <EntityPagination
            disabled={executions.isFetching || executions.isLoading}
            isLoading={executions.isFetching || executions.isLoading}
            totalPages={totalPages}
            page={page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const ExecutionsContainer = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination></ExecutionsPagination>} >
            {children}
        </EntityContainer>
    )
}


export const ExecutionsLoading = () => {
    return <LoadingView entity="executions" />
}

export const ExecutionsError = () => {
    return <ErrorView entity="Error loading executions" />
}

export const ExecutionsEmpty = () => {

    return (
        <EmptyView
            message="your haven't started any executions yet. Get started by running your first workflow."
        />
    )
}

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600" />
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-600 animate-spin" />
        case ExecutionStatus.CANCELLED:
            return <XCircleIcon className="size-5 text-amber-600" />
        default:
            return <Clock8Icon className="size-5 text-muted-foreground" />
    }
}


const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
}


export const ExecutionsItem = ({
    data
}: { data: Execution & { workflow: { id: string; name: string; } } }) => {

    const duration = data.completedAt
        ? Math.round(
            (new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000
        )
        : null

    const subtitle = (
        <>
            {data.workflow.name} &bull; Started {" "}
            {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            {duration !== null && <> &bull; Took {duration}s </>}
        </>
    )

    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={formatStatus(data.status)}
            subtitle={subtitle}
            image={
                <div className="size-8 flex items-center justify-center">
                    {getStatusIcon(data.status)}
                </div>
            }
        />
    )
}


