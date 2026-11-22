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
  try {
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

    // Surface the DM in the recipient's Activity feed. A failed notification
    // write must never roll back a message that was already delivered.
    const recipientId =
      room.user_1_id === user.id ? room.user_2_id : room.user_1_id;
    await supabase.from("notifications").insert({
      user_id: recipientId,
      actor_id: user.id,
      type: "message",
    });

    await supabase
      .from("message_rooms")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", roomId);

    revalidatePath("/notifications");

    revalidatePath("/messages");
    revalidatePath(`/messages/${roomId}`);

    return { success: Date.now() };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "TRANSMISSION FAILED: Unexpected system error." };
  }
}

/**
 * Returns the existing 1:1 room for this pair, or creates one on demand.
 * Rooms can only be opened between accepted connections.
 */
export async function getOrCreateRoom(
  targetUserId: string,
): Promise<{ roomId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  if (!targetUserId || targetUserId === user.id) {
    return { error: "INVALID RECIPIENT: Unable to open channel." };
  }

  try {
    // Only accepted connections may open a direct channel.
    const [{ data: forwardConnection }, { data: reverseConnection }] =
      await Promise.all([
        supabase
          .from("connections")
          .select("id, status")
          .eq("requester_id", user.id)
          .eq("addressee_id", targetUserId)
          .maybeSingle(),
        supabase
          .from("connections")
          .select("id, status")
          .eq("requester_id", targetUserId)
          .eq("addressee_id", user.id)
          .maybeSingle(),
      ]);

    const connected =
      forwardConnection?.status === "accepted" ||
      reverseConnection?.status === "accepted";
    if (!connected) {
      return { error: "Connect with this member before messaging." };
    }

    // Rooms are order-independent, so check both orientations.
    const findRoom = async () =>
      Promise.all([
        supabase
          .from("message_rooms")
          .select("id")
          .eq("user_1_id", user.id)
          .eq("user_2_id", targetUserId)
          .maybeSingle(),
        supabase
          .from("message_rooms")
          .select("id")
          .eq("user_1_id", targetUserId)
          .eq("user_2_id", user.id)
          .maybeSingle(),
      ]);

    const [{ data: forwardRoom }, { data: reverseRoom }] = await findRoom();
    const existingRoomId = forwardRoom?.id ?? reverseRoom?.id;
    if (existingRoomId) {
      return { roomId: existingRoomId };
    }

    const { data: createdRoom, error: insertError } = await supabase
      .from("message_rooms")
      .insert({ user_1_id: user.id, user_2_id: targetUserId })
      .select("id")
      .single();

    if (insertError || !createdRoom) {
      // A concurrent click may have created the room first – reuse it.
      const [{ data: retryForward }, { data: retryReverse }] = await findRoom();
      const racedRoomId = retryForward?.id ?? retryReverse?.id;
      if (racedRoomId) {
        return { roomId: racedRoomId };
      }
      return { error: "Unable to open channel. Please try again." };
    }

    revalidatePath("/messages");
    revalidatePath(`/messages/${createdRoom.id}`);

    return { roomId: createdRoom.id };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Unable to open channel. Please try again." };
  }
}
