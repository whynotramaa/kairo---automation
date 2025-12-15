"use client";

import React, { forwardRef, type ReactNode } from "react";
import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/react-flow/base-node";

export type PlaceholderNodeProps = {
  children?: ReactNode;
  onClick?: () => void;
};

export const PlaceholderNode = forwardRef<
  HTMLDivElement,
  PlaceholderNodeProps
>(({ children, onClick }, ref) => {
  return (
    <BaseNode
      ref={ref}
      className="bg-card w-auto h-auto border-dashed border-gray-400 p-2 text-center text-gray-400 shadow-none cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-all"
      onClick={onClick}
    >
      {children}

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{ visibility: "hidden" }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{ visibility: "hidden" }}
      />
    </BaseNode>
  );
});

PlaceholderNode.displayName = "PlaceholderNode";
