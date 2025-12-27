import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { generateText } from "ai"
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";



Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type GeminiData = {
    variableName?: string;
    model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const GeminiExecutor: NodeExecutor<GeminiData> = async ({ data, nodeId, userId, step, context, publish }) => {
    // TODO PUBLISH loading state
    await publish(geminiChannel().status({
        nodeId,
        status: "loading"
    }))

    if (!data.variableName || data.variableName.trim() === "") {
        const errorMessage = "Gemini Node: Variable name is missing or empty!";
        await publish(
            geminiChannel().status({ nodeId, status: "error", errorMessage })
        )
        throw new NonRetriableError(errorMessage)
    }

    if (!data.userPrompt) {
        const errorMessage = "Gemini Node: User Prompt is missing !";
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error",
                errorMessage,
            })
        )

        throw new NonRetriableError(errorMessage)

    }


    const credential = await step.run("get-credential", () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId,
                userId,
            }
        })
    })

    if (!credential) {
        const errorMessage = "Gemini Node: Credentials not found !";
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error",
                errorMessage,
            })
        )
        throw new NonRetriableError(errorMessage)
    }
    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "Act as Harvey Specter"

    const userPrompt = data.userPrompt
        ? Handlebars.compile(data.userPrompt)(context)
        : "Act as Harvey Specter"



    const google = createGoogleGenerativeAI({
        apiKey: decrypt(credential.value)
    })

    try {
        const { steps } = await step.ai.wrap(
            "gemini-generate-text",
            generateText,
            {
                model: google(data.model || "gemini-3-pro-preview"),
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
            geminiChannel().status({
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
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        await publish(
            geminiChannel().status({
                nodeId, status: "error", errorMessage,
            })
        )
        throw error
    }
}