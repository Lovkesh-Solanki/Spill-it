import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatPanel from "@/components/rooms/ChatPanel";
import MemberList from "@/components/rooms/MemberList";

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

  const nicknameByUserId = Object.fromEntries(
    (members ?? []).map((m) => [m.user_id, m.nickname])
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-raised pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">
            {room.name}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-500">
            Code {room.code} · {room.has_password ? "Password protected" : "Open"}
            {room.verified_only ? " · Verified members only" : ""}
          </p>
        </div>
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
