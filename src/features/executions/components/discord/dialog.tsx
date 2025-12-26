"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";




const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, { message: "Variable name must start with letter or underscore and must not contain other special chars" }),
    username: z.string().optional(),
    content: z.string().min(1, "Message Content is required").max(2000, "Discord messages cannot exceed 2000 chars"),
    webhookUrl: z.string().min(1, "Webhook URL is requirede") // we are not using url but string because we have templating that helps us access older urls and vars
})

export type DiscordFormValues = z.infer<typeof formSchema>

interface DiscordProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<DiscordFormValues>
}

export const DiscordDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: DiscordProps) => {



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "Discord-Node",
            username: defaultValues.username || "",
            content: defaultValues.content || "",
            webhookUrl: defaultValues.webhookUrl || ""
        }
    })

    // reset to defaults
    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "Discord-Node",
                username: defaultValues.username || "",
                content: defaultValues.content || "",
                webhookUrl: defaultValues.webhookUrl || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVarName = form.watch("variableName") || "Discord-Node"

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord Configuration</DialogTitle>
                    <DialogDescription>
                        Configure Discord webhook settigs for this node.
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discord Node Name</FormLabel>

                                    <FormControl>
                                        <Input placeholder="Discord-Node" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the result in other nodes. {" "}
                                        {`{{${watchVarName}.text}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ---------------- */}

                        {/* ---------------- */}

                        <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Webhook URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://discord.com/api/webhooks/..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Get this from Discord: Channel Settings → Integerations → Webhooks
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />



                        {/* ------------------ */}

                        {/* ------------------ */}

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Summary: {{prevNode.gemini.text}}"
                                            className="min-h-[20px] font-mono te-sm" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The message to send on Discord. Use {"{{variables}}"} for simple values or {"{{JSON variable}}"} to stringify objects
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* ------------------ */}

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Bot Username (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Kairo Bot"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Override the webhook&apos;s default username.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}