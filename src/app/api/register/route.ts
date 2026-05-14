import { kv } from "@vercel/kv";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const USERS_KEY = "bainsla_users";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  channels: string[];
  status: "active" | "inactive" | "pending";
  joinedDate: string;
  category: string;
  role: "client";
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return Response.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password minimum length
    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const users = await kv.get<StoredUser[]>(USERS_KEY) || [];

    // Check if email already exists
    const exists = users.some(
      (u) => u.email.toLowerCase() === emailLower
    );
    if (exists) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: emailLower,
      password: hashPassword(password),
      phone: phone?.trim() || "",
      channels: [],
      status: "pending",
      joinedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      category: "Music",
      role: "client",
    };

    users.push(newUser);
    await kv.set(USERS_KEY, users);

    return Response.json(
      { message: "Account created successfully. Admin will verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
