"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { OPENCODE_MODELS, OpenCodeDialog, OpenCodeFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { OPENCODE_CHANNEL_NAME } from "@/inngest/channels/opencode"
import { fetchOpenCodeRealtimeToken } from "./actions"

type OpenCodeNodeData = {
    variableName?: string;
    model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

type OpenCodeNodeType = Node<OpenCodeNodeData>

export const OpenCodeNode = memo((props: NodeProps<OpenCodeNodeType>) => {
    const { setNodes } = useReactFlow()
    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENCODE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenCodeRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: OpenCodeFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return { ...node, data: { ...node.data, ...values } }
            }
            return node
        }))
    }

    const nodeData = props.data
    const description = nodeData?.userPrompt
        ? `${nodeData.model || OPENCODE_MODELS[0]} : ${nodeData.userPrompt.slice(0, 49)}...`
        : "Not Configured"

    return (
        <>
            <OpenCodeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon="/logos/opencode.svg"
                name="OpenCode"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})

OpenCodeNode.displayName = "OpenCodeNode"
