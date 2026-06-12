"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

export const OPENCODE_MODELS = [
    // Free models
    "grok-build-0.1",
    "big-pickle",
    "deepseek-v4-flash-free",
    "mimo-v2.5-free",
    "north-mini-code-free",
    "nemotron-3-ultra-free",
    "qwen3.6-plus-free",
    "minimax-m3-free",
    // Paid models
    "deepseek-v4-pro",
    "deepseek-v4-flash",
    "kimi-k2.6",
    "kimi-k2.5",
    "qwen3.6-plus",
    "qwen3.5-plus",
    "glm-5.1",
    "glm-5",
    "minimax-m2.7",
    "minimax-m2.5",
    // GPT via OpenCode
    "gpt-5.5",
    "gpt-5.5-pro",
    "gpt-5.4",
    "gpt-5.4-mini",
    "gpt-5.4-nano",
    // Claude via OpenCode
    "claude-sonnet-4-6",
    "claude-opus-4-8",
    "claude-haiku-4-5",
    // Gemini via OpenCode
    "gemini-3.5-flash",
    "gemini-3.1-pro",
] as const

const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, { message: "Variable name must start with letter or underscore and must not contain other special chars" }),
    credentialId: z.string().min(1, "Credential ID is required"),
    model: z.string().min(1, "AI Model is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
})

export type OpenCodeFormValues = z.infer<typeof formSchema>

interface OpenCodeProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: OpenCodeFormValues) => void
    defaultValues?: Partial<OpenCodeFormValues>
}

export const OpenCodeDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: OpenCodeProps) => {
    const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(CredentialType.OPENCODE)

    const form = useForm<OpenCodeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "openCode",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || OPENCODE_MODELS[0],
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || ""
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "openCode",
                credentialId: defaultValues.credentialId || "",
                model: defaultValues.model || OPENCODE_MODELS[0],
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVarName = form.watch("variableName") || "openCode"

    const handleSubmit = (values: OpenCodeFormValues) => {
        onSubmit(values)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>OpenCode (Zen)</DialogTitle>
                    <DialogDescription>
                        Generate code and text using OpenCode Zen models.
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Node Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="opencode-node" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the result in other nodes.{" "}
                                        {`{{${watchVarName}.aiResponse}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => {
                                const selectedCredential = credentials?.find(c => c.id === field.value)
                                const placeholderText = isLoadingCredentials
                                    ? "Loading credentials..."
                                    : credentials?.length
                                        ? "Select your credential to use"
                                        : "No credentials found"
                                return (
                                    <FormItem>
                                        <FormLabel>OpenCode Credential</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            disabled={isLoadingCredentials}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue>
                                                        {selectedCredential ? (
                                                            <div className="flex items-center gap-2">
                                                                <Image src="/logos/opencode.svg" alt={selectedCredential.name} width={16} height={16} />
                                                                {selectedCredential.name}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">{placeholderText}</span>
                                                        )}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentials?.map((credential) => (
                                                    <SelectItem key={credential.id} value={credential.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Image src="/logos/opencode.svg" alt={credential.name} width={16} height={16} />
                                                            {credential.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue>
                                                    {field.value || <span className="text-muted-foreground">Select a model</span>}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {OPENCODE_MODELS.map((model) => (
                                                <SelectItem key={model} value={model}>
                                                    {model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[20px] font-mono text-sm" placeholder="You are an expert software engineer..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[80px] font-mono text-sm" placeholder="Write a function that {{httpResponse.description}}" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
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
