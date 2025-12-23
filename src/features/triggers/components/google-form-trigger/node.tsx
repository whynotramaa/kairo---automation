import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GoogleFormDialog } from "./dialog";
import { GOOGLE_FORM_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { fetchGoogleFormRealtimeToken } from "./actions";


export const GoogleFormTriggerNode = memo((props: NodeProps) => {

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GOOGLE_FORM_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGoogleFormRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    return (
        <>
            <GoogleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
            <BaseTriggerNode
                {...props}
                icon="/logos/googleform.svg"
                name="Google Form"
                description="When form is submitted"
                onSettings={handleOpenSettings}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode"