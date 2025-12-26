"use client"

import { AlertDialogFooter, AlertDialogHeader, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "./ui/alert-dialog"
import { authClient } from "@/lib/auth-client"
import { StarIcon } from "lucide-react"

interface UpgradeModalProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="p-8 max-w-sm sm:max-w-md rounded-2xl">
                <AlertDialogHeader className="space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <StarIcon className="h-7 w-7 text-primary" />
                    </div>
                    <AlertDialogTitle className="text-xl font-semibold text-center">
                        Upgrade to Pro
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
                        You need an active subscription to perform this action. Upgrade to Pro to unlock all features.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-3">
                    <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => authClient.checkout({ slug: 'Kairo-Pro' })}
                        className="w-full sm:w-auto"
                    >
                        Upgrade Now
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}