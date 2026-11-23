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

  const { data: unreadData, error: unreadError } = await supabase.rpc(
    "get_unread_notification_count",
    { p_user_id: user.id },
  );

  let unreadCount = typeof unreadData === "number" ? unreadData : 0;
  if (unreadError) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="native-scroll flex-1 pb-24 has-[data-immersive]:pb-0">
        {children}
      </main>
      <BottomNav unreadCount={unreadCount} />
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
        <div className="flex min-h-[100dvh] items-center justify-center px-4 animate-fade-in">
          <p className="border border-zinc-800 bg-zinc-950 px-5 py-4 text-xs uppercase tracking-[0.2em] text-zinc-400 animate-pulse">
            Verifying Uplink Access...
          </p>
        </div>
      }
    >
      <AppGate>{children}</AppGate>
    </Suspense>
  );
}
