"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SizeBracket } from "@/lib/supabase/types";

export type RoomActionState = { error: string } | null;

const VALID_BRACKETS: SizeBracket[] = ["2", "3-5", "5-10", "10-25", "25+"];

export async function createRoomAction(
  _prev: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const sizeBracket = String(formData.get("size_bracket") ?? "");
  const verifiedOnly = formData.get("verified_only") === "on";

  if (name.length < 2) return { error: "Room name needs to be at least 2 characters." };
  if (!VALID_BRACKETS.includes(sizeBracket as SizeBracket)) {
    return { error: "Pick a room size." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_room", {
    p_name: name,
    p_password: password || null,
    p_size_bracket: sizeBracket as SizeBracket,
    p_verified_only: verifiedOnly,
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
