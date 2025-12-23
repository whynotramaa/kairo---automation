"use server"

import { httpReqChannel } from "@/inngest/channels/http-request"
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type manualTriggerToken = Realtime.Token<
    typeof manualTriggerChannel, ["status"]
>


export async function fetchmanualTriggerRealtimeToken():
    Promise<manualTriggerToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: manualTriggerChannel(),
        topics: ["status"]
    })

    return token
}