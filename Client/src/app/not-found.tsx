import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-ink-700">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink-100">
        This page went and hid somewhere.
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Whatever you were looking for isn&apos;t here — maybe it was a room
        that ended, or the link just wasn&apos;t right.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-dare px-6 py-3 font-display font-bold text-void-deep transition hover:bg-dare-dim"
      >
        Back to home
      </Link>
    </div>
  );
}
