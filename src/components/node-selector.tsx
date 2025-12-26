"use client"

import { NodeType } from "@/generated/prisma"
import { GlobeIcon, MousePointer2Icon } from "lucide-react";
import Image from "next/image"
import React, { useCallback } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { SelectSeparator } from "./ui/select";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { createId } from "@paralleldrive/cuid2"

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string,
    icon: React.ComponentType<{ className?: string }> | string;
}

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger Manually",
        description: "Runs the flow on clicking a button.",
        icon: MousePointer2Icon
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form",
        description: "Runs the flow when a google form is submitted.",
        icon: '/logos/googleform.svg'
    },
    {
        type: NodeType.STRIPE_TRIGGER,
        label: "Stripe",
        description: "Runs the flow when a stripe event is captured.",
        icon: '/logos/stripe.svg'
    }
]


const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Makes an HTTP request",
        icon: GlobeIcon
    },
    {
        type: NodeType.GEMINI,
        label: "Gemini ",
        description: "Uses Google Gemini to generate text",
        icon: "/logos/gemini.svg"
    },
    {
        type: NodeType.OPENAI,
        label: "Chat GPT ",
        description: "Uses ChatGPT to generate text",
        icon: "/logos/openai.svg"
    },
    {
        type: NodeType.GROQ,
        label: "Groq Provider",
        description: "Uses open-source models to generate text",
        icon: "/logos/groq.svg"
    },
    {
        type: NodeType.ANTHROPIC,
        label: "Claude",
        description: "Uses Anthropic Claude to generate text",
        icon: "/logos/claude-ai-icon.svg"
    },
    {
        type: NodeType.DISCORD,
        label: "Discord",
        description: "Automate Discord messages through Kairo",
        icon: "/logos/discord.svg"
    },
    {
        type: NodeType.SLACK,
        label: "Slack",
        description: "Automate Slack messages through Kairo",
        icon: "/logos/slack.svg"
    },
]


interface NodeSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function NodeSelector({ open, onOpenChange, children }: NodeSelectorProps) {

    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow()

    const handleNodeSelect = useCallback((selection: NodeTypeOption) => {

        // check if already there is a manual trigger
        if (selection.type === NodeType.MANUAL_TRIGGER) {
            const nodes = getNodes()
            const hasManualTrigger = nodes.some(
                (node) => node.type === NodeType.MANUAL_TRIGGER
            )

            if (hasManualTrigger) {
                toast.error("Only one manual trigger is allowed at once.")
                return
            }
        }

        setNodes((nodes) => {
            const filteredNodes = nodes.filter((node) => node.type !== NodeType.INITIAL)
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2

            const flowPosition = screenToFlowPosition({
                x: centerX + (Math.random() - 1.5) * 200,
                y: centerY + (Math.random() - 1.5) * 200
            })

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type,
            }

            return [...filteredNodes, newNode]

        })

        onOpenChange(false)

    }, [
        setNodes, getNodes, onOpenChange, screenToFlowPosition
    ])


    return (
        <Sheet open={open} onOpenChange={onOpenChange} >
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto overflow-x-hidden">
                <SheetHeader>
                    <SheetTitle>
                        What triggers this workflow ?
                    </SheetTitle>
                    <SheetDescription>
                        A trigger is step that starts your workflow.
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((nodeType) => {
                        const Icon = nodeType.icon
                        return (
                            <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary" onClick={() => handleNodeSelect(nodeType)}>
                                <div className="flex items-center gap-6 w-full min-w-0 overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <Image
                                            src={Icon}
                                            alt={nodeType.label}
                                            width={20}
                                            height={20}
                                            unoptimized
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left min-w-0">
                                        <span className="font-medium text-sm wrap-break-word">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground wrap-break-word">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <SelectSeparator />

                <div>
                    {executionNodes.map((nodeType) => {
                        const Icon = nodeType.icon
                        return (
                            <div key={nodeType.type} className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary" onClick={() => handleNodeSelect(nodeType)}>
                                <div className="flex items-center gap-6 w-full min-w-0 overflow-hidden">
                                    {typeof Icon === "string" ? (
                                        <Image
                                            src={Icon}
                                            alt={nodeType.label}
                                            width={20}
                                            height={20}
                                            unoptimized
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                        <Icon className="size-5" />
                                    )}
                                    <div className="flex flex-col items-start text-left min-w-0">
                                        <span className="font-medium text-sm wrap-break-word">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground wrap-break-word">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}