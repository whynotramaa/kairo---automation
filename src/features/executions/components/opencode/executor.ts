import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { opencodeChannel } from "@/inngest/channels/opencode";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
    return new Handlebars.SafeString(JSON.stringify(context, null, 2))
})

type OpenCodeData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

export const OpenCodeExecutor: NodeExecutor<OpenCodeData> = async ({ data, userId, nodeId, step, context, publish }) => {
    await publish(opencodeChannel().status({ nodeId, status: "loading" }))

    if (!data.variableName || data.variableName.trim() === "") {
        const errorMessage = "OpenCode Node: Variable name is missing or empty!";
        await publish(opencodeChannel().status({ nodeId, status: "error", errorMessage }))
        throw new NonRetriableError(errorMessage)
    }

    if (!data.userPrompt) {
        const errorMessage = "OpenCode Node: User Prompt is missing!";
        await publish(opencodeChannel().status({ nodeId, status: "error", errorMessage }))
        throw new NonRetriableError(errorMessage)
    }

    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: { id: data.credentialId, userId }
        })
    })

    if (!credential) {
        const errorMessage = "OpenCode Node: Credentials not found!";
        await publish(opencodeChannel().status({ nodeId, status: "error", errorMessage }))
        throw new NonRetriableError(errorMessage)
    }

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are an expert software engineer."

    const userPrompt = Handlebars.compile(data.userPrompt)(context)

    const opencode = createOpenAICompatible({
        name: "opencode",
        baseURL: "https://opencode.ai/zen/v1",
        apiKey: decrypt(credential.value),
    })

    try {
        const { steps } = await step.ai.wrap(
            "opencode-generate-text",
            generateText,
            {
                model: opencode(data.model || "grok-build-0.1"),
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

        await publish(opencodeChannel().status({ nodeId, status: "success" }))

        return {
            ...context,
            [data.variableName]: { aiResponse: text }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        await publish(opencodeChannel().status({ nodeId, status: "error", errorMessage }))
        throw error
    }
}
