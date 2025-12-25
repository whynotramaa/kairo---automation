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



export const AVAILABLE_MODELS = [
    "gpt-5.2-pro",
    "gpt-5.2",
    "gpt-5.1",
    "gpt-5-pro",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-4o",
    "gpt-4o-mini",
] as const


const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, { message: "Variable name must start with letter or underscore and must not contain other special chars" }),
    credentialId: z.string().min(1, "Credential ID is required"),
    model: z.string().min(1, "AI Model is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
})

export type OpenAIFormValues = z.infer<typeof formSchema>

interface OpenAIProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<OpenAIFormValues>
}

export const OpenAIDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: OpenAIProps) => {

    const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(CredentialType.OPENAI)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "openAI",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || AVAILABLE_MODELS[0],
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || ""
        }
    })

    // reset to defaults
    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "OpenAI",
                credentialId: defaultValues.credentialId || "",
                model: defaultValues.model || AVAILABLE_MODELS[0],
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || ""
            })
        }
    }, [open, defaultValues, form])

    const watchVarName = form.watch("variableName") || "OpenAI"

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>OpenAI</DialogTitle>
                    <DialogDescription>
                        Configure AI models and prompt for OpenAI .
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>AI Node Name</FormLabel>

                                    <FormControl>
                                        <Input placeholder="OpenAI-node" {...field} />
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
                                        <FormLabel>OpenAI Credential</FormLabel>

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
                                                                <Image src="/logos/openai.svg" alt={selectedCredential.name} width={16} height={16} />
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
                                                            <Image src="/logos/openai.svg" alt={credential.name} width={16} height={16} />
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

                        {/* ------------------ */}
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => {
                                const selectedModel = AVAILABLE_MODELS.find(m => m === field.value)
                                return (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>

                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue>
                                                        {selectedModel || <span className="text-muted-foreground">Select a model</span>}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {AVAILABLE_MODELS.map((model) => (
                                                    <SelectItem key={model} value={model}>
                                                        {model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>

                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        {/* ------------------ */}

                        {/* ------------------ */}

                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[20px] font-mono te-sm" placeholder="Act as Harvey Specter ... " {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* ------------------ */}

                        <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[80px] font-mono te-sm" placeholder="Summarize the whatsapp conversation with {{httpResponse.whatsapp.user[0]}}" {...field} />
                                    </FormControl>

                                    <FormDescription>
                                        The prompt to send to AI. Use {"{{variables}}"} for simple values or {"{{JSON variable}}"} to stringify objects
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