import { NodeStatus } from "@/components/react-flow/node-status-indicator"
import type { Realtime } from "@inngest/realtime"
import { useEffect, useRef, useState } from "react"
import { useInngestSubscription } from "@inngest/realtime/hooks"
import { toast } from "sonner"

interface useNodeStatusOptions {
    nodeId: string,
    channel: string,
    topic: string,
    refreshToken: () => Promise<Realtime.Subscribe.Token>
}

interface NodeStatusData {
    nodeId: string
    status: NodeStatus
    errorMessage?: string
    isRetrying?: boolean
    retryAttempt?: number
}

export function useNodeStatus({
    nodeId, channel, topic, refreshToken
}: useNodeStatusOptions) {
    const [status, setStatus] = useState<NodeStatus>("initial")
    const lastToastRef = useRef<{ errorMessage?: string; isRetrying?: boolean; retryAttempt?: number }>({})

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
            const msgData = latestMsg.data as NodeStatusData
            setStatus(msgData.status as NodeStatus)

            // Show toast for error with error message
            if (msgData.status === "error" && msgData.errorMessage) {
                // Avoid duplicate toasts for the same error
                if (lastToastRef.current.errorMessage !== msgData.errorMessage) {
                    toast.error(msgData.errorMessage)
                    lastToastRef.current.errorMessage = msgData.errorMessage
                }
            }

            // Show toast for retry notification
            if (msgData.isRetrying) {
                const retryAttempt = msgData.retryAttempt || 1
                // Avoid duplicate toasts for the same retry attempt
                if (lastToastRef.current.retryAttempt !== retryAttempt) {
                    toast.warning(
                        `Retrying... (Attempt ${retryAttempt})`,
                        {
                            description: msgData.errorMessage || "An error occurred, retrying...",
                            duration: 5000
                        }
                    )
                    lastToastRef.current.retryAttempt = retryAttempt
                    lastToastRef.current.isRetrying = true
                }
            }

            // Reset refs when status becomes success or initial
            if (msgData.status === "success" || msgData.status === "initial") {
                lastToastRef.current = {}
            }
        }

    }, [data, nodeId, channel, topic])


    return status
}