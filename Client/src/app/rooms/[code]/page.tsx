import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatPanel from "@/components/rooms/ChatPanel";
import MemberList from "@/components/rooms/MemberList";
import LeaveRoomButton from "@/components/rooms/LeaveRoomButton";
import StartGamePanel from "@/components/rooms/StartGamePanel";

const HOST_MODE_LABEL: Record<string, string> = {
  host_controlled: "Host-controlled",
  turn_based: "Turn-based",
  open: "Open",
};

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/rooms/${code}`);

  const { data: room } = await supabase
    .from("rooms_public")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();
  if (!room) notFound();

  // RLS on room_memberships only returns rows for rooms the caller belongs
  // to, so this doubles as the "are you actually in this room?" check —
  // joining always goes through join_room() first, never a direct link.
  const { data: membership } = await supabase
    .from("room_memberships")
    .select("nickname, role")
    .eq("room_id", room.id)
    .eq("user_id", user.id)
    .single();
  if (!membership) redirect("/rooms");

  const { data: members } = await supabase
    .from("room_memberships")
    .select("user_id, nickname, role, is_muted")
    .eq("room_id", room.id)
    .order("joined_at", { ascending: true });

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, user_id, content, sent_at")
    .eq("room_id", room.id)
    .eq("status", "visible")
    .order("sent_at", { ascending: true })
    .limit(100);

  // Most recent session for this room, if any. There's no "active/ended"
  // status on game_sessions yet (out of scope for this pass — that belongs
  // with the live synced play screen), so this is a best-effort "most
  // recent" read rather than a true "is a game currently in progress" check.
  const { data: latestSession } = await supabase
    .from("game_sessions")
    .select("id, difficulty, tie_breaker_mode, created_at")
    .eq("room_id", room.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nicknameByUserId = Object.fromEntries(
    (members ?? []).map((m) => [m.user_id, m.nickname])
  );

  // host_controlled and turn_based both mean "creator only" for starting —
  // see the matching comment in startGameAction for why.
  const canStart = room.host_mode === "open" || membership.role === "creator";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-raised pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">
            {room.name}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-500">
            Code {room.code} · {room.has_password ? "Password protected" : "Open"}
            {room.verified_only ? " · Verified members only" : ""} ·{" "}
            {HOST_MODE_LABEL[room.host_mode] ?? room.host_mode}
          </p>
        </div>
        <LeaveRoomButton roomId={room.id} />
      </div>

      <div className="mt-6">
        {latestSession ? (
          <div className="rounded-2xl border border-truth/40 bg-truth/10 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-truth">
              Game session started
            </p>
            <p className="mt-1 text-sm text-ink-100">
              Difficulty: <span className="font-semibold">{latestSession.difficulty}</span>
              {" · "}
              Tie-break:{" "}
              <span className="font-semibold">
                {latestSession.tie_breaker_mode === "coin_toss" ? "Coin toss" : "Random"}
              </span>
            </p>
            <p className="mt-2 text-xs text-ink-500">
              The session and player list are saved — the live synced
              spin/prompt screen for online rooms is the next build, not
              wired up yet.
            </p>
          </div>
        ) : (
          <StartGamePanel roomId={room.id} canStart={canStart} />
        )}
      </div>

      <div className="mt-6 grid flex-1 grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
        <ChatPanel
          roomId={room.id}
          currentUserId={user.id}
          initialMessages={messages ?? []}
          nicknameByUserId={nicknameByUserId}
        />
        <MemberList
          roomId={room.id}
          initialMembers={members ?? []}
          isOwner={membership.role === "creator"}
        />
      </div>
    </div>
  );
}
