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
  title: "Bainsla Music - Rajasthan's No.1 Music Production Company",
  description:
    "Bainsla Music is a distinguished music production company rooted in Rajasthan, India. YouTube CMS/MCN, Music Distribution, Channel Promotion & Management.",
  keywords:
    "Bainsla Music, Rajasthani Music, Rasiya Songs, YouTube CMS, Music Distribution, Channel Management, Jaipur",
  openGraph: {
    title: "Bainsla Music - Rajasthan's No.1 Music Production Company",
    description:
      "Music Production, YouTube CMS/MCN, Audio Video Distribution & Channel Management. 9+ Years, 500+ Videos, 50+ Artists.",
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
