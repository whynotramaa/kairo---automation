import { NodeStatus } from "@/components/react-flow/node-status-indicator"
import type { Realtime } from "@inngest/realtime"
import { useEffect, useState } from "react"
import { useInngestSubscription } from "@inngest/realtime/hooks"

interface useNodeStatusOptions {
    nodeId: string,
    channel: string,
    topic: string,
    refreshToken: () => Promise<Realtime.Subscribe.Token>
}

export function useNodeStatus({
    nodeId, channel, topic, refreshToken
}: useNodeStatusOptions) {
    const [status, setStatus] = useState<NodeStatus>("initial")

    const { data } = useInngestSubscription({ refreshToken, enabled: true })

    useEffect(() => {
        if (!data.length) {
            return
        }

        // find latest message for this node
        const latestMsg = data.filter(
            (msg) =>
                msg.kind === "data" &&
                msg.channel === channel &&
                msg.topic === topic &&
                msg.data.nodeId === nodeId
        )
            .sort((a, b) => {
                if (a.kind === "data" && b.kind === "data") {
                    return (
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                }
                return 0
            })[0]

        if (latestMsg?.kind === "data") {
            setStatus(latestMsg.data.status as NodeStatus)
        }

    }, [data, nodeId, channel, topic])


    return status
}