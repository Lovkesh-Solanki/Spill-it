"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = {
  user_id: string;
  nickname: string;
  role: "creator" | "member";
  is_muted: boolean;
};

export default function MemberList({
  roomId,
  initialMembers,
  isOwner,
}: {
  roomId: string;
  initialMembers: Member[];
  isOwner: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:memberships`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_memberships", filter: `room_id=eq.${roomId}` },
        async () => {
          // Simplest correct approach: re-fetch on any change (join/leave/
          // kick/mute). This room is capped at 50 members, so the query is
          // always small — not worth hand-patching insert/update/delete
          // separately for that size.
          const { data } = await supabase
            .from("room_memberships")
            .select("user_id, nickname, role, is_muted")
            .eq("room_id", roomId)
            .order("joined_at", { ascending: true });
          if (data) setMembers(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable per mount, roomId is the real dependency
  }, [roomId]);

  async function toggleMute(userId: string, current: boolean) {
    await supabase
      .from("room_memberships")
      .update({ is_muted: !current })
      .eq("room_id", roomId)
      .eq("user_id", userId);
  }

  async function kick(userId: string) {
    await supabase
      .from("room_memberships")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userId);
  }

  return (
    <div className="rounded-2xl border border-surface-raised bg-surface p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Players ({members.length})
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {members.map((m) => (
          <li
            key={m.user_id}
            className="flex items-center justify-between gap-2 rounded-xl bg-surface-raised px-3 py-2 text-sm"
          >
            <span className="truncate text-ink-100">
              {m.nickname}
              {m.role === "creator" && (
                <span className="ml-1.5 text-[10px] text-spicy">host</span>
              )}
              {m.is_muted && <span className="ml-1.5 text-[10px] text-ink-700">muted</span>}
            </span>
            {isOwner && m.role !== "creator" && (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => toggleMute(m.user_id, m.is_muted)}
                  className="rounded-lg px-1.5 py-1 text-[10px] text-ink-500 hover:text-ink-100"
                  title={m.is_muted ? "Unmute" : "Mute"}
                >
                  {m.is_muted ? "Unmute" : "Mute"}
                </button>
                <button
                  type="button"
                  onClick={() => kick(m.user_id)}
                  className="rounded-lg px-1.5 py-1 text-[10px] text-dare hover:text-dare-dim"
                >
                  Kick
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
