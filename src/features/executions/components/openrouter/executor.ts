import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { openrouterChannel } from "@/inngest/channels/openrouter";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
    return new Handlebars.SafeString(JSON.stringify(context, null, 2))
})

type OpenRouterData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

export const OpenRouterExecutor: NodeExecutor<OpenRouterData> = async ({ data, userId, nodeId, step, context, publish }) => {
    await publish(openrouterChannel().status({ nodeId, status: "loading" }))

    if (!data.variableName || data.variableName.trim() === "") {
        const errorMessage = "OpenRouter Node: Variable name is missing or empty!";
        await publish(openrouterChannel().status({ nodeId, status: "error", errorMessage }))
        throw new NonRetriableError(errorMessage)
    }

    if (!data.userPrompt) {
        const errorMessage = "OpenRouter Node: User Prompt is missing!";
        await publish(openrouterChannel().status({ nodeId, status: "error", errorMessage }))
        throw new NonRetriableError(errorMessage)
    }

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: { id: data.credentialId, userId }
        })
    })

    if (!credential) {
        const errorMessage = "OpenRouter Node: Credentials not found!";
        await publish(openrouterChannel().status({ nodeId, status: "error", errorMessage }))
        throw new NonRetriableError(errorMessage)
    }

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant."

    const userPrompt = Handlebars.compile(data.userPrompt)(context)

    const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: decrypt(credential.value),
    })

    try {
        const { steps } = await step.ai.wrap(
            "openrouter-generate-text",
            generateText,
            {
                model: openrouter(data.model || "openai/gpt-4o-mini"),
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

        await publish(openrouterChannel().status({ nodeId, status: "success" }))

        return {
            ...context,
            [data.variableName]: { aiResponse: text }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        await publish(openrouterChannel().status({ nodeId, status: "error", errorMessage }))
        throw error
    }
}
