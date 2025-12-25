"use server"

import { GroqChannel } from "@/inngest/channels/groq"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type GroqToken = Realtime.Token<
    typeof GroqChannel, ["status"]
>


export async function fetchGroqRealtimeToken():
    Promise<GroqToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: GroqChannel(),
        topics: ["status"]
    })

    return token
}