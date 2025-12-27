import prisma from "@/lib/db"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z, { string } from "zod"
import { PAGINATION } from "@/config/constants"
import { ExecutionStatus } from "@/generated/prisma"


export const executionsRouter = createTRPCRouter({

    getOne: protectedProcedure
        .input(z.object({ id: string() }))
        .query(async ({ ctx, input }) => {

            return prisma.execution.findUniqueOrThrow({
                where: {
                    id: input.id,
                    workflow: { userId: ctx.auth.user.id },
                },
                include: {
                    workflow: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })
        }),


    getmany: protectedProcedure
        .input(z.object({
            page: z.number().default(PAGINATION.DEFAULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            search: z.string().default("")
        }))
        .query(async ({ ctx, input }) => {

            const { page, pageSize } = input;

            const [items, totalCount] = await Promise.all([
                prisma.execution.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        workflow: {
                            userId: ctx.auth.user.id,
                        }
                    },
                    orderBy: {
                        startedAt: "desc"
                    },
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }),
                prisma.execution.count({
                    where: {
                        workflow: {
                            userId: ctx.auth.user.id,
                        }
                    }
                })
            ])

            const totalPages = Math.ceil(totalCount / pageSize)
            const hasNextPage = page < totalPages
            const hasPrevPage = page > 1

            return {
                items, page, pageSize, totalCount, totalPages, hasNextPage, hasPrevPage
            }

        }),

    // Cancel an Inngest function run
    cancel: protectedProcedure
        .input(z.object({
            inngestEventId: z.string(),
            workflowId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { inngestEventId, workflowId } = input

            // Verify the workflow belongs to the user
            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId, userId: ctx.auth.user.id }
            })

            if (!workflow) {
                throw new Error("Workflow not found or access denied")
            }

            // Cancel via Inngest REST API
            const signingKey = process.env.INNGEST_SIGNING_KEY

            if (!signingKey) {
                // If no signing key, just update local status
                console.warn("INNGEST_SIGNING_KEY not configured, cannot cancel via API")
            } else {
                try {
                    // Cancel the function run using the event ID
                    const response = await fetch(`https://api.inngest.com/v1/cancellations`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${signingKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            app_id: "my-app",
                            function_id: "execute-workflow",
                            if: `event.id == '${inngestEventId}'`
                        })
                    })

                    if (!response.ok) {
                        const errorText = await response.text()
                        console.error("Failed to cancel Inngest run:", errorText)
                    }
                } catch (error) {
                    console.error("Error cancelling Inngest run:", error)
                }
            }

            // Update local execution status
            const execution = await prisma.execution.updateMany({
                where: {
                    inngestEventId,
                    workflowId,
                    workflow: { userId: ctx.auth.user.id }
                },
                data: {
                    status: ExecutionStatus.CANCELLED,
                    completedAt: new Date(),
                    error: "Cancelled by user"
                }
            })

            return { success: true, cancelled: execution.count > 0 }
        }),

})