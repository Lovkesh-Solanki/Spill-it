import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Join in
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-100">
        Create your account
      </h1>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="text-truth hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
