"use server"

import { opencodeChannel } from "@/inngest/channels/opencode"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type OpenCodeToken = Realtime.Token<
    typeof opencodeChannel, ["status"]
>

export async function fetchOpenCodeRealtimeToken():
    Promise<OpenCodeToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: opencodeChannel(),
        topics: ["status"]
    })

    return token
}
