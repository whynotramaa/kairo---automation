import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { openaiChannel } from "@/inngest/channels/openai";
import { GroqChannel } from "@/inngest/channels/groq";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";



Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type GroqData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const GroqExecutor: NodeExecutor<GroqData> = async ({ data, nodeId, userId, step, context, publish }) => {
    // TODO PUBLISH loading state
    await publish(GroqChannel().status({
        nodeId,
        status: "loading"
    }))

    if (!data.variableName || data.variableName.trim() === "") {
        const errorMessage = "Groq Node: Variable name is missing or empty!";
        await publish(
            GroqChannel().status({ nodeId, status: "error", errorMessage })
        )
        throw new NonRetriableError(errorMessage)
    }



    if (!data.userPrompt) {
        const errorMessage = "Groq Node: User Prompt is missing !";
        await publish(
            GroqChannel().status({
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
        const errorMessage = "Groq Node: Credentials not found !";
        await publish(
            GroqChannel().status({
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



    const Groq = createGroq({
        apiKey: decrypt(credential.value)
    })

    try {
        const { steps } = await step.ai.wrap(
            "Groq-generate-text",
            generateText,
            {
                model: Groq(data.model || "moonshotai/kimi-k2-instruct-0905"),
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
            GroqChannel().status({
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
            GroqChannel().status({
                nodeId, status: "error", errorMessage,
            })
        )
        throw error
    }
}