import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { caller } from "@/trpc/server";

export default async function Home() {

  // const users = await prisma.user.findMany();

  const users = await caller.getUsers()



  return (
    <div className="min-h-screen min-w-full flex items-center justify-center gap-2" >
      <Button variant="secondary">
        Hello World
        {/* {JSON.stringify(users)} */}
      </Button>

      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 border rounded-lg flex flex-col items-start"
        >
          <p className="text-lg font-semibold">Name: {user.name}</p>
          <p className="text-sm text-gray-600">Email: {user.email}</p>
        </div>
      ))}

    </div>
  );
}
