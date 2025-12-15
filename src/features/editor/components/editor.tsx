"use client"

import { ErrorView, LoadingView } from "@/components/entity-components"
import { useWorkflow } from "@/features/workflows/hooks/use-workflows"

import { useState, useCallback } from 'react';
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

export const EditorLoading = () => {
    return <LoadingView message="Loading Editor" />
}

export const EditorError = () => {
    return <ErrorView message="Error while loading editor" />
}


export const Editor = ({ workflowId }: { workflowId: string }) => {

    const { data: workflow, isLoading, error } = useWorkflow(workflowId)
    const [colorMode, setColorMode] = useState<ColorMode>('dark');

    const [nodes, setNodes] = useState<Node[]>(workflow?.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow?.edges);

    const onChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
        setColorMode(evt.target.value as ColorMode);
    };

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
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                fitView
                colorMode={colorMode}
            >
                <Background />
                <Controls />
                <MiniMap />

                <Panel position="top-right">
                    <AddNodeButton />
                </Panel>

            </ReactFlow>
        </div>
    )
}