import { UpgradeModal } from "@/components/upgrade-modal"
import { TRPCClientError } from "@trpc/client"
import { useState } from "react"
import { toast } from "sonner"


export const useUpgradeModal = () => {
    const [open, setOpen] = useState(false)

    const handleError = (error: unknown) => {
        if (error instanceof TRPCClientError) {
            if (error.data?.code === "FORBIDDEN") {
                // Check if it's specifically a workflow limit error
                if (error.message === "WORKFLOW_LIMIT_REACHED") {
                    toast.error("Only one workflow is allowed on the free tier. Upgrade to Pro for unlimited workflows!")
                }
                setOpen(true)
                return true
            }
        }
        return false
    }
    const modal = <UpgradeModal open={open} onOpenChange={setOpen} />

    return { handleError, modal }
}