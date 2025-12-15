import { AlertTriangleIcon, Loader2Icon, PlusIcon, SearchIcon, PackageOpenIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
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
    const creatingCursorClassName = isCreating
        ? "disabled:pointer-events-auto disabled:cursor-loader"
        : ""

    return (
        <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-semibold">
                    {title}
                </h1>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {onNew && !newBtnHref && (
                <Button className={`cursor-pointer ${creatingCursorClassName}`} disabled={isCreating || disabled} size="sm" onClick={onNew} >
                    <PlusIcon className="size-4" />
                    {newBtnLabel}
                </Button>
            )}
            {!onNew && newBtnHref && (
                <Link
                    href={newBtnHref}
                    prefetch
                    className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "cursor-pointer"
                    )}
                >
                    <PlusIcon className="size-4" />
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
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-7xl w-full flex flex-col gap-y-8 h-full">
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
        <div className="relative ml-auto">
            <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
                className="max-w-[200px] bg-background shadow-none border-border pl-8"
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
    const loadingCursorClassName = isLoading
        ? "disabled:pointer-events-auto disabled:cursor-wait"
        : ""

    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    disabled={page === 1 || disabled}
                    variant="outline"
                    className={`cursor-pointer ${loadingCursorClassName}`}
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                    Previous
                </Button>
                <Button
                    disabled={page === totalPages || totalPages == 0 || disabled}
                    className={`cursor-pointer ${loadingCursorClassName}`}
                    variant="outline"
                    size="sm"
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
                    <Button className={creatingCursorClassName} disabled={isCreating} onClick={onNew}>
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
}


export function EntityList<T>({
    items, renderItem, getKey, emptyView, className
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
            "flex flex-col gap-y-4", className
        )}>
            {items.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    )
}

interface EntityItemProps {
    href: string;
    title: string;
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
                isRemoving && "pointer-events-none",
            )}
        >
            <Card
                size="sm"
                className={cn(
                    "gap-0 py-0 ring-foreground/5 bg-card/20 transition-colors",
                    !isRemoving && "hover:bg-card/30",
                    isRemoving && "opacity-50",
                    className
                )}
            >
                <CardContent className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        {image}

                        <div className="min-w-0">
                            <CardTitle className="truncate text-sm font-medium">
                                {title}
                            </CardTitle>
                            {!!subtitle && (
                                <CardDescription className="truncate text-xs">
                                    {subtitle}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    {(actions || onRemove) && (
                        <div className="flex shrink-0 items-center gap-2">
                            {actions}
                            {onRemove && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        className={cn(
                                            buttonVariants({ variant: "ghost", size: "icon" }),
                                            "text-muted-foreground hover:text-foreground"
                                        )}
                                        onPointerDown={handleActionMenuPointerDown}
                                        onClick={handleActionMenuClick}
                                    >
                                        <MoreVerticalIcon className="size-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={handleActionMenuClick}>
                                        <DropdownMenuItem onClick={handleRemove}>
                                            <TrashIcon className="size-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}