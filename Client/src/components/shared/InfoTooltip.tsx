"use client";

export default function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-label="More info"
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full border border-ink-700 text-[10px] leading-none text-ink-500 hover:border-truth hover:text-truth"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-surface-raised bg-void-deep px-3 py-2 text-xs font-normal normal-case tracking-normal text-ink-100 opacity-0 shadow-lg transition group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
