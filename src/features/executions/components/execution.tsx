"use client"

import { ExecutionStatus } from "@/generated/prisma"
import {
    CheckCircle2Icon,
    Clock8Icon,
    Loader2Icon,
    XCircleIcon,
    CalendarIcon,
    TimerIcon,
    HashIcon,
    AlertCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    TerminalIcon,
    WorkflowIcon,
    SparklesIcon
} from "lucide-react"
import { useExecutions } from "../hooks/use-executions"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AIMarkdown } from "@/components/ai-markdown"

const getStatusConfig = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return {
                icon: CheckCircle2Icon,
                label: "Success",
                variant: "default" as const,
                className: "bg-green-600 hover:bg-green-700 border-transparent"
            }
        case ExecutionStatus.FAILED:
            return {
                icon: XCircleIcon,
                label: "Failed",
                variant: "destructive" as const,
                className: ""
            }
        case ExecutionStatus.RUNNING:
            return {
                icon: Loader2Icon,
                label: "Running",
                variant: "secondary" as const,
                className: "text-blue-600"
            }
        default:
            return {
                icon: Clock8Icon,
                label: "Pending",
                variant: "outline" as const,
                className: "text-muted-foreground"
            }
    }
}

const DetailItem = ({ icon: Icon, label, value, children, className }: { icon?: any, label: string, value?: React.ReactNode, children?: React.ReactNode, className?: string }) => (
    <div className={cn("border rounded-lg p-4 bg-card/50 flex flex-col gap-3 transition-all hover:bg-accent/5", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
            {Icon && <Icon className="size-4" />}
            <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        </div>
        <div className="font-medium text-base">
            {value || children || "—"}
        </div>
    </div>
)

export const ExecutionView = ({ executionId }: { executionId: string }) => {

    const { data: execution } = useExecutions(executionId)
    const [showStackTree, setShowStackTree] = useState(false)

    if (!execution) {
        return (
            <Card className="shadow-sm border-muted/40">
                <CardHeader className="pb-10">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-[200px] bg-muted rounded animate-pulse" />
                            <div className="h-3 w-[150px] bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const statusConfig = getStatusConfig(execution.status)
    const StatusIcon = statusConfig.icon

    const duration = execution.completedAt
        ? ((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(2)
        : null

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Card */}
            <Card className="shadow-sm border-muted/40 overflow-hidden">
                <div className="bg-muted/30 p-6 border-b border-muted/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-full bg-background border shadow-sm",
                                execution.status === ExecutionStatus.RUNNING && "animate-pulse"
                            )}>
                                <StatusIcon className={cn("size-6",
                                    execution.status === ExecutionStatus.SUCCESS && "text-green-600",
                                    execution.status === ExecutionStatus.FAILED && "text-destructive",
                                    execution.status === ExecutionStatus.RUNNING && "text-blue-600 animate-spin",

                                )} />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Execution Details</h1>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span>ID:</span>
                                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{execution.id}</code>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant={statusConfig.variant} className={cn("px-3 py-1 text-sm font-medium", statusConfig.className)}>
                                {statusConfig.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailItem icon={WorkflowIcon} label="Workflow">
                            <Link
                                href={`/workflows/${execution.workflowId}`}
                                className="text-primary hover:underline hover:text-primary/80 transition-colors flex items-center gap-1"
                            >
                                {execution.workflow.name}
                            </Link>
                        </DetailItem>

                        <DetailItem icon={CalendarIcon} label="Started">
                            <span title={new Date(execution.startedAt).toLocaleString()}>
                                {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                            </span>
                        </DetailItem>

                        <DetailItem icon={Clock8Icon} label="Completed">
                            {execution.completedAt ? (
                                <span title={new Date(execution.completedAt).toLocaleString()}>
                                    {formatDistanceToNow(execution.completedAt, { addSuffix: true })}
                                </span>
                            ) : "—"}
                        </DetailItem>

                        <DetailItem icon={TimerIcon} label="Duration">
                            {duration ? `${duration}s` : "—"}
                        </DetailItem>
                    </div>

                    {execution.inngestEventId && (
                        <>
                            <Separator className="my-6" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem icon={HashIcon} label="Event ID">
                                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{execution.inngestEventId}</code>
                                </DetailItem>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Error Section */}
            {execution.error && (
                <Card className="shadow-sm border-destructive/50 bg-destructive/5 overflow-hidden">
                    <CardHeader className="border-b border-destructive/10 bg-destructive/10 pb-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircleIcon className="size-5" />
                            <CardTitle className="text-lg">Execution Failed</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-destructive mb-2">Error Message</h4>
                            <div className="bg-background border border-destructive/20 rounded-md p-4 text-sm font-mono text-destructive-foreground wrap-break-word">
                                {execution.error}
                            </div>
                        </div>

                        {execution.errorStack && (
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowStackTree(!showStackTree)}
                                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                >
                                    {showStackTree ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                                    {showStackTree ? "Hide Stack Trace" : "Show Stack Trace"}
                                </Button>

                                {showStackTree && (
                                    <div className="mt-4 bg-background border border-destructive/20 rounded-md p-4 overflow-x-auto">
                                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                                            {execution.errorStack}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Output Section */}
            {execution.output && (
                <Card className="shadow-sm border-muted/40 overflow-hidden">
                    <CardHeader className="border-b border-muted/40 bg-muted/10 pb-4">
                        <div className="flex items-center gap-2">
                            <TerminalIcon className="size-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Execution Output</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ExecutionOutput output={execution.output} />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Helper to check if a value looks like AI-generated markdown content
const isAIMarkdownContent = (value: unknown): value is string => {
    if (typeof value !== "string") return false
    // Check if it contains markdown indicators
    const markdownPatterns = [
        /^#+ /m,           // Headers
        /\*\*[^*]+\*\*/,   // Bold
        /\*[^*]+\*/,       // Italic
        /```[\s\S]*```/,   // Code blocks
        /`[^`]+`/,         // Inline code
        /^\s*[-*+] /m,     // Lists
        /^\s*\d+\. /m,     // Numbered lists
        /\[[^\]]+\]\([^)]+\)/, // Links
    ]
    return markdownPatterns.some(pattern => pattern.test(value))
}

// Helper to extract AI responses from output object
const extractAIResponses = (output: Record<string, unknown>): { key: string; content: string }[] => {
    const responses: { key: string; content: string }[] = []

    for (const [key, value] of Object.entries(output)) {
        if (typeof value === "string" && isAIMarkdownContent(value)) {
            responses.push({ key, content: value })
        } else if (typeof value === "object" && value !== null) {
            // Check nested objects for text/content fields
            const obj = value as Record<string, unknown>
            if (typeof obj.text === "string" && isAIMarkdownContent(obj.text)) {
                responses.push({ key, content: obj.text })
            } else if (typeof obj.content === "string" && isAIMarkdownContent(obj.content)) {
                responses.push({ key, content: obj.content })
            } else if (typeof obj.response === "string" && isAIMarkdownContent(obj.response)) {
                responses.push({ key, content: obj.response })
            } else if (typeof obj.message === "string" && isAIMarkdownContent(obj.message)) {
                responses.push({ key, content: obj.message })
            }
        }
    }

    return responses
}

// Get non-AI output (filter out AI responses for separate display)
const getNonAIOutput = (output: Record<string, unknown>, aiKeys: string[]): Record<string, unknown> => {
    const filtered: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(output)) {
        if (!aiKeys.includes(key)) {
            filtered[key] = value
        }
    }
    return filtered
}

const ExecutionOutput = ({ output }: { output: Record<string, unknown> }) => {
    const [showRawJson, setShowRawJson] = useState(false)
    const aiResponses = extractAIResponses(output)
    const aiKeys = aiResponses.map(r => r.key)
    const nonAIOutput = getNonAIOutput(output, aiKeys)
    const hasNonAIOutput = Object.keys(nonAIOutput).length > 0

    return (
        <div className="divide-y divide-muted/40">
            {/* AI Responses rendered with Streamdown */}
            {aiResponses.map(({ key, content }) => (
                <div key={key} className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="size-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">{key}</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <AIMarkdown content={content} />
                    </div>
                </div>
            ))}

            {/* Non-AI output or raw JSON */}
            {(hasNonAIOutput || aiResponses.length === 0) && (
                <div className="p-4">
                    {aiResponses.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRawJson(!showRawJson)}
                            className="mb-3 gap-2 text-muted-foreground"
                        >
                            {showRawJson ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                            {showRawJson ? "Hide" : "Show"} Raw Output
                        </Button>
                    )}

                    {(showRawJson || aiResponses.length === 0) && (
                        <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-foreground/80 whitespace-pre-wrap wrap-break-word">
                                {JSON.stringify(aiResponses.length === 0 ? output : nonAIOutput, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


