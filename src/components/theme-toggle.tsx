"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { toggleThemeWithTransition } from "@/lib/theme-transition"

export const ThemeToggle = () => {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                className="flex h-8 w-14 items-center rounded-full bg-muted p-1 transition-colors"
                aria-label="Toggle theme"
            >
                <div className="size-6 rounded-full bg-background shadow-sm" />
            </button>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <button
            onClick={(e) =>
                toggleThemeWithTransition(
                    () => setTheme(isDark ? "light" : "dark"),
                    e,
                )
            }
            className="group flex h-8 w-14 items-center rounded-full border border-border/60 bg-muted p-1 transition-colors duration-300 hover:border-border hover:bg-muted/80 active:scale-95"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <div
                className={`flex size-6 items-center justify-center rounded-full bg-background shadow-sm transform-gpu transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-active:scale-90 ${
                    isDark ? "translate-x-6 rotate-[360deg]" : "translate-x-0 rotate-0"
                }`}
            >
                {isDark ? (
                    <MoonIcon className="size-3.5 text-foreground" />
                ) : (
                    <SunIcon className="size-3.5 text-amber-500" />
                )}
            </div>
        </button>
    )
}

export const ThemeToggleCompact = () => {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                className="flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-colors"
                aria-label="Toggle theme"
            >
                <SunIcon className="size-4" />
            </button>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <button
            onClick={(e) =>
                toggleThemeWithTransition(
                    () => setTheme(isDark ? "light" : "dark"),
                    e,
                )
            }
            className="group flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-90"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {isDark ? (
                <MoonIcon className="size-4 transition-transform duration-300 group-hover:-rotate-12" />
            ) : (
                <SunIcon className="size-4 transition-transform duration-300 group-hover:rotate-45" />
            )}
        </button>
    )
}
