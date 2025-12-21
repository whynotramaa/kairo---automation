import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky"

type HttpRequestData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: string;
}


export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ data, nodeId, step, context }) => {

    // TODO PUBLISH loading state

    if (!data.endpoint) {
        // TODO : publish error state

        throw new NonRetriableError("HTTP Request Node: No Endpoint Configured")
    }

    const result = await step.run("HTTP-request", async () => {
        const method = data.method || "GET"
        const endpoint = data.endpoint!
        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            options.body = data.body
        }



        const response = await ky(endpoint, options)

        const contentType = response.headers.get("content-type")

        const responseData = contentType?.includes("application/json")
            ? await response.json()
            : await response.text()

        return {
            ...context, httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            }
        }

    });

    // TODO PUBLISH success state

    return result


}