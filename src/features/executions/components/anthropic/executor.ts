import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { AnthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";



Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type AnthropicData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({ data, nodeId, step, context, publish }) => {
    await publish(AnthropicChannel().status({
        nodeId,
        status: "loading"
    }))

    if (!data.variableName || data.variableName.trim() === "") {
        await publish(
            AnthropicChannel().status({ nodeId, status: "error" })
        )
        throw new NonRetriableError("Anthropic Node: Variable name is missing or empty!")
    }



    if (!data.userPrompt) {
        await publish(
            AnthropicChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("Anthropic Node: User Prompt is missing !")

    }

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId
            }
        })
    })

    if (!credential) {
        throw new NonRetriableError("Anthropic Node: Credentials not found !")
    }


    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant."

    const userPrompt = data.userPrompt
        ? Handlebars.compile(data.userPrompt)(context)
        : ""



    const anthropic = createAnthropic({
        apiKey: credential.value
    })

    try {
        const { steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: anthropic(data.model || "claude-sonnet-4-5"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            }
        )

        const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : ""

        await publish(
            AnthropicChannel().status({
                nodeId, status: "success",
            })
        )

        return {
            ...context,
            [data.variableName]: {
                aiResponse: text
            }
        }

    } catch (error) {
        await publish(
            AnthropicChannel().status({
                nodeId, status: "error",
            })
        )
        throw error
    }
}
