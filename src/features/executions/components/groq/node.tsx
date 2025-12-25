"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { AVAILABLE_MODELS, GroqDialog, GroqFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { fetchGroqRealtimeToken } from "./actions"
import { Groq_CHANNEL_NAME } from "@/inngest/channels/groq"

type GroqNodeData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


type GroqNodeType = Node<GroqNodeData>

export const GroqNode = memo((props: NodeProps<GroqNodeType>) => {

    const { setNodes } = useReactFlow()

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: Groq_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGroqRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: GroqFormValues) => {
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
            <GroqDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon="/logos/Groq.svg"
                name="Groq"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


GroqNode.displayName = "GroqNode"