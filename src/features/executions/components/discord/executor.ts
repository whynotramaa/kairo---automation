import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { DiscordChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";
import ky from "ky";



Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type DiscordData = {
    variableName?: string;
    webhookUrl?: string
    content?: string
    username?: string
}

export const DiscordExecutor: NodeExecutor<DiscordData> = async ({
    data,
    nodeId,
    step,
    context,
    publish,
}) => {
    await publish(DiscordChannel().status({ nodeId, status: "loading" }));

    if (!data.content) {
        const errorMessage = "Discord Node: Content is missing !";
        await publish(DiscordChannel().status({ nodeId, status: "error", errorMessage }));
        throw new NonRetriableError(errorMessage);
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);

    const username = data.username
        ? decode(Handlebars.compile(data.username)(context))
        : undefined;

    try {
        if (!data.webhookUrl) {
            const errorMessage = "Discord Node: Webhook URL is missing !";
            await publish(DiscordChannel().status({ nodeId, status: "error", errorMessage }));
            throw new NonRetriableError(errorMessage);
        }

        await step.run("discord-webhook", async () => {
            await ky.post(data.webhookUrl!, {
                json: {
                    content: content.slice(0, 2000),
                    username,
                },
            });
        });

        if (!data.variableName || data.variableName.trim() === "") {
            const errorMessage = "Discord Node: Variable name is missing or empty!";
            await publish(DiscordChannel().status({ nodeId, status: "error", errorMessage }));
            throw new NonRetriableError(errorMessage);
        }

        await publish(
            DiscordChannel().status({ nodeId, status: "success" })
        );

        return {
            ...context,
            [data.variableName]: {
                messageContent: content.slice(0, 2000),
            },
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        await publish(DiscordChannel().status({ nodeId, status: "error", errorMessage }));
        throw error;
    }
};
