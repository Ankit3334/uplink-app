"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type ConnectionState =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "accepted"
  | "ignored";

export type ConnectionResult = {
  status: ConnectionState;
  connectionId: string | null;
  connectionsCount: number;
  error?: string;
};

type ConnectionRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "ignored";
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function findConnection(
  supabase: SupabaseClient,
  firstUserId: string,
  secondUserId: string,
): Promise<ConnectionRow | null> {
  const [{ data: forward }, { data: reverse }] = await Promise.all([
    supabase
      .from("connections")
      .select("id, requester_id, addressee_id, status")
      .eq("requester_id", firstUserId)
      .eq("addressee_id", secondUserId)
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id, requester_id, addressee_id, status")
      .eq("requester_id", secondUserId)
      .eq("addressee_id", firstUserId)
      .maybeSingle(),
  ]);

  return (forward ?? reverse) as ConnectionRow | null;
}

async function countConnections(supabase: SupabaseClient, userId: string) {
  const [{ count: outgoing }, { count: incoming }] = await Promise.all([
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("requester_id", userId)
      .eq("status", "accepted"),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("addressee_id", userId)
      .eq("status", "accepted"),
  ]);

  return (outgoing ?? 0) + (incoming ?? 0);
}

function revalidateConnectionPaths() {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/notifications");
  revalidatePath("/explore");
}

export async function sendConnectionRequest(
  addresseeId: string,
): Promise<ConnectionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "none",
      connectionId: null,
      connectionsCount: 0,
      error: "Authentication required.",
    };
  }

  if (!addresseeId || addresseeId === user.id) {
    return {
      status: "none",
      connectionId: null,
      connectionsCount: 0,
      error: "Invalid target.",
    };
  }

  const existing = await findConnection(supabase, user.id, addresseeId);

  if (existing?.status === "accepted") {
    return {
      status: "accepted",
      connectionId: existing.id,
      connectionsCount: await countConnections(supabase, user.id),
    };
  }

  // If the other person already requested a connection, accept it directly.
  if (
    existing?.status === "pending" &&
    existing.requester_id !== user.id
  ) {
    const { error } = await supabase
      .from("connections")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("addressee_id", user.id);

    if (error) {
      return {
        status: "pending_incoming",
        connectionId: existing.id,
        connectionsCount: await countConnections(supabase, user.id),
        error: error.message,
      };
    }

    await supabase.from("notifications").insert({
      user_id: existing.requester_id,
      actor_id: user.id,
      type: "connection_accepted",
      post_id: null,
    });

    revalidateConnectionPaths();
    return {
      status: "accepted",
      connectionId: existing.id,
      connectionsCount: await countConnections(supabase, user.id),
    };
  }

  if (existing?.status === "pending") {
    return {
      status: "pending_outgoing",
      connectionId: existing.id,
      connectionsCount: await countConnections(supabase, user.id),
    };
  }

  let connectionId = existing?.id ?? null;
  let error: string | undefined;

  if (existing?.status === "ignored") {
    const { error: updateError } = await supabase
      .from("connections")
      .update({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    error = updateError?.message;
  } else {
    const { data, error: insertError } = await supabase
      .from("connections")
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: "pending",
      })
      .select("id")
      .maybeSingle();
    connectionId = data?.id ?? null;
    error = insertError?.message;
  }

  if (error || !connectionId) {
    return {
      status: "none",
      connectionId,
      connectionsCount: await countConnections(supabase, user.id),
      error: error ?? "Could not create connection request.",
    };
  }

  await supabase.from("notifications").insert({
    user_id: addresseeId,
    actor_id: user.id,
    type: "connection_request",
    post_id: null,
  });

  revalidateConnectionPaths();
  return {
    status: "pending_outgoing",
    connectionId,
    connectionsCount: await countConnections(supabase, user.id),
  };
}

export async function acceptConnectionRequest(
  connectionId: string,
): Promise<ConnectionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "none",
      connectionId: null,
      connectionsCount: 0,
      error: "Authentication required.",
    };
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("id, requester_id, addressee_id, status")
    .eq("id", connectionId)
    .eq("addressee_id", user.id)
    .maybeSingle();

  if (!connection) {
    return {
      status: "none",
      connectionId: null,
      connectionsCount: await countConnections(supabase, user.id),
      error: "Connection request not found.",
    };
  }

  if (connection.status === "accepted") {
    return {
      status: "accepted",
      connectionId: connection.id,
      connectionsCount: await countConnections(supabase, user.id),
    };
  }

  const { error } = await supabase
    .from("connections")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", connection.id)
    .eq("addressee_id", user.id);

  if (error) {
    return {
      status: "pending_incoming",
      connectionId: connection.id,
      connectionsCount: await countConnections(supabase, user.id),
      error: error.message,
    };
  }

  await supabase.from("notifications").insert({
    user_id: connection.requester_id,
    actor_id: user.id,
    type: "connection_accepted",
    post_id: null,
  });

  revalidateConnectionPaths();
  return {
    status: "accepted",
    connectionId: connection.id,
    connectionsCount: await countConnections(supabase, user.id),
  };
}

export async function ignoreConnectionRequest(
  connectionId: string,
): Promise<ConnectionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "none",
      connectionId: null,
      connectionsCount: 0,
      error: "Authentication required.",
    };
  }

  const { error } = await supabase
    .from("connections")
    .update({ status: "ignored", updated_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  if (error) {
    return {
      status: "pending_incoming",
      connectionId,
      connectionsCount: await countConnections(supabase, user.id),
      error: error.message,
    };
  }

  revalidateConnectionPaths();
  return {
    status: "ignored",
    connectionId,
    connectionsCount: await countConnections(supabase, user.id),
  };
}

export async function withdrawConnectionRequest(
  connectionId: string,
): Promise<ConnectionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "none",
      connectionId: null,
      connectionsCount: 0,
      error: "Authentication required.",
    };
  }

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .eq("requester_id", user.id)
    .eq("status", "pending");

  if (error) {
    return {
      status: "pending_outgoing",
      connectionId,
      connectionsCount: await countConnections(supabase, user.id),
      error: error.message,
    };
  }

  revalidateConnectionPaths();
  return {
    status: "none",
    connectionId: null,
    connectionsCount: await countConnections(supabase, user.id),
  };
}
