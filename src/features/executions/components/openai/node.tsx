"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { BaseExecNode } from "../base-execution-node"
import { AVAILABLE_MODELS, OpenAIDialog, OpenAIFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai"
import { fetchopenaiRealtimeToken } from "./actions"

type OpenAINodeData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


type OpenAINodeType = Node<OpenAINodeData>

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {

    const { setNodes } = useReactFlow()
    const { resolvedTheme } = useTheme()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchopenaiRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: OpenAIFormValues) => {
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

    const isDark = mounted && resolvedTheme === "dark"
    const openaiIcon = isDark ? "/logos/openai_dark.svg" : "/logos/openai.svg"

    return (
        <>
            <OpenAIDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon={openaiIcon}
                name="ChatGPT"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


OpenAINode.displayName = "OpenAINode"