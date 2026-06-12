"use client"

import { CredentialType } from "@/generated/prisma"
import { useRouter } from "next/navigation"
import { useCreateCredential, useUpdateCredential } from "../hooks/use-credentials"
import { useUpgradeModal } from "@/hooks/use-upgrade-mobile"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

const formSchema = z.object({
    name: z.string().min(1, "Name is required !"),
    value: z.string().min(1, "API Key is required !"),
    type: z.enum(CredentialType)
})

type FormValues = z.infer<typeof formSchema>


const credentialTypeOptions = [
    {
        value: CredentialType.OPENAI,
        label: "OpenAI",
        logo: "/logos/openai.svg"
    },
    {
        value: CredentialType.GEMINI,
        label: "Gemini",
        logo: "/logos/gemini.svg"
    },
    {
        value: CredentialType.GROQ,
        label: "Groq",
        logo: "/logos/groq.svg"
    },
    {
        value: CredentialType.ANTHROPIC,
        label: "Claude",
        logo: "/logos/claude-ai-icon.svg"
    },
    {
        value: CredentialType.OPENROUTER,
        label: "OpenRouter",
        logo: "/logos/openrouter.svg"
    },
    {
        value: CredentialType.OPENCODE,
        label: "OpenCode (Zen)",
        logo: "/logos/opencode.svg"
    },
]

interface CredentialFormProps {
    initialData?: {
        id?: string,
        name: string,
        type: CredentialType,
        value: string
    }
}

export const CredentialsForm = ({ initialData }: CredentialFormProps) => {
    const router = useRouter()
    const createCredential = useCreateCredential()
    const updateCredential = useUpdateCredential()

    const { handleError, modal } = useUpgradeModal()
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = mounted && resolvedTheme === "dark"

    const getCredentialLogo = (type: CredentialType) => {
        if (type === CredentialType.OPENAI) {
            return isDark ? "/logos/openai_dark.svg" : "/logos/openai.svg"
        }
        return credentialTypeOptions.find(opt => opt.value === type)?.logo || "/logos/gemini.svg"
    }

    const isEdit = !!initialData?.id

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            type: CredentialType.GEMINI,
            value: ""
        }

    })


    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData.id, ...values,
            })
        } else {
            await createCredential.mutateAsync(values, {
                onSuccess: (data) => {
                    router.push(`/credentials/`)
                },

                onError: (error) => {
                    handleError(error)
                }
            })
        }
    }

    return (
        <>
            {modal}
            <Card className="shadown-none">
                <CardHeader>
                    <CardTitle>
                        {isEdit ? "Edit Credentials" : "Create Credential"}
                    </CardTitle>
                    <CardDescription>
                        {isEdit
                            ? "Update your API key or credential details"
                            : "Add a new API key or credential to your account"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My API Key" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="type"
                                render={({ field }) => {
                                    const selectedOption = credentialTypeOptions.find(opt => opt.value === field.value)
                                    return (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue>
                                                            {selectedOption && (
                                                                <div className="flex items-center gap-2">
                                                                    <Image src={getCredentialLogo(selectedOption.value)} alt={selectedOption.label} width={16} height={16} />
                                                                    {selectedOption.label}
                                                                </div>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                </FormControl>

                                                <SelectContent>
                                                    {credentialTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <Image src={getCredentialLogo(option.value)} alt={option.label!} width={16} height={16} />
                                                                {option.label}
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

                            <FormField control={form.control} name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="sk-*** **** ***" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    isLoading={createCredential.isPending || updateCredential.isPending}
                                >
                                    {isEdit ? "Update" : "Create"}
                                </Button>

                                <Button variant="outline" type="button" asChild>
                                    <Link href="/credentials" prefetch>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card >
        </>
    )



}