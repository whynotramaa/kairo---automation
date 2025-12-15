import { Loader } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
            <div className="relative flex flex-col items-center gap-4 rounded-xl border border-neutral-800 px-10 py-8 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.8)]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border border-neutral-700/70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full border border-dashed border-neutral-600/80" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader className="h-6 w-6 animate-spin text-neutral-200" strokeWidth={2} />
                    </div>
                </div>

                <div className="text-center leading-tight">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Loading</p>
                    <p className="text-sm font-medium text-neutral-200">Preparing your workspace</p>
                </div>
            </div>
        </div>
    );
}
