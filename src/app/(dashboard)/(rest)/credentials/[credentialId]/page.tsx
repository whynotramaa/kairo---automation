import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
    params: Promise<{
        credentialId: string;
    }>
}

const Page = async ({ params }: PageProps) => {
    await requireAuth()
    const { credentialId } = await params;
    return (
        <h1>
            Credential Id : {credentialId}
        </h1>
    )
}

export default Page