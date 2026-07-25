"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  user_id: string;
  content: string;
  sent_at: string;
};

const REPORT_CATEGORIES = [
  { id: "harassment", label: "Harassment" },
  { id: "off-tier", label: "Off-tier content" },
  { id: "spam", label: "Spam" },
  { id: "underage", label: "Underage concern" },
  { id: "other", label: "Other" },
];

export default function ChatPanel({
  roomId,
  currentUserId,
  initialMessages,
  nicknameByUserId,
}: {
  roomId: string;
  currentUserId: string;
  initialMessages: Message[];
  nicknameByUserId: Record<string, string>;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:messages`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as Message & { status: string };
          if (row.status === "hidden") {
            setMessages((prev) => prev.filter((m) => m.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is stable per mount, roomId is the real dependency
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    const { error } = await supabase
      .from("chat_messages")
      .insert({ room_id: roomId, user_id: currentUserId, content });
    setSending(false);
    if (!error) setDraft("");
  }

  async function submitReport(messageId: string, category: string) {
    await supabase.from("reports").insert({
      message_id: messageId,
      reporter_id: currentUserId,
      categories: [category],
    });
    setReportingId(null);
  }

  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-surface-raised bg-surface">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-ink-700">
            No messages yet — say hi.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.user_id === currentUserId;
          return (
            <div key={m.id} className={`group flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? "bg-dare text-void-deep" : "bg-surface-raised text-ink-100"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest opacity-70">
                    {nicknameByUserId[m.user_id] ?? "Player"}
                  </p>
                )}
                {m.content}
              </div>
              {!mine && (
                <button
                  type="button"
                  onClick={() => setReportingId(reportingId === m.id ? null : m.id)}
                  className="mt-0.5 text-[10px] text-ink-700 opacity-0 transition hover:text-dare group-hover:opacity-100"
                >
                  Report
                </button>
              )}
              {reportingId === m.id && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {REPORT_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => submitReport(m.id, c.id)}
                      className="rounded-full border border-surface-raised px-2.5 py-1 text-[10px] text-ink-500 hover:border-dare hover:text-ink-100"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-surface-raised p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          placeholder="Say something…"
          className="flex-1 rounded-xl border border-surface-raised bg-void px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-truth"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-xl bg-truth px-4 py-2 font-display text-sm font-bold text-void-deep transition enabled:hover:bg-truth-dim disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
