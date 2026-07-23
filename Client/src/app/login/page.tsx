import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-100">
        Sign in
      </h1>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-ink-500">
        New here?{" "}
        <Link href="/signup" className="text-truth hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
