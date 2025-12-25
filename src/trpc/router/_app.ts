// import { z } from 'zod';
import { credentialsRouter } from '@/features/credentials/server/routers';
import { createTRPCRouter, } from '../init';
import { workflowsRouter } from '@/features/workflows/server/routers';


export const appRouter = createTRPCRouter({
    workflow: workflowsRouter,
    credentials: credentialsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;