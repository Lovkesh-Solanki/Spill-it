import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatPanel from "@/components/rooms/ChatPanel";
import MemberList from "@/components/rooms/MemberList";
import LeaveRoomButton from "@/components/rooms/LeaveRoomButton";
import StartGamePanel from "@/components/rooms/StartGamePanel";
import OnlineGameBoard from "@/components/game/OnlineGameBoard";
import GameSessionWatcher from "@/components/rooms/GameSessionWatcher";

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

  const { data: sessionPlayers } = latestSession
    ? await supabase
        .from("players")
        .select("id, name, user_id, forfeit_count")
        .eq("session_id", latestSession.id)
    : { data: null };

  const nicknameByUserId = Object.fromEntries(
    (members ?? []).map((m) => [m.user_id, m.nickname])
  );

  // host_controlled and turn_based both mean "creator only" for starting —
  // see the matching comment in startGameAction for why.
  const canStart = room.host_mode === "open" || membership.role === "creator";
  const totalMembers = members?.length ?? sessionPlayers?.length ?? 1;

  return (
    // h-[calc(...)] + overflow-hidden caps this page to the viewport (minus
    // the navbar) instead of letting it grow tall and scroll the whole
    // window — each zone below scrolls internally instead. 100dvh accounts
    // for mobile browser chrome better than 100vh; the fixed px offset is
    // an estimate of the navbar's rendered height (py-3 + logo + border).
    <div className="mx-auto flex h-[calc(100dvh-4.5rem)] w-full max-w-[1500px] flex-col overflow-hidden px-4 py-4">
      <GameSessionWatcher roomId={room.id} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-raised pb-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-100 sm:text-2xl">
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

      {/*
        Three zones on wide screens: game | prompt | chat+members — all
        visible at once, nothing needs scrolling the page itself to reach.
        OnlineGameBoard internally splits into the first two (game/prompt)
        sub-columns; this grid provides the outer game-area/chat split plus
        the responsive single-column fallback below the lg breakpoint.
      */}
      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden">
        <div className="min-h-0 lg:overflow-hidden">
          {latestSession && sessionPlayers && sessionPlayers.length > 0 ? (
            <OnlineGameBoard
              roomId={room.id}
              sessionId={latestSession.id}
              difficulty={latestSession.difficulty}
              tieBreakerMode={latestSession.tie_breaker_mode}
              hostMode={room.host_mode}
              dbPlayers={sessionPlayers}
              currentUserId={user.id}
              isHost={membership.role === "creator"}
              totalMembers={totalMembers}
            />
          ) : (
            <StartGamePanel roomId={room.id} canStart={canStart} />
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-4 lg:overflow-hidden">
          <div className="min-h-0 flex-1 lg:overflow-hidden">
            <ChatPanel
              roomId={room.id}
              currentUserId={user.id}
              initialMessages={messages ?? []}
              nicknameByUserId={nicknameByUserId}
            />
          </div>
          <div className="max-h-[40%] shrink-0 overflow-y-auto">
            <MemberList
              roomId={room.id}
              initialMembers={members ?? []}
              isOwner={membership.role === "creator"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
