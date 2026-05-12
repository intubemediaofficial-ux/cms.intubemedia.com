import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bainsla Music Private Limited | India's Devotional, Folk & Rasiya Music Label",
  description:
    "Bainsla Music Private Limited — India's leading Devotional, Folk & Rasiya music label. Listen to the latest Bhajans, Gurjar Rasiya & Folk Songs. Digital Music Distribution.",
  keywords:
    "bainsla music, bhajan, rasiya, folk songs, devotional music, Krishna bhajan, Hanuman Chalisa, Radha bhajan, Gurjar Rasiya, DJ Rasiya, music distribution, YouTube CMS",
  openGraph: {
    title: "Bainsla Music Private Limited | India's Devotional, Folk & Rasiya Music Label",
    description:
      "India's Devotional, Folk & Rasiya Music Label. Devotional Bhajans, Gurjar Rasiya, Folk Songs and Digital Music Distribution.",
    type: "website",
    url: "https://bainslamusic.com",
  },
  icons: {
    icon: "/favicon.ico",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
