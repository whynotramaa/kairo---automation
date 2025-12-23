"use server"

import { GoogleFormTriggerChannel } from "@/inngest/channels/google-form-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type GoogleFormToken = Realtime.Token<
    typeof GoogleFormTriggerChannel, ["status"]
>


export async function fetchGoogleFormRealtimeToken():
    Promise<GoogleFormToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: GoogleFormTriggerChannel(),
        topics: ["status"]
    })

    return token
}