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
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toggleThemeWithTransition } from "@/lib/theme-transition";


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
    const { state } = useSidebar()
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
                        className="gap-x-4 cursor-pointer h-10 px-4 w-full flex items-center justify-between group/theme-btn"
                        onClick={(e) =>
                            toggleThemeWithTransition(
                                () => setTheme(isDark ? "light" : "dark"),
                                e,
                            )
                        }
                    >
                        <div className="flex items-center gap-x-4">
                            {mounted && isDark ? (
                                <MoonIcon className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover/theme-btn:rotate-12 group-hover/theme-btn:scale-110" />
                            ) : (
                                <SunIcon className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover/theme-btn:rotate-45 group-hover/theme-btn:scale-110" />
                            )}
                            <span>Dark Mode</span>
                        </div>
                        {mounted && state === "expanded" && (
                            <div
                                className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border/70 bg-muted transition-colors duration-300 group-hover/theme-btn:border-border"
                            >
                                <span
                                    className={`pointer-events-none flex h-3.5 w-3.5 items-center justify-center rounded-full bg-card shadow-xs transition-all duration-500 transform-gpu [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
                                        isDark
                                            ? "translate-x-[18px] rotate-[360deg]"
                                            : "translate-x-0.5 rotate-0"
                                    } group-hover/theme-btn:scale-110 group-active/theme-btn:scale-90`}
                                >
                                    {isDark ? (
                                        <MoonIcon className="size-2 fill-yellow-400/10 text-yellow-400" />
                                    ) : (
                                        <SunIcon className="size-2 fill-amber-500/10 text-amber-500" />
                                    )}
                                </span>
                            </div>
                        )}
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