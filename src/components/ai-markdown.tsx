"use client"

import { Streamdown } from "streamdown"

interface AIMarkdownProps {
    content: string
    className?: string
}

export const AIMarkdown = ({ content, className }: AIMarkdownProps) => {
    return (
        <div className={className}>
            <Streamdown>{content}</Streamdown>
        </div>
    )
}
