import prisma from "@/lib/db";
import { inngest } from "./client";
import { NonRetriableError } from "inngest"
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecuter } from "@/features/executions/lib/executor-registry";
import { httpReqChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { GoogleFormTriggerChannel } from "./channels/google-form-trigger";
import { StripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { GroqChannel } from "./channels/groq";
import { AnthropicChannel } from "./channels/anthropic";
import { DiscordChannel } from "./channels/discord";
import { SlackChannel } from "./channels/slack";



export const executeWorkflow = inngest.createFunction(
    {
        id: "execute-workflow",
        retries: process.env.NODE_ENV === "production" ? 3 : 0,
        onFailure: async ({ event, step }) => {
            return prisma.execution.update({
                where: { inngestEventId: event.data.event.id },
                data: {
                    status: ExecutionStatus.FAILED,
                    error: event.data.error.message,
                    errorStack: event.data.error.stack,
                }
            })
        }
    },
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
            AnthropicChannel(),
            DiscordChannel(),
            SlackChannel(),
        ],
    },
    async ({ event, step, publish }) => {

        const inngestEventId = event.id!;

        const workflowId = event.data.workflowId
        if (!inngestEventId && !workflowId) {
            throw new NonRetriableError("Event ID or workflow id is missing !")
        }


        await step.run("create-execution", async () => {
            return prisma.execution.create({
                data: {
                    workflowId, inngestEventId,
                }
            })
        })

        const sortedNodes = await step.run("prepare-workflow", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: {
                    nodes: true, connections: true
                }
            })

            return topologicalSort(workflow.nodes, workflow.connections)
        })

        const userId = await step.run("find-user-id", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                select: {
                    userId: true
                }
            })

            return workflow.userId
        })

        // intialize the context

        let context = event.data.intialData || {}

        // execute each node
        for (const node of sortedNodes) {
            const executor = getExecuter(node.type as NodeType)
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                userId,
                context,
                step,
                publish,
            })
        }


        await step.run("update-execution", async () => {
            return prisma.execution.update({
                where: { inngestEventId, workflowId },
                data: {
                    status: ExecutionStatus.SUCCESS,
                    completedAt: new Date(),
                    output: context
                }
            })
        })

        return { workflowId, result: context }


    },
);