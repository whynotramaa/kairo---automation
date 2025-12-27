import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky"
import { httpReqChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: string;
}


export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ data, nodeId, step, context, publish }) => {
    // TODO PUBLISH loading state
    await publish(httpReqChannel().status({
        nodeId,
        status: "loading"
    }))


    try {
        const result = await step.run("HTTP-request", async () => {
            if (!data.endpoint) {
                const errorMessage = "HTTP Request Node: No Endpoint Configured";
                await publish(httpReqChannel().status({
                    nodeId,
                    status: "error",
                    errorMessage
                }))

                throw new NonRetriableError(errorMessage)
            }
            if (!data.variableName) {
                const errorMessage = "HTTP Request Node: Variable Name Not Configured";
                await publish(httpReqChannel().status({
                    nodeId,
                    status: "error",
                    errorMessage
                }))

                throw new NonRetriableError(errorMessage)
            }
            if (!data.method) {
                const errorMessage = "HTTP Request Node: Methods Not Configured";
                await publish(httpReqChannel().status({
                    nodeId,
                    status: "error",
                    errorMessage
                }))

                throw new NonRetriableError(errorMessage)
            }

            // Validate body JSON for POST, PUT, PATCH methods before execution
            if (["POST", "PUT", "PATCH"].includes(data.method) && data.body) {
                try {
                    // First check if it's valid JSON (before Handlebars processing)
                    // If body contains Handlebars templates, compile and check the result
                    const resolved = Handlebars.compile(data.body)(context)
                    JSON.parse(resolved)
                } catch {
                    const errorMessage = "HTTP Request Node: Body must be valid JSON";
                    await publish(httpReqChannel().status({
                        nodeId,
                        status: "error",
                        errorMessage
                    }))
                    throw new NonRetriableError(errorMessage)
                }
            }
            const method = data.method

            const endpoint = Handlebars.compile(data.endpoint)(context)

            const options: KyOptions = { method }

            if (["POST", "PUT", "PATCH"].includes(method)) {
                const resolved = Handlebars.compile(data.body || "{}")(context)

                options.body = resolved
                options.headers = {
                    "Content-Type": "application/json"
                }
            }

            const response = await ky(endpoint, options)

            const contentType = response.headers.get("content-type")

            const responseData = contentType?.includes("application/json")
                ? await response.json()
                : await response.text()

            const responsePayload = {
                httpResponse: {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData
                }
            }

            return {
                ...context,
                [data.variableName]: responsePayload,
            }


        });

        await publish(httpReqChannel().status({
            nodeId,
            status: "success"
        }))

        return result

    }

    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        await publish(httpReqChannel().status({
            nodeId,
            status: "error",
            errorMessage
        }))

        throw error
    }

}