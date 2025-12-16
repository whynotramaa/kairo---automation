"use client"

import type { CSSProperties } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-300" />,
        info: <InfoIcon className="size-4 text-blue-300" />,
        warning: <TriangleAlertIcon className="size-4 text-orange-300" />,
        error: <OctagonXIcon className="size-4 text-red-300" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "w-full px-2 overflow-hidden",
          title: "font-mono w-full min-w-0 max-w-full truncate",
          description: "font-mono w-full min-w-0 max-w-full whitespace-normal break-all",
          actionButton: "font-mono whitespace-nowrap",
          cancelButton: "font-mono whitespace-nowrap",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
