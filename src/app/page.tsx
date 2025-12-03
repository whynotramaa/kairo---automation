"use client"

import { LogoutButton } from "@/components/logout";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const testAI = useMutation(trpc.testAI.mutationOptions({
    onSuccess: () => {
      toast.success("AI Job Queued")
    }
  }))
  return (
    <div className="min-h-screen min-w-screen flex flex-col py-4 gap-4 items-center justify-center" >
      <span className="font-semibold">
        protected server components
      </span>
      <Button disabled={testAI.isPending} onClick={() => testAI.mutate()}>
        Test AI
      </Button>
      <LogoutButton />
    </div>
  )
}

export default Page 