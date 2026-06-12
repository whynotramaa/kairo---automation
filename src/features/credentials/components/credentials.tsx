"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Credential, CredentialType } from "@/generated/prisma";
import { KeyIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCredential, useCredentialsList, usePrefetchCredential, useRemoveCredential } from "../hooks/use-credentials";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CredentialsForm } from "./credential-form";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";


export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();

    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams })

    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Credentials"
        />
    )
}

export const CredentialsList = () => {
    const credentials = useCredentialsList();

    if (credentials.data?.items.length == 0) {
        return (
            <CredentialsEmpty />
        )
    }

    if (credentials.isLoading && !credentials.data) {
        return <CredentialsLoading />
    }

    if (credentials.isError) {
        return <CredentialsError />
    }

    if (!credentials.data) {
        return <CredentialsLoading />
    }
    // When changing pages/search, keepPreviousData keeps the old page in place.
    if (credentials.isFetching && credentials.isPlaceholderData) {
        return <CredentialsLoading />
    }

    return (
        <EntityList
            grid
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialsItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />)
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader
            title="Credentials"
            description="Create and manage your credentials"
            newBtnHref="/credentials/new"
            newBtnLabel="New Credential"
            disabled={disabled}
        />
    )
}

export const CredentialsPagination = () => {
    const credentials = useCredentialsList()
    const [params, setParams] = useCredentialsParams()

    const page = credentials.data?.page ?? params.page
    const totalPages = credentials.data?.totalPages ?? 0

    return (
        <EntityPagination
            disabled={credentials.isFetching || credentials.isLoading}
            isLoading={credentials.isFetching || credentials.isLoading}
            totalPages={totalPages}
            page={page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const CredentialsContainer = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <EntityContainer header={<CredentialsHeader />} search={<CredentialsSearch></CredentialsSearch>} pagination={<CredentialsPagination></CredentialsPagination>} >
            {children}
        </EntityContainer>
    )
}


export const CredentialsLoading = () => {
    return <LoadingView entity="credentials" />
}

export const CredentialsError = () => {
    return <ErrorView entity="Error loading credentials" />
}

export const CredentialsEmpty = () => {
    const router = useRouter()

    const handleCreate = () => {
        router.push("/credentials/new")
    }

    return (
        <EmptyView
            onNew={handleCreate}
            title="No credentials yet"
            actionLabel="Create credential"
            message="Create your first credential to connect to external services."
        />
    )
}

const credentialLogos: Record<CredentialType, string> = {
    [CredentialType.GEMINI]: "/logos/gemini.svg",
    [CredentialType.OPENAI]: "/logos/openai.svg",
    [CredentialType.GROQ]: "/logos/groq.svg",
    [CredentialType.ANTHROPIC]: "/logos/claude-ai-icon.svg",
    [CredentialType.OPENROUTER]: "/logos/openrouter.svg",
    [CredentialType.OPENCODE]: "/logos/opencode.svg",
}

const getCredentialLogo = (type: CredentialType, isDark: boolean): string => {
    if (type === CredentialType.OPENAI) {
        return isDark ? "/logos/openai_dark.svg" : "/logos/openai.svg"
    }
    return credentialLogos[type] || "/logos/gemini.svg"
}

const providerLabels: Record<CredentialType, string> = {
    [CredentialType.GEMINI]: "Gemini",
    [CredentialType.OPENAI]: "OpenAI",
    [CredentialType.GROQ]: "Groq",
    [CredentialType.ANTHROPIC]: "Anthropic",
    [CredentialType.OPENROUTER]: "OpenRouter",
    [CredentialType.OPENCODE]: "OpenCode",
}

const badgeColors: Record<CredentialType, string> = {
    [CredentialType.GEMINI]: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    [CredentialType.OPENAI]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    [CredentialType.GROQ]: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    [CredentialType.ANTHROPIC]: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    [CredentialType.OPENROUTER]: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    [CredentialType.OPENCODE]: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
}

export const CredentialsItem = ({
    data
}: { data: Credential }) => {

    const removeCredentials = useRemoveCredential()
    const prefetchCredentials = usePrefetchCredential()
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = mounted && resolvedTheme === "dark"

    const handleRemove = () => {
        removeCredentials.mutate({ id: data.id })
    }

    const logo = getCredentialLogo(data.type, isDark)

    const handleMouseEnter = () => {
        prefetchCredentials(data.id)
    }

    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="truncate font-semibold text-sm max-w-[110px] md:max-w-[140px]">{data.name}</span>
                    <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide border uppercase shrink-0",
                        badgeColors[data.type]
                    )}>
                        {providerLabels[data.type]}
                    </span>
                </div>
            }
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                </>
            }
            image={
                <div className="size-6 flex items-center justify-center shrink-0">
                    <Image src={logo} alt={data.type} width={18} height={18} className="object-contain" />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredentials.isPending}
            onMouseEnter={handleMouseEnter}
        />
    )
}


export const CredentialView = ({ credentialId }: { credentialId: string }) => {
    const params = useParams()
    const { data: credential } = useCredential(credentialId)

    return <CredentialsForm initialData={credential} />
}