// import { z } from 'zod';
import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';


export const appRouter = createTRPCRouter({
    testAI: protectedProcedure.mutation(async () => {
        await inngest.send({
            name: "execute/ai",
        })

        return { success: true, message: "Job Queued" }
    })
});
// export type definition of API
export type AppRouter = typeof appRouter;