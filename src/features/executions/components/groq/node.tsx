"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { BaseExecNode } from "../base-execution-node"
import { AVAILABLE_MODELS, GroqDialog, GroqFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { fetchGroqRealtimeToken } from "./actions"
import { Groq_CHANNEL_NAME } from "@/inngest/channels/groq"

type GroqNodeData = {
    variableName?: string;
    model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

type GroqNodeType = Node<GroqNodeData>

const getModelIcon = (model: string | undefined, isDark: boolean): string => {
    if (!model) return "/logos/groq.svg"

    const modelLower = model.toLowerCase()

    if (modelLower.includes("llama") || modelLower.includes("gemma")) {
        return "/logos/meta.svg"
    }
    if (modelLower.includes("deepseek")) {
        return "/logos/deepseek.svg"
    }
    if (modelLower.includes("moonshot") || modelLower.includes("kimi")) {
        return "/logos/kimi-icon.svg"
    }
    if (modelLower.includes("mixtral")) {
        return "/logos/mistral-ai_logo.svg"
    }
    if (modelLower.includes("qwen")) {
        return isDark ? "/logos/qwen_dark.svg" : "/logos/qwen_light.svg"
    }

    return "/logos/groq.svg"
}

export const GroqNode = memo((props: NodeProps<GroqNodeType>) => {

    const { setNodes } = useReactFlow()
    const { resolvedTheme } = useTheme()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    const isDark = mounted && resolvedTheme === "dark"
    const modelIcon = getModelIcon(nodeData?.model, isDark)

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
                icon={modelIcon}
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