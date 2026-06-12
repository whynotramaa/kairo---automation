"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { OPENROUTER_MODELS, OpenRouterDialog, OpenRouterFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { OPENROUTER_CHANNEL_NAME } from "@/inngest/channels/openrouter"
import { fetchOpenRouterRealtimeToken } from "./actions"

type OpenRouterNodeData = {
    variableName?: string;
    model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

type OpenRouterNodeType = Node<OpenRouterNodeData>

export const OpenRouterNode = memo((props: NodeProps<OpenRouterNodeType>) => {
    const { setNodes } = useReactFlow()
    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENROUTER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenRouterRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: OpenRouterFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return { ...node, data: { ...node.data, ...values } }
            }
            return node
        }))
    }

    const nodeData = props.data
    const description = nodeData?.userPrompt
        ? `${nodeData.model || OPENROUTER_MODELS[0]} : ${nodeData.userPrompt.slice(0, 49)}...`
        : "Not Configured"

    return (
        <>
            <OpenRouterDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon="/logos/openrouter.svg"
                name="OpenRouter"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

OpenRouterNode.displayName = "OpenRouterNode"
