import { createClient } from "@/src/lib/supabase/server";
import type { Education, Experience, Skill } from "@/src/lib/professional";

export const PROFILE_SELECT =
  "id, username, display_name, avatar_url, bio, location, open_to_work, currently_building, tech_stack, pinned_post_id";

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  open_to_work: boolean;
  currently_building: string | null;
  tech_stack: string[] | null;
  pinned_post_id: string | null;
};

export type ConnectionViewState =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "accepted";

export type ProfilePostStats = {
  postCount: number;
  totalBoosts: number;
};

type ProfilePostStatsRow = {
  post_count: number | string | null;
  total_boosts: number | string | null;
};

export async function getProfessionalData(userId: string) {
  const supabase = await createClient();

  const [experiencesResult, educationResult, skillsResult, acceptedResult] =
    await Promise.all([
      supabase
        .from("experiences")
        .select("id, title, company, start_date, end_date, description, is_current")
        .eq("user_id", userId)
        .order("is_current", { ascending: false })
        .order("start_date", { ascending: false }),
      supabase
        .from("education")
        .select("id, school, degree, field_of_study, start_year, end_year")
        .eq("user_id", userId)
        .order("end_year", { ascending: false, nullsFirst: false }),
      supabase
        .from("skills")
        .select("id, name")
        .eq("user_id", userId)
        .order("name", { ascending: true }),
      supabase
        .from("connections")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    ]);

  return {
    experiences: (experiencesResult.data ?? []) as Experience[],
    education: (educationResult.data ?? []) as Education[],
    skills: (skillsResult.data ?? []) as Skill[],
    connectionsCount: acceptedResult.count ?? 0,
  };
}

/** Aggregate profile stats in SQL instead of reducing a limited post list. */
export async function getProfilePostStats(
  userId: string,
): Promise<ProfilePostStats> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_profile_post_stats", {
    p_user_id: userId,
  });

  const rows = (data ?? []) as ProfilePostStatsRow[];
  const row = Array.isArray(rows) ? rows[0] : null;

  return {
    postCount: Number(row?.post_count ?? 0),
    totalBoosts: Number(row?.total_boosts ?? 0),
  };
}

export async function getConnectionView(
  currentUserId: string | null | undefined,
  targetUserId: string,
): Promise<{ status: ConnectionViewState; connectionId: string | null }> {
  if (!currentUserId || currentUserId === targetUserId) {
    return { status: "none", connectionId: null };
  }

  const supabase = await createClient();
  const [outgoingResult, incomingResult] = await Promise.all([
    supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", currentUserId)
      .eq("addressee_id", targetUserId)
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", targetUserId)
      .eq("addressee_id", currentUserId)
      .maybeSingle(),
  ]);

  const row = outgoingResult.data ?? incomingResult.data;
  if (!row) return { status: "none", connectionId: null };
  if (row.status === "accepted") {
    return { status: "accepted", connectionId: row.id };
  }
  if (row.status === "pending") {
    return {
      status: incomingResult.data ? "pending_incoming" : "pending_outgoing",
      connectionId: row.id,
    };
  }
  return { status: "none", connectionId: row.id };
}
