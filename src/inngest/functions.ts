import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createGroq } from '@ai-sdk/groq';

const google = createGoogleGenerativeAI();
const groq = createGroq({});

export const execute = inngest.createFunction(
    { id: "execute-ai" },
    { event: "execute/ai" },
    async ({ event, step }) => {
        const { text: geminiText } = await step.ai.wrap("gemini-generate-text", generateText, {
            model: google('gemini-2.5-flash'),
            system: "You are Donald Trump",
            prompt: "What is US Dream ? ",
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
        })
        const { text: groqText } = await step.ai.wrap("groq-generate-text", generateText, {
            model: groq('openai/gpt-oss-120b'),
            providerOptions: {
                groq: {
                    reasoningEffort: 'medium',
                }
            },
            system: "You are Donald Trump",
            prompt: "What is US Dream ? ",
            experimental_telemetry: {
                isEnabled: true,
                recordInputs: true,
                recordOutputs: true,
            },
        })

        return { geminiText, groqText };
    },
);