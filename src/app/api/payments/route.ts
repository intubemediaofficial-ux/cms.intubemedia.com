import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const PAYMENTS_KEY = "bainsla_payments";

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  networkId: string;
  networkName: string;
  revenueSharePercent: number;
  fromDate: string;
  toDate: string;
  totalAmount: number;
  tdsPercent: number;
  tdsAmount: number;
  networkRevenue: number;
  netTotal: number;
  status: "pending" | "paid" | "processing";
  createdDate: string;
  notes: string;
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

async function getPayments(): Promise<Payment[]> {
  try {
    const payments = await kv.get<Payment[]>(PAYMENTS_KEY);
    return payments || [];
  } catch (error) {
    console.error("[Payments] Failed to read from KV:", error);
    return [];
  }
}

async function savePayments(payments: Payment[]): Promise<boolean> {
  try {
    await kv.set(PAYMENTS_KEY, payments);
    return true;
  } catch (error) {
    console.error("[Payments] Failed to save to KV:", error);
    return false;
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = ADMIN_EMAILS.includes(session.user.email.toLowerCase());
  const payments = await getPayments();

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (admin) {
    if (userId) {
      return Response.json({ data: payments.filter((p) => p.userId === userId) });
    }
    return Response.json({ data: payments });
  }

  // Client can only see their own payments
  return Response.json({
    data: payments.filter((p) => p.userEmail.toLowerCase() === session.user!.email!.toLowerCase()),
  });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      userId, userName, userEmail,
      networkId, networkName, revenueSharePercent,
      fromDate, toDate, totalAmount,
      tdsPercent, notes,
    } = body;

    if (!userId || !fromDate || !toDate || totalAmount === undefined) {
      return Response.json({ error: "Required fields missing" }, { status: 400 });
    }

    const tds = Number(tdsPercent) || 0;
    const total = Number(totalAmount) || 0;
    const revShare = Number(revenueSharePercent) || 0;
    const networkRev = total * (revShare / 100);
    const tdsAmount = (total - networkRev) * (tds / 100);
    const netTotal = total - networkRev - tdsAmount;

    const payment: Payment = {
      id: crypto.randomUUID(),
      userId,
      userName: userName || "",
      userEmail: userEmail || "",
      networkId: networkId || "",
      networkName: networkName || "",
      revenueSharePercent: revShare,
      fromDate,
      toDate,
      totalAmount: total,
      tdsPercent: tds,
      tdsAmount: Math.round(tdsAmount * 100) / 100,
      networkRevenue: Math.round(networkRev * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
      status: "pending",
      createdDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      notes: notes || "",
    };

    const payments = await getPayments();
    payments.push(payment);
    const saved = await savePayments(payments);
    if (!saved) {
      return Response.json({ error: "Failed to save payment" }, { status: 500 });
    }

    return Response.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error("[Payments] Error creating payment:", error);
    return Response.json({ error: "Failed to create payment" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return Response.json({ error: "Payment ID required" }, { status: 400 });
    }

    const payments = await getPayments();
    const idx = payments.findIndex((p) => p.id === id);
    if (idx === -1) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    if (status) payments[idx].status = status;
    if (notes !== undefined) payments[idx].notes = notes;

    const saved = await savePayments(payments);
    if (!saved) {
      return Response.json({ error: "Failed to update payment" }, { status: 500 });
    }

    return Response.json({ data: payments[idx] });
  } catch (error) {
    console.error("[Payments] Error updating payment:", error);
    return Response.json({ error: "Failed to update payment" }, { status: 500 });
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
      return Response.json({ error: "Payment ID required" }, { status: 400 });
    }

    const payments = await getPayments();
    const filtered = payments.filter((p) => p.id !== id);
    if (filtered.length === payments.length) {
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    const saved = await savePayments(filtered);
    if (!saved) {
      return Response.json({ error: "Failed to delete payment" }, { status: 500 });
    }

    return Response.json({ data: { success: true } });
  } catch (error) {
    console.error("[Payments] Error deleting payment:", error);
    return Response.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
