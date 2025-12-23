"use server"

import { httpReqChannel } from "@/inngest/channels/http-request"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, Realtime } from "@inngest/realtime"

export type HttpReqToken = Realtime.Token<
    typeof httpReqChannel, ["status"]
>


export async function fetchHttpReqRealtimeToken():
    Promise<HttpReqToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: httpReqChannel(),
        topics: ["status"]
    })

    return token
}