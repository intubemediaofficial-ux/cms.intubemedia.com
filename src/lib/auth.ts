import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { kv } from "@vercel/kv";
import crypto from "crypto";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "client";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    role?: "admin" | "client";
  }
}

const ADMIN_EMAILS = [
  "vijendrachoudhary95@gmail.com",
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
];

const ADMIN_CREDENTIALS: Record<string, { password: string; name: string }> = {
  "vijendrachoudhary95@gmail.com": {
    password: process.env.ADMIN_PASSWORD || "BainslaAdmin@2026",
    name: "Vijendra Choudhary",
  },
  "ajeetgurjarofficial@gmail.com": {
    password: process.env.ADMIN_PASSWORD_2 || "BainslaAdmin@2026",
    name: "Ajeet Gurjar",
  },
  "bainslamusicofficial@gmail.com": {
    password: process.env.ADMIN_PASSWORD_3 || "BainslaAdmin@2026",
    name: "Bainsla Music",
  },
};

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  status: "active" | "inactive";
  role: "client";
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function verifyClientCredentials(
  email: string,
  password: string
): Promise<{ name: string; email: string } | null> {
  try {
    const users = await kv.get<StoredUser[]>("bainsla_users");
    if (!users) return null;

    const user = users.find(
      (u) => u.email.toLowerCase() === email && u.status === "active"
    );
    if (!user) return null;

    const hashed = hashPassword(password);
    if (user.password !== hashed) return null;

    return { name: user.name, email: user.email };
  } catch (error) {
    console.error("[Auth] Failed to verify client credentials:", error);
    return null;
  }
}

async function refreshAccessToken(token: import("next-auth/jwt").JWT) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();

        // Admin login
        const admin = ADMIN_CREDENTIALS[email];
        if (admin && credentials.password === admin.password) {
          return {
            id: email,
            email,
            name: admin.name,
            image: null,
          };
        }

        // Client login via KV
        const client = await verifyClientCredentials(email, credentials.password);
        if (client) {
          return {
            id: client.email,
            email: client.email,
            name: client.name,
            image: null,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/yt-analytics.readonly",
            "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        if (account.type === "credentials") {
          // role assigned below based on email
        } else {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000;
        }
        if (user) {
          token.email = user.email;
          token.name = user.name;
        }
      }

      const email = token.email?.toLowerCase() || "";
      token.role = ADMIN_EMAILS.includes(email) ? "admin" : "client";

      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) {
        session.user.role = token.role as "admin" | "client" | undefined;
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
