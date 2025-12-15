"use client";

import {
    CreditCardIcon,
    FolderOpenIcon,
    HistoryIcon,
    KeyIcon,
    LogOutIcon,
    MoonIcon,
    StarIcon,
    SunIcon,
} from "lucide-react"

import Image from "next/image"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";


const menuItems = [{
    title: "Root",
    items: [

        {
            title: "Workflows",
            icon: FolderOpenIcon,
            url: "/workflows"
        },
        {
            title: "Executions",
            icon: HistoryIcon,
            url: "/executions"
        },
        {
            title: "Credentials",
            icon: KeyIcon,
            url: "/credentials"
        },

    ]
}]



export const AppSidebar = () => {
    const router = useRouter()
    const pathname = usePathname()
    const { hasActiveSubscription, isLoading } = useHasActiveSubscription()
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = resolvedTheme === "dark"

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="gap-x-4 h-10 px-6 top-2">
                        <Link href="/workflows" prefetch>
                            <Image src="/logos/KairoLogo.png" width={52} height={52} alt="Kairo" />

                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton tooltip={item.title}
                                            isActive={
                                                item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
                                            }
                                            asChild
                                            className="gap-x-4 h-10 px-4"  >
                                            <Link href={item.url} prefetch>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                {!hasActiveSubscription && !isLoading && (
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Upgrade to Pro" className="gap-x-4 cursor-pointer h-10 px-4" onClick={() => authClient.checkout({ slug: "Kairo-Pro" })}>
                            <StarIcon className="h-4 w-4" />
                            <span>Upgrade to Pro</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Billing Portal" className="gap-x-4 h-10 px-4 cursor-pointer" onClick={() => { authClient.customer.portal() }}>
                        <CreditCardIcon className="h-4 w-4" />
                        <span>Billing</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip={isDark ? "Light Mode" : "Dark Mode"}
                        className="gap-x-4 cursor-pointer h-10 px-4"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                    >
                        {mounted && isDark ? (
                            <MoonIcon className="h-4 w-4" />
                        ) : (
                            <SunIcon className="h-4 w-4" />
                        )}
                        <span>{mounted && isDark ? "Dark Mode" : "Light Mode"}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Log Out" className="gap-x-4 cursor-pointer h-10 px-4" onClick={() => authClient.signOut({
                        fetchOptions: {
                            onSuccess: () => {
                                router.push("/login")
                            },
                            onError: (ctx) => {
                                toast.error("Failed to log out. Please Try Again.")
                                console.error(ctx.error)
                            }
                        }
                    })}>
                        <LogOutIcon className="h-4 w-4" />
                        <span>Log Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </Sidebar>
    )
}