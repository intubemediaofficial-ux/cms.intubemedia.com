import { kv } from "@vercel/kv";
import type { GstClient } from "@/lib/gst-types";

export const dynamic = "force-dynamic";

const CLIENTS_KEY = "gst_clients";

async function getClients(): Promise<GstClient[]> {
  try {
    return (await kv.get<GstClient[]>(CLIENTS_KEY)) || [];
  } catch {
    return [];
  }
}

async function saveClients(clients: GstClient[]): Promise<boolean> {
  try {
    await kv.set(CLIENTS_KEY, clients);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const clients = await getClients();
  return Response.json({ data: clients });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const clients = await getClients();
      const newClient: GstClient = {
        id: crypto.randomUUID(),
        name: body.name || "",
        address: body.address || "",
        city: body.city || "",
        state: body.state || "",
        stateCode: body.stateCode || "",
        pincode: body.pincode || "",
        gstin: (body.gstin || "").toUpperCase(),
        pan: (body.pan || "").toUpperCase(),
        phone: body.phone || "",
        email: body.email || "",
        createdAt: new Date().toISOString(),
      };
      clients.push(newClient);
      const ok = await saveClients(clients);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
      return Response.json({ data: newClient });
    }

    if (action === "update") {
      const clients = await getClients();
      const idx = clients.findIndex((c) => c.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      clients[idx] = {
        ...clients[idx],
        name: body.name ?? clients[idx].name,
        address: body.address ?? clients[idx].address,
        city: body.city ?? clients[idx].city,
        state: body.state ?? clients[idx].state,
        stateCode: body.stateCode ?? clients[idx].stateCode,
        pincode: body.pincode ?? clients[idx].pincode,
        gstin: body.gstin ? body.gstin.toUpperCase() : clients[idx].gstin,
        pan: body.pan ? body.pan.toUpperCase() : clients[idx].pan,
        phone: body.phone ?? clients[idx].phone,
        email: body.email ?? clients[idx].email,
      };
      const ok = await saveClients(clients);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
      return Response.json({ data: clients[idx] });
    }

    if (action === "delete") {
      const clients = await getClients();
      const filtered = clients.filter((c) => c.id !== body.id);
      const ok = await saveClients(filtered);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
