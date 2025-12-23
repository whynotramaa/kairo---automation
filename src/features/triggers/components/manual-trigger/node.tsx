import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointer2Icon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";
import { fetchmanualTriggerRealtimeToken } from "./actions";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";


export const ManualTriggerNode = memo((props: NodeProps) => {

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: MANUAL_TRIGGER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchmanualTriggerRealtimeToken
    })

    const handleOpenSettings = () => setDialogOpen(true)

    return (
        <>
            <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
            <BaseTriggerNode
                {...props}
                icon={MousePointer2Icon}
                name="When clicking executes workflow"
                onSettings={handleOpenSettings}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


ManualTriggerNode.displayName = "ManualTriggerNode"