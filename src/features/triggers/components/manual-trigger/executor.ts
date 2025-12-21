import { NodeExecutor } from "@/features/executions/types";

type ManualTriggerData = Record<string, unknown>

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({ nodeId, step, context }) => {

    // TODO PUBLISH loading state

    const result = await step.run("manual-trigger", async () => context);

    // TODO PUBLISH success state

    return result


}