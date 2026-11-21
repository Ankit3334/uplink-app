"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type SendMessageState = {
  error?: string;
  success?: number;
};

export async function sendMessage(
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const roomIdRaw = formData.get("roomId");
  const contentRaw = formData.get("content");
  const roomId = typeof roomIdRaw === "string" ? roomIdRaw : "";
  const content = typeof contentRaw === "string" ? contentRaw.trim() : "";

  if (!roomId) {
    return { error: "TRANSMISSION FAILED: Missing room reference." };
  }

  if (!content) {
    return { error: "TRANSMISSION FAILED: Payload empty." };
  }

  const { data: room } = await supabase
    .from("message_rooms")
    .select("id, user_1_id, user_2_id")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || (room.user_1_id !== user.id && room.user_2_id !== user.id)) {
    return { error: "TRANSMISSION FAILED: Access denied." };
  }

  const { error: insertError } = await supabase.from("messages").insert({
    room_id: roomId,
    sender_id: user.id,
    content,
  });

  if (insertError) {
    return { error: `TRANSMISSION FAILED: ${insertError.message}` };
  }

  await supabase
    .from("message_rooms")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", roomId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${roomId}`);

  return { success: Date.now() };
}
