"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useInngestSubscription } from "@inngest/realtime/hooks"
import { WORKFLOW_CHANNEL_NAME } from "@/inngest/channels/workflow"
import { fetchWorkflowRealtimeToken } from "@/features/executions/actions/workflow-actions"
import { RetryDialog, RetryInfo } from "@/features/executions/components/retry-dialog"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface UseWorkflowRetryOptions {
    workflowId: string
}

export function useWorkflowRetry({ workflowId }: UseWorkflowRetryOptions) {
    const [retryInfo, setRetryInfo] = useState<RetryInfo | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const lastProcessedAttemptRef = useRef<string | null>(null)

    const trpc = useTRPC()

    const cancelMutation = useMutation(
        trpc.executions.cancel.mutationOptions({
            onSuccess: () => {
                toast.success("Workflow execution cancelled")
                setDialogOpen(false)
                setRetryInfo(null)
            },
            onError: (error) => {
                toast.error(`Failed to cancel: ${error.message}`)
            }
        })
    )

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
            
            // Only show dialog if this is a new retry we haven't processed
            if (lastProcessedAttemptRef.current !== attemptKey) {
                lastProcessedAttemptRef.current = attemptKey
                setRetryInfo(msgData)
                setDialogOpen(true)
            }
        }

        // Check for cancelled messages
        const cancelledMessages = data.filter(
            (msg) =>
                msg.kind === "data" &&
                msg.channel === WORKFLOW_CHANNEL_NAME &&
                msg.topic === "cancelled" &&
                msg.data.workflowId === workflowId
        )

        if (cancelledMessages.length > 0) {
            setDialogOpen(false)
            setRetryInfo(null)
        }
    }, [data, workflowId])

    const handleCancel = useCallback(() => {
        if (!retryInfo) return

        cancelMutation.mutate({
            inngestEventId: retryInfo.inngestEventId,
            workflowId: retryInfo.workflowId,
        })
    }, [retryInfo, cancelMutation])

    const handleContinue = useCallback(() => {
        setDialogOpen(false)
        // Keep retryInfo so we can track if same attempt happens again
    }, [])

    const RetryDialogComponent = (
        <RetryDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            retryInfo={retryInfo}
            onCancel={handleCancel}
            onContinue={handleContinue}
            isCancelling={cancelMutation.isPending}
        />
    )

    return {
        retryInfo,
        dialogOpen,
        setDialogOpen,
        RetryDialogComponent,
    }
}
