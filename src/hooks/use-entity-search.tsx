import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

interface useEntitySearchParams<T extends {
    search: string,
    page: number
}> {
    params: T
    setParams: (params: T) => void;
    debounceMs?: number
}

export function useEntitySearch<T extends { search: string; page: number; }>({
    params, setParams, debounceMs = 500
}: useEntitySearchParams<T>) {

    const [localSearch, setLocalSearch] = useState(params.search)

    useEffect(() => {
        // if cleared locally, apply immediately and skip debounce
        if (localSearch === "" && params.search !== "") {
            setParams({ ...params, search: "", page: PAGINATION.DEFAULT_PAGE })
            return
        }

        const timer = setTimeout(() => {
            if (localSearch !== params.search) {
                setParams({
                    ...params,
                    search: localSearch,
                    page: PAGINATION.DEFAULT_PAGE
                })
            }
        }, debounceMs)

        return () => clearTimeout(timer)
        // depend only on what matters to avoid unnecessary re-runs
    }, [localSearch, params.search, debounceMs, setParams, params])

    useEffect(() => {
        // sync external changes into local input
        setLocalSearch(params.search)
    }, [params.search])

    return {
        searchValue: localSearch,
        // expose a function that always expects a string
        onSearchChange: (value: string) => setLocalSearch(value)
    }
}
