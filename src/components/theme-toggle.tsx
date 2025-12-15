"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

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
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-8 w-14 items-center rounded-full bg-muted p-1 transition-colors hover:bg-muted/80"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <div
                className={`flex size-6 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-200 ${isDark ? "translate-x-6" : "translate-x-0"
                    }`}
            >
                {isDark ? (
                    <MoonIcon className="size-3.5 text-foreground" />
                ) : (
                    <SunIcon className="size-3.5 text-foreground" />
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
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex size-9 items-center justify-center rounded-lg bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {isDark ? (
                <MoonIcon className="size-4" />
            ) : (
                <SunIcon className="size-4" />
            )}
        </button>
    )
}
