"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type CreateProjectState = {
  error?: string;
  success?: number;
};

export async function createProject(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const raw = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const title = raw("title");
  const description = raw("description");
  const link = raw("link");
  const imageUrl = raw("image_url");
  const techStack = Array.from(
    new Set(
      raw("tech_stack")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 12);

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  if (link && !/^https?:\/\//i.test(link)) {
    return { error: "Project link must start with http:// or https://" };
  }

  const { error: insertError } = await supabase.from("projects").insert({
    user_id: user.id,
    title: title.slice(0, 120),
    description: description.slice(0, 600),
    link: link || null,
    tech_stack: techStack,
    image_url: imageUrl || null,
  });

  if (insertError) {
    return { error: `Could not save project: ${insertError.message}` };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  revalidatePath("/profile");
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`);
  }

  // Unique token so repeated saves each close the sheet independently.
  return { success: Date.now() };
}
