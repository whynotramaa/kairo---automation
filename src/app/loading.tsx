import { Loader } from "lucide-react";

// app/loading.tsx
export default function Loading() {
    return (
        <div className="min-h-screen min-w-screen flex justify-center items-center">
            <Loader className="mr-2 h-20 w-20 animate-spin opacity-50" />
        </div>
    );
}
