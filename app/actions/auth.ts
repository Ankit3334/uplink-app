"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "ACCESS DENIED: Email and password required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: `ACCESS DENIED: ${error.message}` };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ACCESS DENIED: Session initialization failed." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  redirect("/");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "REGISTRATION FAILED: Email and password required." };
  }

  if (password.length < 6) {
    return {
      error: "REGISTRATION FAILED: Password must be at least 6 characters.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: `REGISTRATION FAILED: ${error.message}` };
  }

  // If email confirmation is required, no session is established yet.
  if (!data.session) {
    return {
      message:
        "REGISTRATION RECEIVED: Confirm your email to complete uplink initialization.",
    };
  }

  redirect("/onboarding");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
