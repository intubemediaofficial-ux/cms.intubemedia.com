import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { kv } from "@vercel/kv";
import crypto from "crypto";
import { setChannelToken, getChannelToken } from "@/lib/channel-tokens";

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
      userStatus?: "active" | "pending" | "inactive";
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
    userStatus?: "active" | "pending" | "inactive";
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
  channels: string[];
  status: "active" | "inactive" | "pending";
  role: "client";
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function verifyClientCredentials(
  email: string,
  password: string
): Promise<{ name: string; email: string; status: string } | null> {
  try {
    const users = await kv.get<StoredUser[]>("bainsla_users");
    if (!users) return null;

    const user = users.find(
      (u) => u.email.toLowerCase() === email && (u.status === "active" || u.status === "pending")
    );
    if (!user) return null;

    const hashed = hashPassword(password);
    if (user.password !== hashed) return null;

    return { name: user.name, email: user.email, status: user.status };
  } catch (error) {
    console.error("[Auth] Failed to verify client credentials:", error);
    return null;
  }
}

async function getOrCreateUserStatus(email: string, name: string): Promise<"active" | "pending" | "inactive"> {
  try {
    if (ADMIN_EMAILS.includes(email.toLowerCase())) return "active";
    const users = await kv.get<StoredUser[]>("bainsla_users") || [];
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing.status;

    // Auto-register new Google login user as pending
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      password: "",
      channels: [],
      status: "pending",
      role: "client",
    };
    users.push(newUser);
    await kv.set("bainsla_users", users);
    console.log(`[Auth] Auto-registered Google user as pending: ${email}`);
    return "pending";
  } catch (error) {
    console.error("[Auth] Failed to get/create user status:", error);
    return "pending";
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

async function autoSaveClientToken(
  email: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiry: number
) {
  try {
    const users = await kv.get<StoredUser[]>("bainsla_users");
    if (!users) return;
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active"
    );
    if (!user || user.channels.length === 0) return;

    for (const channelId of user.channels) {
      const existing = await getChannelToken(channelId);
      if (existing && existing.accessToken === accessToken) continue;
      await setChannelToken(channelId, {
        channelId,
        channelTitle: user.name,
        accessToken,
        refreshToken,
        tokenExpiry,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Auth] Auto-saved token for channel ${channelId} (user: ${email})`);
    }
  } catch (error) {
    console.error("[Auth] Failed to auto-save client tokens:", error);
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
          scope: "openid email profile",
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
          // Get user status from KV for credentials login
          const credEmail = (user?.email || "").toLowerCase();
          if (credEmail && !ADMIN_EMAILS.includes(credEmail)) {
            const users = await kv.get<StoredUser[]>("bainsla_users") || [];
            const storedUser = users.find((u) => u.email.toLowerCase() === credEmail);
            token.userStatus = storedUser?.status || "pending";
          }
        } else {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000;

          // Auto-save client's OAuth token for their channels so admin can access data
          const userEmail = (user?.email || token.email || "").toLowerCase();
          if (userEmail && account.access_token && account.refresh_token) {
            const expiry = account.expires_at
              ? account.expires_at * 1000
              : Date.now() + 3600 * 1000;
            autoSaveClientToken(userEmail, account.access_token, account.refresh_token, expiry)
              .catch(() => {});
          }

          // Auto-register Google login user as pending if not exists
          if (userEmail && !ADMIN_EMAILS.includes(userEmail)) {
            const userName = user?.name || userEmail.split("@")[0];
            const status = await getOrCreateUserStatus(userEmail, userName);
            token.userStatus = status;
          }
        }
        if (user) {
          token.email = user.email;
          token.name = user.name;
        }
      }

      const email = token.email?.toLowerCase() || "";
      token.role = ADMIN_EMAILS.includes(email) ? "admin" : "client";
      if (ADMIN_EMAILS.includes(email)) token.userStatus = "active";

      // Refresh user status from KV on each request (so admin approval takes effect)
      if (!ADMIN_EMAILS.includes(email) && email) {
        try {
          const users = await kv.get<StoredUser[]>("bainsla_users") || [];
          const storedUser = users.find((u) => u.email.toLowerCase() === email);
          if (storedUser) token.userStatus = storedUser.status;
        } catch { /* ignore */ }
      }

      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token);
        // Update stored channel tokens with refreshed access token
        if (refreshed.accessToken && !refreshed.error) {
          const refreshEmail = (refreshed.email as string || "").toLowerCase();
          if (refreshEmail && !ADMIN_EMAILS.includes(refreshEmail)) {
            autoSaveClientToken(
              refreshEmail,
              refreshed.accessToken as string,
              refreshed.refreshToken as string,
              refreshed.accessTokenExpires as number
            ).catch(() => {});
          }
        }
        return refreshed;
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
        session.user.userStatus = token.userStatus as "active" | "pending" | "inactive" | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
