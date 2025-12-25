import { channel, topic } from "@inngest/realtime"

export const Groq_CHANNEL_NAME = "Groq-execution"

export const GroqChannel = channel(Groq_CHANNEL_NAME).addTopic(
    topic("status").type<{
        nodeId: string,
        status: "loading" | "success" | "error"
    }>(),
)