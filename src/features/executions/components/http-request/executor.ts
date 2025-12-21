import Handlebars from "handlebars"

import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky"

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2)
    const safeString = new Handlebars.SafeString(jsonString)

    return safeString
})

type HttpRequestData = {
    variableName: string;
    endpoint: string;
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: string;
}


export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ data, nodeId, step, context }) => {
    // TODO PUBLISH loading state

    if (!data.endpoint) {
        // TODO : publish error state
        throw new NonRetriableError("HTTP Request Node: No Endpoint Configured")
    }
    if (!data.variableName) {
        // TODO : publish error state
        throw new NonRetriableError("HTTP Request Node: Variable Name Not Configured")
    }
    if (!data.method) {
        // TODO : publish error state
        throw new NonRetriableError("HTTP Request Node: Methods Not Configured")
    }

    const result = await step.run("HTTP-request", async () => {

        const method = data.method

        const endpoint = Handlebars.compile(data.endpoint)(context)

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            const resolved = Handlebars.compile(data.body || "{}")(context)

            JSON.parse(resolved)

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

    // TODO PUBLISH success state

    return result


}