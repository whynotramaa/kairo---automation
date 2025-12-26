import { SidebarTrigger } from "./ui/sidebar"

export const AppHeader = () => {
    return (
        <header className="flex h-20 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background">
            <SidebarTrigger />
            <span className="absolute left-1/2 -translate-x-1/2 text-sm text-muted-foreground/25 select-none">
                made with ❤️ by rama
            </span>
        </header>
    )
}