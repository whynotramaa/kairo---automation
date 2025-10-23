"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

export const LogoutButton = () => {
    const router = useRouter()
    return (
        <Button className="cursor-pointer" onClick={() => authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login")
                }
            }
        })}>
            Logout
        </Button>
    )
}