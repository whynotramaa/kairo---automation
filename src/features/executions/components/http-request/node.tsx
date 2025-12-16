"use client"

import { Node, NodeProps } from "@xyflow/react"
import { memo } from "react"
import { BaseExecNode } from "../base-execution-node"
import { GlobeIcon } from "lucide-react"

type HttpReqNodeData = {
    endpoint?: string,
    method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH"
    body?: string
    [key: string]: unknown

}


type HttpReqNodeType = Node<HttpReqNodeData>

export const HttpReqNode = memo((props: NodeProps<HttpReqNodeType>) => {
    const nodeData = props.data as HttpReqNodeData
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"}:${nodeData.endpoint}`
        : "Not Configured"

    return (
        <>
            <BaseExecNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                description={description}
                onSettings={() => { }}
                onDoubleClick={() => { }}
            />
        </>
    )
})


HttpReqNode.displayName = "HttpreqNode"