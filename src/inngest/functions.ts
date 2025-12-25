import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest"
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma";
import { getExecuter } from "@/features/executions/lib/executor-registry";
import { httpReqChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { GoogleFormTriggerChannel } from "./channels/google-form-trigger";
import { StripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { GroqChannel } from "./channels/groq";



export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow" },
    {
        event: "workflows/execute.workflow",
        channels: [
            httpReqChannel(),
            manualTriggerChannel(),
            GoogleFormTriggerChannel(),
            StripeTriggerChannel(),
            geminiChannel(),
            openaiChannel(),
            GroqChannel(),
        ],
    },
    async ({ event, step, publish }) => {

        const workflowId = event.data.workflowId
        if (!workflowId) {
            throw new NonRetriableError("workflow id is missing !")
        }

        const sortedNodes = await step.run("prepare-workflow", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: {
                    nodes: true, connections: true
                }
            })

            return topologicalSort(workflow.nodes, workflow.connections)
        })

        // intialize the context

        let context = event.data.intialData || {}

        // execute each node
        for (const node of sortedNodes) {
            const executor = getExecuter(node.type as NodeType)
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                step,
                publish,
            })
        }

        return { workflowId, result: context }


    },
);