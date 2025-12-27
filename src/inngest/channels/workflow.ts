import { channel, topic } from "@inngest/realtime"

export const WORKFLOW_CHANNEL_NAME = "workflow-execution"

export const workflowChannel = channel(WORKFLOW_CHANNEL_NAME)
    .addTopic(
        topic("retry").type<{
            workflowId: string
            inngestEventId: string
            attempt: number
            maxRetries: number
            errorMessage?: string
            nodeName?: string
        }>()
    )
    .addTopic(
        topic("cancelled").type<{
            workflowId: string
            inngestEventId: string
            cancelledAt: string
        }>()
    )
