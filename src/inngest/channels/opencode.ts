import { channel, topic } from "@inngest/realtime"

export const OPENCODE_CHANNEL_NAME = "opencode-execution"

export const opencodeChannel = channel(OPENCODE_CHANNEL_NAME).addTopic(
    topic("status").type<{
        nodeId: string,
        status: "loading" | "success" | "error"
        errorMessage?: string
        isRetrying?: boolean
        retryAttempt?: number
    }>(),
)
