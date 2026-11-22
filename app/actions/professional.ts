"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type ProfessionalState = {
  error?: string;
  success?: number;
};

function text(formData: FormData, key: string, max = 200) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
}

function optionalDate(formData: FormData, key: string) {
  const raw = text(formData, key, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function optionalYear(formData: FormData, key: string) {
  const raw = text(formData, key, 4);
  if (!raw) return null;
  const year = Number(raw);
  return Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : null;
}

async function revalidateProfilePaths(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  revalidatePath("/profile");
  revalidatePath("/");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }
}

export async function setOpenToWork(
  openToWork: boolean,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from("profiles")
    .update({ open_to_work: openToWork })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await revalidateProfilePaths(user.id);
  return { success: true };
}

export async function upsertExperience(
  _prevState: ProfessionalState,
  formData: FormData,
): Promise<ProfessionalState> {
  const title = text(formData, "title", 120);
  const company = text(formData, "company", 120);
  const description = text(formData, "description", 1000);
  const isCurrent = formData.get("is_current") === "on";
  const startDate = optionalDate(formData, "start_date");
  const endDate = isCurrent ? null : optionalDate(formData, "end_date");
  const id = text(formData, "id", 64);

  if (!title || !company) {
    return { error: "Title and company are required." };
  }

  if (startDate && endDate && endDate < startDate) {
    return { error: "End date must be after the start date." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const payload = {
    title,
    company,
    start_date: startDate,
    end_date: endDate,
    description: description || null,
    is_current: isCurrent,
  };

  const { error } = id
    ? await supabase
        .from("experiences")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
    : await supabase.from("experiences").insert({ ...payload, user_id: user.id });

  if (error) return { error: error.message };

  await revalidateProfilePaths(user.id);
  return { success: Date.now() };
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  await revalidateProfilePaths(user.id);
  return { success: true };
}

export async function upsertEducation(
  _prevState: ProfessionalState,
  formData: FormData,
): Promise<ProfessionalState> {
  const school = text(formData, "school", 160);
  const degree = text(formData, "degree", 120);
  const fieldOfStudy = text(formData, "field_of_study", 120);
  const startYear = optionalYear(formData, "start_year");
  const endYear = optionalYear(formData, "end_year");
  const id = text(formData, "id", 64);

  if (!school) return { error: "School is required." };
  if (startYear && endYear && endYear < startYear) {
    return { error: "End year must be after the start year." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  const payload = {
    school,
    degree: degree || null,
    field_of_study: fieldOfStudy || null,
    start_year: startYear,
    end_year: endYear,
  };

  const { error } = id
    ? await supabase
        .from("education")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
    : await supabase.from("education").insert({ ...payload, user_id: user.id });

  if (error) return { error: error.message };

  await revalidateProfilePaths(user.id);
  return { success: Date.now() };
}

export async function deleteEducation(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from("education")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  await revalidateProfilePaths(user.id);
  return { success: true };
}

export async function addSkills(
  _prevState: ProfessionalState,
  formData: FormData,
): Promise<ProfessionalState> {
  const raw = text(formData, "name", 500);
  const names = Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim().slice(0, 32))
        .filter(Boolean),
    ),
  ).slice(0, 10);

  if (names.length === 0) return { error: "Add at least one skill." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  let inserted = 0;
  for (const name of names) {
    const { error } = await supabase
      .from("skills")
      .insert({ user_id: user.id, name });
    if (!error) inserted += 1;
  }

  if (inserted === 0) {
    return { error: "Those skills are already on your profile." };
  }

  await revalidateProfilePaths(user.id);
  return { success: Date.now() };
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  await revalidateProfilePaths(user.id);
  return { success: true };
}
