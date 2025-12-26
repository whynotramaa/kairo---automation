"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { SlackDialog, SlackFormValues } from "./dialog"
import { useNodeStatus } from "../../hooks/use-node-status"
import { fetchSlackRealtimeToken } from "./actions"
import { Slack_CHANNEL_NAME } from "@/inngest/channels/slack"

type SlackNodeData = {
    webhookUrl?: string
    content?: string
}


type SlackNodeType = Node<SlackNodeData>

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {

    const { setNodes } = useReactFlow()

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: Slack_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchSlackRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: SlackFormValues) => {
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
            <SlackDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon="/logos/slack.svg"
                name="Slack"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


SlackNode.displayName = "SlackNode"