import { channel, topic } from "@inngest/realtime"

export const HTTP_REQ_CHANNEL_NAME = "http-request-execution"

export const httpReqChannel = channel(HTTP_REQ_CHANNEL_NAME).addTopic(
    topic("status").type<{
        nodeId: string,
        status: "loading" | "success" | "error"
    }>(),
)