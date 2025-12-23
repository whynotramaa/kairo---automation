import { sendWorkflowExecution } from "@/inngest/utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const workflowId = url.searchParams.get("workflowId")

        if (!workflowId) {
            return NextResponse.json(
                { success: false, error: "Missing required query parameter" },
                { status: 400 }
            )
        }

        const rawText = await request.text()
        const body = rawText ? JSON.parse(rawText) : {}

        const formData = {
            formId: body.formId ?? null,
            formTitle: body.formTitle ?? null,
            responseId: body.responseId ?? null,
            timestamp: body.timestamp ?? null,
            respondentEmail: body.respondentEmail ?? null,
            responses: body.responses ?? null,
            raw: body
        }

        await sendWorkflowExecution({
            workflowId,
            intialData: { googleForm: formData }
        })

        // ✅ REQUIRED
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Google form webhook error:", error)

        // Still return a response
        return NextResponse.json(
            { success: false },
            { status: 200 }
        )
    }
}
