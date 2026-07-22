import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Spin. Choose. Spill.
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold text-ink-100 sm:text-6xl">
        Spill<span className="text-dare">It</span>
      </h1>
      <p className="mt-4 max-w-sm text-ink-400">
        Truth or Dare, digitized. AI-flavored prompts, four difficulty tiers,
        and a scoreboard that remembers who kept dodging.
      </p>

      <div className="mt-10 grid w-full gap-4">
        <Link
          href="/play/local"
          className="rounded-2xl border-2 border-dare bg-dare/10 px-6 py-5 text-left transition hover:bg-dare/20"
        >
          <span className="font-display text-xl font-bold text-ink-100">
            Play offline
          </span>
          <p className="mt-1 text-sm text-ink-500">
            One device, one leader. No account needed.
          </p>
        </Link>

        <div className="cursor-not-allowed rounded-2xl border-2 border-surface-raised bg-surface/60 px-6 py-5 text-left opacity-60">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-ink-100">
              Play online with friends
            </span>
            <span className="rounded-full bg-surface-raised px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-500">
              Phase 2
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Rooms, live chat, and voice — coming next.
          </p>
        </div>
      </div>
    </main>
  );
}
