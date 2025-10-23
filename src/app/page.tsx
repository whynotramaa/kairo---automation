

import { LogoutButton } from "@/components/logout";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Page = async () => {

  await requireAuth();
  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex flex-col py-4 items-center justify-center" >
      <span className="font-semibold">
        protected server components
      </span>
      {/* <div className="flex-1">
          {JSON.stringify(data)}
        </div> */}
      {/* <Button onClick={() => authClient.signOut()}>Logout</Button> done in other because of client and server collision - cannot use hooks and async await in same file */}
      <LogoutButton />
    </div>
  )
}

export default Page 