import { channel, topic } from "@inngest/realtime"

export const Discord_CHANNEL_NAME = "Discord-execution"

export const DiscordChannel = channel(Discord_CHANNEL_NAME).addTopic(
    topic("status").type<{
        nodeId: string,
        status: "loading" | "success" | "error"
        errorMessage?: string
        isRetrying?: boolean
        retryAttempt?: number
    }>(),
)