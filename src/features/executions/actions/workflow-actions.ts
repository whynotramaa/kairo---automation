"use server"

import { workflowChannel } from "@/inngest/channels/workflow"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type WorkflowToken = Realtime.Token<
    typeof workflowChannel, ["retry", "cancelled"]
>

export async function fetchWorkflowRealtimeToken():
    Promise<WorkflowToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: workflowChannel(),
        topics: ["retry", "cancelled"]
    })

    return token
}
