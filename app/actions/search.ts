"use server";

import { createClient } from "@/src/lib/supabase/server";

export type UserSearchResult = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();
  const pattern = `%${q}%`;

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
    .order("username", { ascending: true })
    .limit(8);

  return (data ?? []) as UserSearchResult[];
}
