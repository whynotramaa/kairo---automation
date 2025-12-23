"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface GoogleFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormDialog = ({ open, onOpenChange }: GoogleFormProps) => {

    const params = useParams()
    const workflowId = params.workflowId as string

    // contruct the webhook URL

    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const webhookURL = `${baseURL}/api/webhooks/google-form?workflowId=${workflowId}`

    const copyToCLipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookURL)
            toast.success("Webhook URL copied to clipboard")
        }
        catch {
            toast.error("Failed to copy URL")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google form {" "}
                        <span className="font-semibold ">
                            Apps Script
                        </span>
                        {" "}to trigger this workflow when a form is submitted.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input id="webhook-url" value={webhookURL} readOnly className="font-mono text-sm" />
                            <Button type="button" size="icon" variant="outline" onClick={copyToCLipboard}>
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>

                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-sm">
                                Setup Instructions
                            </h4>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                <li>Open your Google Form</li>
                                <li>Click the three dots menu → Apps Script </li>
                                <li>Copy and paste the script below </li>
                                <li>Replace WEBHOOK_URL with your webhook url above </li>
                                <li>Save and click <span className="font-semibold">Triggers</span> → Add Trigger  </li>
                                <li>Choose from Form → On form submit → Save  </li>
                            </ol>
                        </div>

                        <div className="rounded-lg bg-muted p-4 space-y-3">
                            <h4 className="font-medium text-sm">
                                Google Apps Script:
                            </h4>
                            <Button type="button" variant="outline" onClick={async () => {
                                const script = generateGoogleFormScript(webhookURL)
                                try {
                                    await navigator.clipboard.writeText(script)
                                    toast.success("Script copied to clipboard")
                                }
                                catch {
                                    toast.error("Failed to copy script.")
                                }
                            }}>
                                <CopyIcon className="size-4 mr-2" />
                                Copy Google Apps Script
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                This script includes your webhook URL and handles form submissions.
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <h4 className="font-medium text-sm">
                                Available Variables
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                        <code className="bg-background px-1 py-0.5 rounded">
                                            {"{{googleForm.respondentEmail}}"}
                                        </code>
                                        - Respondent Email
                                    </li>
                                    <li>
                                        <code className="bg-background px-1 py-0.5 rounded">
                                            {"{{googleForm.responses['Question Name]}}"}
                                        </code>
                                        - Specific Answer
                                    </li>
                                    <li>
                                        <code className="bg-background px-1 py-0.5 rounded">
                                            {"{{googleForm.responses}}"}
                                        </code>
                                        - All Responses as JSON
                                    </li>
                                </ul>
                            </h4>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}