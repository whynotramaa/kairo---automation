import { AlertTriangleIcon, Loader2Icon, PlusIcon, SearchIcon, PackageOpenIcon, MoreVerticalIcon, TrashIcon, ChevronRightIcon } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import Link from "next/link";
import React, { ReactNode } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type EntityHeaderProps = {
    title: string,
    description?: string,
    newBtnLabel?: string,
    disabled?: boolean,
    isCreating?: boolean,
} & (
        | { onNew: () => void; newBtnHref?: never }
        | { newBtnHref: string; onNew?: never }
        | { onNew?: never; newBtnHref?: never }
    )


export const EntityHeader = ({
    title, description, newBtnLabel, disabled, isCreating, onNew, newBtnHref,
}: EntityHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between gap-x-4 pb-1 border-b border-border/10">
            <div className="flex flex-col gap-y-0.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/90">
                    {title}
                </h1>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground/80 font-normal">
                        {description}
                    </p>
                )}
            </div>

            {onNew && !newBtnHref && (
                <Button 
                    className="cursor-pointer rounded-full font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-xs px-4" 
                    disabled={disabled} 
                    isLoading={isCreating} 
                    size="sm" 
                    onClick={onNew}
                >
                    {!isCreating && <PlusIcon className="size-3.5 mr-1" />}
                    {newBtnLabel}
                </Button>
            )}
            {!onNew && newBtnHref && (
                <Link
                    href={newBtnHref}
                    prefetch
                    className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "cursor-pointer rounded-full font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-xs px-4 gap-1"
                    )}
                >
                    <PlusIcon className="size-3.5" />
                    {newBtnLabel}
                </Link>
            )
            }
        </div >
    )
}


type EntityContainerProps = {
    children: React.ReactNode,
    header?: React.ReactNode,
    search?: React.ReactNode,
    pagination?: React.ReactNode,
}

export const EntityContainer = ({ children, header, search, pagination }: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-8 h-full bg-background">
            <div className="mx-auto max-w-7xl w-full flex flex-col gap-y-6 h-full">
                {header}
                <div className="flex flex-col gap-y-4 h-full">
                    {search}
                    {children}
                </div>
                {pagination}
                <br />
            </div>
        </div>
    )
}


interface EntitySearchProps {
    value: string,
    onChange: (value: string) => void;
    placeholder?: string
}


export const EntitySearch = ({ value, onChange, placeholder = "Search" }: EntitySearchProps) => {
    return (
        <div className="relative w-full max-w-[240px] ml-auto group">
            <SearchIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
            <Input
                className="w-full bg-secondary/50 hover:bg-secondary/70 focus:bg-card shadow-none border border-border/30 focus:border-primary/45 focus:ring-[3px] focus:ring-primary/5 pl-9.5 pr-4 rounded-full h-9 text-xs transition-all duration-200 placeholder:text-muted-foreground/60"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}


interface EntityPaginationProps {
    page: number,
    totalPages: number,
    onPageChange: (page: number) => void;
    disabled?: boolean
    isLoading?: boolean
}

export const EntityPagination = ({
    page, totalPages, onPageChange, disabled, isLoading,
}: EntityPaginationProps) => {
    return (
        <div className="flex items-center justify-between gap-x-4 w-full border-t border-border/10 pt-4 mt-2">
            <div className="flex-1 text-xs md:text-sm font-medium text-muted-foreground/80">
                Page <span className="text-foreground/85 font-semibold">{totalPages === 0 ? 0 : page}</span> of <span className="text-foreground/85 font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    disabled={page === 1 || disabled}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 text-xs font-semibold hover:bg-secondary active:scale-[0.97] transition-all duration-150 border-border/40"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                    Previous
                </Button>
                <Button
                    disabled={page === totalPages || totalPages == 0 || disabled}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 text-xs font-semibold hover:bg-secondary active:scale-[0.97] transition-all duration-150 border-border/40"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

interface StateViewProps {
    message?: string
}

interface LoadingViewProps extends StateViewProps {
    entity?: string
}

export const LoadingView = ({ entity = "items", message }: LoadingViewProps) => {
    return (
        <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4 ">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
                {message || `Loading ${entity}`}
            </p>
        </div>
    )

}
interface ErrorViewProps extends StateViewProps {
    entity?: string
}

export const ErrorView = ({ entity = "items", message }: ErrorViewProps) => {
    return (
        <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4 ">
            <AlertTriangleIcon className="size-6 text-red-500" />
            <p className="text-sm text-muted-foreground">
                {message || `Loading ${entity}`}
            </p>
        </div>
    )

}

interface EmptyViewProps extends StateViewProps {
    onNew?: () => void;
    title?: string
    actionLabel?: string
    isCreating?: boolean
}

export const EmptyView = ({ title = "Nothing here yet", actionLabel = "Create", message, onNew, isCreating }: EmptyViewProps) => {
    const creatingCursorClassName = isCreating
        ? "disabled:pointer-events-auto disabled:cursor-loader"
        : ""

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <PackageOpenIcon />
                </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
                {title}
            </EmptyTitle>
            {!!message && (
                <EmptyDescription>
                    {message}
                </EmptyDescription>
            )}
            {!!onNew && (
                <EmptyContent>
                    <Button isLoading={isCreating} onClick={onNew}>
                        {actionLabel}
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )
}

interface EntityListProps<T> {
    items: T[]
    renderItem: (item: T, index: number) => ReactNode;
    getKey?: (item: T, index: number) => string | number;
    emptyView?: React.ReactNode
    className?: string
    grid?: boolean
}


export function EntityList<T>({
    items, renderItem, getKey, emptyView, className, grid,
}: EntityListProps<T>) {
    if (items.length === 0 && emptyView) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-md">
                    {emptyView}
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            grid
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-y-3",
            className
        )}>
            {items.map((item, index) => (
                <div
                    key={getKey ? getKey(item, index) : index}
                    className="animate-enter-up"
                    style={{ "--enter-delay": `${Math.min(index, 12) * 40}ms` } as React.CSSProperties}
                >
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    )
}

interface EntityItemProps {
    href: string;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    image?: React.ReactNode;
    actions?: React.ReactNode;
    onRemove?: () => void | Promise<void>
    isRemoving?: boolean;
    className?: string;
    onMouseEnter?: () => void;
}


export const EntityItem = ({
    href, title, subtitle, image, actions, onRemove, isRemoving, className, onMouseEnter
}: EntityItemProps) => {

    const handleActionMenuPointerDown = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const handleActionMenuClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isRemoving) {
            return
        }
        if (onRemove) {
            await onRemove()
        }
    }

    return (
        <Link
            href={href}
            prefetch
            onMouseEnter={onMouseEnter}
            className={cn(
                "block rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "active:scale-[0.985] transition-all duration-200 ease-out group",
                isRemoving && "pointer-events-none opacity-50",
            )}
        >
            <Card
                size="sm"
                className={cn(
                    "gap-0 py-0 ring-foreground/5 bg-card/60 dark:bg-card/20 border border-border/40 hover:border-primary/20 dark:hover:border-primary/30",
                    "shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_6px_16px_-8px_rgba(0,0,0,0.02)]",
                    "hover:shadow-[0_4px_16px_-3px_rgba(0,0,0,0.06),0_12px_24px_-8px_rgba(0,0,0,0.04)]",
                    "hover:bg-card/90 hover:-translate-y-[1px]",
                    "transition-all duration-300 ease-out",
                    isRemoving && "opacity-50",
                    className
                )}
            >
                <CardContent className="flex items-center justify-between gap-4 px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3.5">
                        {image && (
                            <div className="flex-shrink-0 size-10 rounded-xl bg-secondary/60 dark:bg-neutral-800/40 border border-border/20 dark:border-neutral-700/20 flex items-center justify-center shadow-2xs group-hover:scale-[1.04] transition-all duration-200">
                                {image}
                            </div>
                        )}

                        <div className="min-w-0 flex flex-col gap-y-0.5">
                            <CardTitle className="text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-200 flex items-center gap-2 flex-wrap">
                                {title}
                            </CardTitle>
                            {!!subtitle && (
                                <CardDescription className="truncate text-xs font-normal text-muted-foreground/80 flex items-center gap-1.5">
                                    {subtitle}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex shrink-0 items-center gap-1.5" onClick={handleActionMenuClick} onPointerDown={handleActionMenuPointerDown}>
                        {(actions || onRemove) && (
                            <div className="flex items-center gap-1">
                                {actions}
                                {onRemove && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            className={cn(
                                                buttonVariants({ variant: "ghost", size: "icon" }),
                                                "size-8 rounded-lg text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            )}
                                            onPointerDown={handleActionMenuPointerDown}
                                            onClick={handleActionMenuClick}
                                        >
                                            <MoreVerticalIcon className="size-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={handleActionMenuClick}>
                                            <DropdownMenuItem onClick={handleRemove} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                                <TrashIcon className="size-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        )}
                        <ChevronRightIcon className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 ease-out" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}