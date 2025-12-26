"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { DiscordDialog, DiscordFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { fetchDiscordRealtimeToken } from "./actions"
import { Discord_CHANNEL_NAME } from "@/inngest/channels/discord"

type DiscordNodeData = {
    webhookUrl?: string
    content?: string
    username?: string
}


type DiscordNodeType = Node<DiscordNodeData>

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {

    const { setNodes } = useReactFlow()

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: Discord_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDiscordRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: DiscordFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return { ...node, data: { ...node.data, ...values } }
            }
            return node
        }))
    }

    const nodeData = props.data
    const description = nodeData?.content
        ? `Send : ${nodeData.content.slice(0, 49)}...`
        : "Not Configured"


    return (
        <>
            <DiscordDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon="/logos/Discord.svg"
                name="Discord"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


DiscordNode.displayName = "DiscordNode"