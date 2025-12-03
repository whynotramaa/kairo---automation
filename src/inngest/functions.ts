import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
    { id: "execute-ai" },
    { event: "execute/ai" },
    async ({ event, step }) => {
        const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
            model: google('gemini-2.5-flash'),
            system: "You are Donald Trump",
            prompt: "What is US Dream ? "
        })

        return steps;
    },
);