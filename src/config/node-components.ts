import { InitialNode } from "@/components/initial-node"
import { HttpReqNode } from "@/features/executions/components/http-request/node"
import { NodeType } from "@/generated/prisma"
import { NodeTypes } from "@xyflow/react"
import { ManualTriggerNode } from "../features/triggers/components/manual-trigger/node"
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node"

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpReqNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents