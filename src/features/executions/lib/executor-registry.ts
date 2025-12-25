import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { googleFormExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { StripeExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { OpenAIExecutor } from "../components/openai/executor";
import { GroqExecutor } from "../components/groq/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormExecutor,
    [NodeType.STRIPE_TRIGGER]: StripeExecutor,
    [NodeType.GEMINI]: GeminiExecutor,
    [NodeType.OPENAI]: OpenAIExecutor,
    [NodeType.GROQ]: GroqExecutor,
}


export const getExecuter = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type]
    if (!executor) {
        throw new Error(`No node executor found for node type : ${type}`)
    }
    return executor
}