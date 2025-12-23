"use server"

import { StripeTriggerChannel } from "@/inngest/channels/stripe-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type StripeToken = Realtime.Token<
    typeof StripeTriggerChannel, ["status"]
>


export async function fetchStripeRealtimeToken():
    Promise<StripeToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: StripeTriggerChannel(),
        topics: ["status"]
    })

    return token
}