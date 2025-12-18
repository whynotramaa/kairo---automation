import { isValidElement, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type NodeStatus = "loading" | "success" | "error" | "initial";

export type NodeStatusVariant = "overlay" | "border";

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
};

function extractRoundedClasses(className?: string) {
  if (!className) return undefined;
  const roundedTokens = className
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token === "rounded" || token.startsWith("rounded-"));
  return roundedTokens.length ? roundedTokens.join(" ") : undefined;
}

export const SpinnerLoadingIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="relative">
      <StatusBorder className={cn("border-blue-700/40", className)}>
        {children}
      </StatusBorder>

      <div
        className={cn(
          "bg-background/50 absolute inset-0 z-50 rounded-md backdrop-blur-xs",
          className,
        )}
      />
      <div className="absolute inset-0 z-50">
        <span className="absolute top-[calc(50%-1.25rem)] left-[calc(50%-1.25rem)] inline-block h-10 w-10 animate-ping rounded-full bg-blue-700/20" />

        <LoaderCircle className="absolute top-[calc(50%-0.75rem)] left-[calc(50%-0.75rem)] size-6 animate-spin text-blue-700" />
      </div>
    </div>
  );
};

export const BorderLoadingIndicator = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string
}) => {
  return (
    <div className="relative">
      <div className="absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)]">
        <style>
          {`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .spinner {
          animation: spin 2s linear infinite;
          position: absolute;
          left: 50%;
          top: 50%;
          width: 140%;
          aspect-ratio: 1;
          transform-origin: center;
        }
      `}
        </style>
        <div className={cn("absolute inset-0 overflow-hidden rounded-md", className)}>
          <div className="spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgb(42,67,233)_0deg,rgba(42,138,246,0)_360deg)]" />
        </div>
      </div>
      {children}
    </div>
  );
};

const StatusBorder = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "pointer-events-none absolute -top-[2px] -left-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md border-3",
          className,
        )}
      />
      {children}
    </div>
  );
};

export const NodeStatusIndicator = ({
  status,
  variant = "border",
  children,
  className
}: NodeStatusIndicatorProps) => {
  const inferredRoundedFromChild = isValidElement(children)
    ? extractRoundedClasses((children.props as { className?: string }).className)
    : undefined;

  const mergedClassName = cn(inferredRoundedFromChild, className);

  switch (status) {
    case "loading":
      switch (variant) {
        case "overlay":
          return (
            <SpinnerLoadingIndicator className={mergedClassName}>
              {children}
            </SpinnerLoadingIndicator>
          );
        case "border":
          return (
            <BorderLoadingIndicator className={mergedClassName}>
              {children}
            </BorderLoadingIndicator>
          );
        default:
          return <>{children}</>;
      }
    case "success":
      return (
        <StatusBorder className={cn("border-green-700/50", mergedClassName)}>
          {children}
        </StatusBorder>
      );
    case "error":
      return (
        <StatusBorder className={cn("border-red-700/50", mergedClassName)}>
          {children}
        </StatusBorder>
      );
    default:
      return <>{children}</>;
  }
};
