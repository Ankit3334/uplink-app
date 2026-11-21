import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

export const requireUser = cache(async () => {
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }
  return user;
});
