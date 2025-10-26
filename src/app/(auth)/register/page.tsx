import { RegisterForm } from "@/components/register-form"
import { requireUnauth } from "@/lib/auth-utils"
import Image from "next/image"
import Link from "next/link"


const RegisterPage = async () => {

    await requireUnauth()

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-2 self-center font-medium">
                    <Image src="/logos/KairoLogo.png" width={52} height={52} alt="KairoLogo" />
                </Link>
                <RegisterForm />
            </div>
        </div>
    )
}

export default RegisterPage