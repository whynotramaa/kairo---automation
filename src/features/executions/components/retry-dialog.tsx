"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangleIcon, Loader2Icon, XIcon } from "lucide-react"

export interface RetryInfo {
    workflowId: string
    inngestEventId: string
    attempt: number
    maxRetries: number
    errorMessage?: string
    nodeName?: string
}

interface RetryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    retryInfo: RetryInfo | null
    onCancel: () => void
    onContinue: () => void
    isCancelling?: boolean
}

export const RetryDialog = ({
    open,
    onOpenChange,
    retryInfo,
    onCancel,
    onContinue,
    isCancelling = false,
}: RetryDialogProps) => {
    if (!retryInfo) return null

    const attemptsRemaining = retryInfo.maxRetries - retryInfo.attempt

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="p-6 max-w-sm sm:max-w-md rounded-2xl">
                <AlertDialogHeader className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                        <AlertTriangleIcon className="h-6 w-6 text-amber-500" />
                    </div>
                    <AlertDialogTitle className="text-lg font-semibold text-center">
                        Workflow Error - Retrying
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed space-y-2">
                        <p>
                            An error occurred during execution.
                            {retryInfo.nodeName && (
                                <span className="font-medium"> ({retryInfo.nodeName})</span>
                            )}
                        </p>
                        {retryInfo.errorMessage && (
                            <p className="text-xs bg-muted/50 rounded-lg p-2 font-mono break-all">
                                {retryInfo.errorMessage}
                            </p>
                        )}
                        <p className="text-sm">
                            <span className="font-medium text-foreground">Attempt {retryInfo.attempt}</span>
                            {" of "}
                            <span className="font-medium text-foreground">{retryInfo.maxRetries}</span>
                            {attemptsRemaining > 0 ? (
                                <span className="text-muted-foreground">
                                    {" "}• {attemptsRemaining} {attemptsRemaining === 1 ? "retry" : "retries"} remaining
                                </span>
                            ) : (
                                <span className="text-destructive"> • Final attempt</span>
                            )}
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                    <AlertDialogAction
                        onClick={onCancel}
                        variant="destructive"
                        className="w-full sm:w-auto gap-2"
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                            <XIcon className="h-4 w-4" />
                        )}
                        Cancel Run
                    </AlertDialogAction>
                    <AlertDialogCancel
                        onClick={onContinue}
                        className="w-full sm:w-auto"
                        disabled={isCancelling}
                    >
                        Keep Retrying
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
