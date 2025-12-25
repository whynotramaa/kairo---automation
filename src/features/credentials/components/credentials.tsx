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
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <p>{<CredentialsItem data={credential} />}</p>}
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
}

export const CredentialsItem = ({
    data
}: { data: Credential }) => {

    const removeCredentials = useRemoveCredential()
    const prefetchCredentials = usePrefetchCredential()

    const handleRemove = () => {
        removeCredentials.mutate({ id: data.id })

    }

    const logo = credentialLogos[data.type] || "/logos/gemini.svg"

    const handleMouseEnter = () => {
        prefetchCredentials(data.id)
    }

    return (
        <EntityItem
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })} {" "}
                    &bull; Created {formatDistanceToNow(data.createdAt, { addSuffix: true })} {" "}

                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <Image src={logo} alt={data.type} width={20} height={20} />
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