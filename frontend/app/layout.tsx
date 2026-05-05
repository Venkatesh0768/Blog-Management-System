import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StoryStack — Editorial Publishing",
  description:
    "A sanctuary for thoughtful prose and deep reading. Experience the internet's most intentional publishing environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${newsreader.variable}`} style={{ width: '100%', minHeight: '100vh' }}>
      <body style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }} className="bg-[#fbf9f9] text-[#1b1c1c] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
