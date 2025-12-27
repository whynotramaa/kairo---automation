"use client"

import { useEffect, useRef } from "react"
import { useInngestSubscription } from "@inngest/realtime/hooks"
import { WORKFLOW_CHANNEL_NAME } from "@/inngest/channels/workflow"
import { fetchWorkflowRealtimeToken } from "@/features/executions/actions/workflow-actions"
import { toast } from "sonner"

interface RetryInfo {
    workflowId: string
    inngestEventId: string
    attempt: number
    maxRetries: number
    errorMessage?: string
    nodeName?: string
}

interface UseWorkflowRetryOptions {
    workflowId: string
}

export function useWorkflowRetry({ workflowId }: UseWorkflowRetryOptions) {
    const lastProcessedAttemptRef = useRef<string | null>(null)

    const { data } = useInngestSubscription({
        refreshToken: fetchWorkflowRealtimeToken,
        enabled: true
    })

    useEffect(() => {
        if (!data.length) return

        // Find latest retry message for this workflow
        const retryMessages = data.filter(
            (msg) =>
                msg.kind === "data" &&
                msg.channel === WORKFLOW_CHANNEL_NAME &&
                msg.topic === "retry" &&
                msg.data.workflowId === workflowId
        ).sort((a, b) => {
            if (a.kind === "data" && b.kind === "data") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            return 0
        })

        const latestRetry = retryMessages[0]

        if (latestRetry?.kind === "data") {
            const msgData = latestRetry.data as RetryInfo

            // Create a unique key for this retry attempt
            const attemptKey = `${msgData.inngestEventId}-${msgData.attempt}`

            // Only show toast if this is a new retry we haven't processed
            if (lastProcessedAttemptRef.current !== attemptKey) {
                lastProcessedAttemptRef.current = attemptKey

                const attemptsRemaining = msgData.maxRetries - msgData.attempt

                toast.warning(
                    `Retrying workflow (Attempt ${msgData.attempt} of ${msgData.maxRetries})`,
                    {
                        description: msgData.errorMessage || "An error occurred, retrying automatically...",
                        duration: 5000,
                    }
                )

                // Show additional info if this is the final attempt
                if (attemptsRemaining === 0) {
                    toast.error("Final retry attempt", {
                        description: "This is the last retry before the workflow fails.",
                        duration: 7000,
                    })
                }
            }
        }
    }, [data, workflowId])
}
