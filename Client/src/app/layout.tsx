import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/shared/Navbar";
import ThemeParticles from "@/components/shared/ThemeParticles";
import { createClient } from "@/lib/supabase/server";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SpillIt — Truth or Dare",
  description:
    "Spin, choose, spill. A browser Truth or Dare game with AI-flavored prompts, forfeit tracking, and a punish mechanic.",
  openGraph: {
    title: "SpillIt — Truth or Dare",
    description:
      "Spin, choose, spill. A browser Truth or Dare game with AI-flavored prompts, forfeit tracking, and a punish mechanic.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpillIt — Truth or Dare",
    description:
      "Spin, choose, spill. A browser Truth or Dare game with AI-flavored prompts, forfeit tracking, and a punish mechanic.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reads the session from cookies (kept fresh by middleware.ts) so the
  // Navbar's signed-in/out state is correct on first paint — no flash of
  // the wrong state, no client-side fetch needed. Auth actions call
  // revalidatePath("/", "layout") on sign-in/out specifically so this
  // re-runs immediately after those, without a full reload.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    displayName = profile?.display_name ?? null;
  }

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="ambient-glow" aria-hidden="true" />
        <ThemeProvider>
          <ThemeParticles />
          <div className="relative z-10 flex min-h-full flex-col flex-1">
            <Navbar user={displayName ? { displayName } : null} />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
