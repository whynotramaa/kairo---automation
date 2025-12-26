import { channel, topic } from "@inngest/realtime"

export const Slack_CHANNEL_NAME = "Slack-execution"

export const SlackChannel = channel(Slack_CHANNEL_NAME).addTopic(
    topic("status").type<{
        nodeId: string,
        status: "loading" | "success" | "error"
    }>(),
)