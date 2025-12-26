import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { SlackChannel } from "@/inngest/channels/slack";
import { decode } from "html-entities";
import ky from "ky";



Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type SlackData = {
    variableName?: string;
    webhookUrl?: string
    content?: string
}

export const SlackExecutor: NodeExecutor<SlackData> = async ({
    data,
    nodeId,
    step,
    context,
    publish,
}) => {
    await publish(SlackChannel().status({ nodeId, status: "loading" }));

    if (!data.content) {
        await publish(SlackChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Slack Node: Content is missing !");
    }

    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);


    try {
        if (!data.webhookUrl) {
            await publish(SlackChannel().status({ nodeId, status: "error" }));
            throw new NonRetriableError("Slack Node: Webhook URL is missing !");
        }

        await step.run("slack-webhook", async () => {
            await ky.post(data.webhookUrl!, {
                json: {
                    content: content,
                },
            });
        });

        if (!data.variableName || data.variableName.trim() === "") {
            await publish(SlackChannel().status({ nodeId, status: "error" }));
            throw new NonRetriableError(
                "Slack Node: Variable name is missing or empty!"
            );
        }

        await publish(
            SlackChannel().status({ nodeId, status: "success" })
        );

        return {
            ...context,
            [data.variableName]: {
                messageContent: content.slice(0, 2000),
            },
        };

    } catch (error) {
        await publish(SlackChannel().status({ nodeId, status: "error" }));
        throw error;
    }
};
