import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/shared/Navbar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="ambient-glow" aria-hidden="true" />
        <ThemeProvider>
          <div className="relative z-10 flex min-h-full flex-col flex-1">
            <Navbar />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
