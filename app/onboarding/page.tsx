import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { OnboardingClient } from "./_components/onboarding-client";

async function OnboardingGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#555]">
            UPLINK // System Configuration
          </p>
        </div>
        <OnboardingClient />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="border border-neon-green/30 bg-[#0a0a0a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#39ff14]">
            Loading System Configuration...
          </p>
        </div>
      }
    >
      <OnboardingGate />
    </Suspense>
  );
}
