import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { AuthClient } from "./_components/auth-client";

async function AuthGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      redirect("/");
    }
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#555]">
            UPLINK // Restricted Access Node
          </p>
        </div>
        <AuthClient />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="border border-neon-cyan/30 bg-[#0a0a0a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#00f3ff]">
            Initializing Auth Terminal...
          </p>
        </div>
      }
    >
      <AuthGate />
    </Suspense>
  );
}
