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
        await publish(DiscordChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Discord Node: Content is missing !");
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);

    const username = data.username
        ? decode(Handlebars.compile(data.username)(context))
        : undefined;

    try {
        if (!data.webhookUrl) {
            await publish(DiscordChannel().status({ nodeId, status: "error" }));
            throw new NonRetriableError("Discord Node: Webhook URL is missing !");
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
            await publish(DiscordChannel().status({ nodeId, status: "error" }));
            throw new NonRetriableError(
                "Discord Node: Variable name is missing or empty!"
            );
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
        await publish(DiscordChannel().status({ nodeId, status: "error" }));
        throw error;
    }
};
