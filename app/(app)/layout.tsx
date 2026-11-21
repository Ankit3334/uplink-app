import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BottomNav } from "@/src/components/bottom-nav";
import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

async function AppGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="border border-zinc-800 bg-[#0a0a0a] px-5 py-4 text-xs uppercase tracking-[0.2em] text-zinc-400">
            Verifying Uplink Access...
          </p>
        </div>
      }
    >
      <AppGate>{children}</AppGate>
    </Suspense>
  );
}
