"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react"
import { memo, useState } from "react"
import { BaseExecNode } from "../base-execution-node"
import { GlobeIcon } from "lucide-react"
import { HttpReqFormValues, HttpReqDialog } from "./dialog"

type HttpReqNodeData = {
    endpoint?: string,
    method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH"
    body?: string

}


type HttpReqNodeType = Node<HttpReqNodeData>

export const HttpReqNode = memo((props: NodeProps<HttpReqNodeType>) => {

    const { setNodes } = useReactFlow()

    const [dialogOpen, setDialogOpen] = useState(false)

    const nodeStatus = "success"

    const handleOpenSettings = () => setDialogOpen(true)

    const handleSubmit = (values: HttpReqFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return { ...node, data: { ...node.data, ...values } }
            }
            return node
        }))
    }

    const nodeData = props.data as HttpReqNodeData
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"}:${nodeData.endpoint}`
        : "Not Configured"


    return (
        <>
            <HttpReqDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                description={description}
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})


HttpReqNode.displayName = "HttpreqNode"