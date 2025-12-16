"use client"

import { NodeProps, Position } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import { memo, ReactNode } from "react";
import { WorkflowNode } from "../../../components/workflow-node";
import { BaseNode, BaseNodeContent } from "../../../components/react-flow/base-node";
import Image from "next/image";
import { BaseHandle } from "../../../components/react-flow/base-handle";

interface BaseExecNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string
    description?: string
    children?: ReactNode
    // status?: NodeStatus
    onSettings?: () => void
    onDoubleClick: () => void
}

export const BaseExecNode = memo(
    ({
        id, icon: Icon, name, description, children, onSettings, onDoubleClick
    }: BaseExecNodeProps) => {

        const handleDel = () => { }
        return (
            <WorkflowNode
                name={name}
                description={description}
                onDelete={handleDel}
                onSettings={onSettings}
            >
                <BaseNode onDoubleClick={onDoubleClick}>
                    <BaseNodeContent>
                        {typeof Icon === "string" ? (
                            <Image src={Icon} alt={name} width={16} height={16} />
                        ) : (
                            <Icon className="size-4 text-muted-foreground" />
                        )}
                        {children}
                        <BaseHandle
                            id="target-1"
                            type="target"
                            position={Position.Left}
                        />
                        <BaseHandle
                            id="source-1"
                            type="source"
                            position={Position.Right}
                        />
                    </BaseNodeContent>
                </BaseNode>
            </WorkflowNode>
        )
    }
)

BaseExecNode.displayName = "BaseExecNode"