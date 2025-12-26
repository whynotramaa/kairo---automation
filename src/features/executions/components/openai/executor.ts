import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { openaiChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";



Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type OpenAIData = {
    variableName?: string;
    credentialId?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const OpenAIExecutor: NodeExecutor<OpenAIData> = async ({ data, userId, nodeId, step, context, publish }) => {
    // TODO PUBLISH loading state
    await publish(openaiChannel().status({
        nodeId,
        status: "loading"
    }))

    if (!data.variableName || data.variableName.trim() === "") {
        await publish(
            openaiChannel().status({ nodeId, status: "error" })
        )
        throw new NonRetriableError("OpenAI Node: Variable name is missing or empty!")
    }

    if (!data.userPrompt) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )

        throw new NonRetriableError("OpenAI Node: User Prompt is missing !")

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
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )
        throw new NonRetriableError("OPEN AI Node: Credentials not found !")
    }
    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "Act as Harvey Specter"

    const userPrompt = data.userPrompt
        ? Handlebars.compile(data.userPrompt)(context)
        : "Act as Harvey Specter"



    const openai = createOpenAI({
        apiKey: credential.value
    })

    try {
        const { steps } = await step.ai.wrap(
            "OpenAI-generate-text",
            generateText,
            {
                model: openai(data.model || "gpt-4o-mini"),
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
            openaiChannel().status({
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
            openaiChannel().status({
                nodeId, status: "error",
            })
        )
        throw error
    }
}