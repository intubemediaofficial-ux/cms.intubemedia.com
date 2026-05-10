import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const NETWORKS_KEY = "bainsla_networks";

export interface Network {
  id: string;
  name: string;
  revenueSharePercent: number;
  createdDate: string;
}

const ADMIN_EMAILS = [
  "vijendrachoudhary95@gmail.com",
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
];

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

async function getNetworks(): Promise<Network[]> {
  try {
    const networks = await kv.get<Network[]>(NETWORKS_KEY);
    return networks || [];
  } catch (error) {
    console.error("[Networks] Failed to read from KV:", error);
    return [];
  }
}

async function saveNetworks(networks: Network[]): Promise<boolean> {
  try {
    await kv.set(NETWORKS_KEY, networks);
    return true;
  } catch (error) {
    console.error("[Networks] Failed to save to KV:", error);
    return false;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const networks = await getNetworks();
  return Response.json({ data: networks });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, revenueSharePercent } = body;

    if (!name) {
      return Response.json({ error: "Network name is required" }, { status: 400 });
    }

    const networks = await getNetworks();
    const exists = networks.some((n) => n.name.toLowerCase() === name.toLowerCase().trim());
    if (exists) {
      return Response.json({ error: "Network with this name already exists" }, { status: 409 });
    }

    const newNetwork: Network = {
      id: crypto.randomUUID(),
      name: name.trim(),
      revenueSharePercent: Number(revenueSharePercent) || 0,
      createdDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };

    networks.push(newNetwork);
    const saved = await saveNetworks(networks);
    if (!saved) {
      return Response.json({ error: "Failed to save network" }, { status: 500 });
    }

    return Response.json({ data: newNetwork }, { status: 201 });
  } catch (error) {
    console.error("[Networks] Error creating network:", error);
    return Response.json({ error: "Failed to create network" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, revenueSharePercent } = body;

    if (!id) {
      return Response.json({ error: "Network ID is required" }, { status: 400 });
    }

    const networks = await getNetworks();
    const idx = networks.findIndex((n) => n.id === id);
    if (idx === -1) {
      return Response.json({ error: "Network not found" }, { status: 404 });
    }

    if (name) networks[idx].name = name.trim();
    if (revenueSharePercent !== undefined) networks[idx].revenueSharePercent = Number(revenueSharePercent);

    const saved = await saveNetworks(networks);
    if (!saved) {
      return Response.json({ error: "Failed to update network" }, { status: 500 });
    }

    return Response.json({ data: networks[idx] });
  } catch (error) {
    console.error("[Networks] Error updating network:", error);
    return Response.json({ error: "Failed to update network" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Network ID is required" }, { status: 400 });
    }

    const networks = await getNetworks();
    const filtered = networks.filter((n) => n.id !== id);

    if (filtered.length === networks.length) {
      return Response.json({ error: "Network not found" }, { status: 404 });
    }

    const saved = await saveNetworks(filtered);
    if (!saved) {
      return Response.json({ error: "Failed to delete network" }, { status: 500 });
    }

    return Response.json({ data: { success: true } });
  } catch (error) {
    console.error("[Networks] Error deleting network:", error);
    return Response.json({ error: "Failed to delete network" }, { status: 500 });
  }
}
