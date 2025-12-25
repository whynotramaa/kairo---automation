"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { AVAILABLE_MODELS, AnthropicDialog, AnthropicFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { fetchAnthropicRealtimeToken } from "./actions"
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic"

type AnthropicNodeData = {
    variableName?: string;
    model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

type AnthropicNodeType = Node<AnthropicNodeData>

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {

    const { setNodes } = useReactFlow()

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: ANTHROPIC_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchAnthropicRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: AnthropicFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return { ...node, data: { ...node.data, ...values } }
            }
            return node
        }))
    }

    const nodeData = props.data
    const description = nodeData?.userPrompt
        ? `${nodeData.model || AVAILABLE_MODELS[0]} : ${nodeData.userPrompt.slice(0, 49)}...`
        : "Not Configured"

    return (
        <>
            <AnthropicDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon="/logos/claude-ai-icon.svg"
                name="Claude"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

AnthropicNode.displayName = "AnthropicNode"
