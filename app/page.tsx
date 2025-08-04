import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/actions";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div></div>
      {session?.user ? (
        <Button>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      ) : (
        <Button>
          <Link href="/sign-in">Signin</Link>
        </Button>
      )}
    </div>
  );
}
