"use client"

import { ErrorView, LoadingView } from "@/components/entity-components"
import { useWorkflow } from "@/features/workflows/hooks/use-workflows"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
    ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge,
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    type ColorMode,
    Background,
    Controls,
    MiniMap,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useTheme } from "next-themes"
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@/generated/prisma";
import { ExecuteWorkflowBtn } from "./execute-workflow-button";
import { useWorkflowRetry } from "@/features/executions/hooks/use-workflow-retry";

export const EditorLoading = () => {
    return <LoadingView message="Loading Editor" />
}

export const EditorError = () => {
    return <ErrorView message="Error while loading editor" />
}


export const Editor = ({ workflowId }: { workflowId: string }) => {

    const setEditor = useSetAtom(editorAtom)

    const { data: workflow, isLoading, error } = useWorkflow(workflowId)
    const { resolvedTheme } = useTheme()
    const { RetryDialogComponent } = useWorkflowRetry({ workflowId })

    const colorMode: ColorMode = useMemo(
        () => (resolvedTheme === "dark" ? "dark" : "light"),
        [resolvedTheme],
    )


    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])

    useEffect(() => {
        if (!workflow) return
        setNodes(workflow.nodes ?? [])
        setEdges(workflow.edges ?? [])
    }, [workflow])

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const hasManualTrigger = useMemo(() => {
        return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER)
    }, [nodes])


    if (isLoading && !workflow) {
        return <EditorLoading />
    }

    if (error) {
        return <EditorError />
    }

    if (!workflow) {
        return <ErrorView message="Workflow not found" />
    }

    return (
        <div className="h-full w-full overflow-hidden">
            {RetryDialogComponent}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                onInit={setEditor}
                fitView
                colorMode={colorMode}
                snapGrid={[10, 10]}
                snapToGrid
                panOnScroll
                panOnDrag={false}
                selectionOnDrag
            >
                <Background />
                <Controls />
                <MiniMap />

                <Panel position="top-right">
                    <AddNodeButton />
                </Panel>
                {hasManualTrigger &&
                    (<Panel position="bottom-center">
                        <ExecuteWorkflowBtn workflowId={workflowId} />
                    </Panel>)
                }

            </ReactFlow>
        </div>
    )
}