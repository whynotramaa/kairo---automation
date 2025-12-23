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

        const stripeData = {
            // event metadata

            eventId: body.id,
            eventType: body.type,
            timestamp: body.created,
            livemode: body.livemode,
            raw: body.data?.object,

        }

        await sendWorkflowExecution({
            workflowId,
            intialData: { stripe: stripeData }
        })

        // ✅ REQUIRED
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Stripe webhook error:", error)

        // Still return a response
        return NextResponse.json(
            { success: false, error: "Failed to process stripe event." },
            { status: 200 }
        )
    }
}
