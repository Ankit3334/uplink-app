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
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-12 animate-fade-in-up">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
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
        <div className="flex min-h-[100dvh] items-center justify-center px-4 animate-fade-in">
          <p className="border border-zinc-800 bg-zinc-950 px-5 py-4 text-xs uppercase tracking-[0.2em] text-zinc-400 animate-pulse">
            Loading System Configuration...
          </p>
        </div>
      }
    >
      <OnboardingGate />
    </Suspense>
  );
}
