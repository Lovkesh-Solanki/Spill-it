"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Difficulty, HostMode, SizeBracket } from "@/lib/supabase/types";

export type RoomActionState = { error: string } | null;

const VALID_BRACKETS: SizeBracket[] = ["2", "3-5", "5-10", "10-25", "25+"];
const VALID_HOST_MODES: HostMode[] = ["host_controlled", "turn_based", "open"];
const VALID_DIFFICULTIES: Difficulty[] = ["children", "teens", "adult", "spicy"];

export async function createRoomAction(
  _prev: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const sizeBracket = String(formData.get("size_bracket") ?? "");
  const verifiedOnly = formData.get("verified_only") === "on";
  const hostMode = String(formData.get("host_mode") ?? "host_controlled");

  if (name.length < 2) return { error: "Room name needs to be at least 2 characters." };
  if (!VALID_BRACKETS.includes(sizeBracket as SizeBracket)) {
    return { error: "Pick a room size." };
  }
  if (!VALID_HOST_MODES.includes(hostMode as HostMode)) {
    return { error: "Pick a valid host mode." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_room", {
    p_name: name,
    p_password: password || null,
    p_size_bracket: sizeBracket as SizeBracket,
    p_verified_only: verifiedOnly,
    p_host_mode: hostMode as HostMode,
  });

  if (error) return { error: error.message };
  redirect(`/rooms/${data.code}`);
}

export async function leaveRoomAction(roomId: string): Promise<RoomActionState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_room", { p_room_id: roomId });

  if (error) return { error: error.message };
  redirect("/rooms");
}

export async function joinRoomAction(
  _prev: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const password = String(formData.get("password") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (code.length !== 6) return { error: "Room codes are 6 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_room", {
    p_code: code,
    p_password: password || null,
    p_nickname: nickname || null,
  });

  if (error) return { error: error.message };
  redirect(`/rooms/${data.code}`);
}

export async function startGameAction(
  _prev: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const roomId = String(formData.get("room_id") ?? "");
  const difficulty = String(formData.get("difficulty") ?? "");
  const tieBreakerMode = String(formData.get("tie_breaker_mode") ?? "random");
  const ageConfirmed = formData.get("age_confirmed") === "on";

  if (!VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    return { error: "Pick a difficulty tier." };
  }
  const needsAgeGate = difficulty === "adult" || difficulty === "spicy";
  // Enforced here, not just in the UI: this is a Server Action, so a
  // request that skips the checkbox in the client never reaches this point
  // without also skipping this check — unlike local mode's single-device
  // consent, everyone in the room is a separate real person here, so it's
  // worth actually gating server-side rather than trusting the client did.
  if (needsAgeGate && !ageConfirmed) {
    return { error: "Age/consent confirmation is required for Adult or Spicy." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { data: room, error: roomError } = await supabase
    .from("rooms_public")
    .select("id, host_mode")
    .eq("id", roomId)
    .single();
  if (roomError || !room) return { error: "Room not found." };

  const { data: membership, error: membershipError } = await supabase
    .from("room_memberships")
    .select("role, nickname")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .single();
  if (membershipError || !membership) return { error: "You're not a member of this room." };

  // host_controlled and turn_based both mean "creator only" for *starting* a
  // session specifically — turn order doesn't exist yet until players exist,
  // so turn_based has nothing to key off of at this point. Once a session
  // is live, turn_based governs who can spin/advance instead.
  const canStart = room.host_mode === "open" || membership.role === "creator";
  if (!canStart) {
    return { error: "Only the host can start the game in this room." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      mode: "online",
      room_id: roomId,
      difficulty: difficulty as Difficulty,
      tie_breaker_mode: tieBreakerMode === "coin_toss" ? "coin_toss" : "random",
      created_by: user.id,
    })
    .select("id")
    .single();
  if (sessionError || !session) return { error: sessionError?.message ?? "Couldn't start the game." };

  const { data: members, error: membersError } = await supabase
    .from("room_memberships")
    .select("user_id, nickname")
    .eq("room_id", roomId);
  if (membersError || !members) return { error: "Couldn't load room members." };

  const { error: playersError } = await supabase.from("players").insert(
    members.map((m) => ({
      session_id: session.id,
      name: m.nickname,
      user_id: m.user_id,
    }))
  );
  if (playersError) return { error: playersError.message };

  revalidatePath(`/rooms/${roomId}`, "page");
  return null;
}
