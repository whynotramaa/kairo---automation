import { NodeExecutor } from "@/features/executions/types";
import { StripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerData = Record<string, unknown>

export const StripeExecutor: NodeExecutor<StripeTriggerData> = async ({ nodeId, publish, step, context }) => {

    await publish(
        StripeTriggerChannel().status({
            nodeId, status: "loading"
        })
    )

    const result = await step.run("Stripe-trigger", async () => context);

    await publish(
        StripeTriggerChannel().status({
            nodeId, status: "success"
        })
    )
    return result


}