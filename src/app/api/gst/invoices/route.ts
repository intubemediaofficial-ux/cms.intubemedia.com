import { kv } from "@vercel/kv";
import type { GstInvoice, GstBusinessSettings } from "@/lib/gst-types";
import { numberToWords } from "@/lib/gst-utils";

export const dynamic = "force-dynamic";

const INVOICES_KEY = "gst_invoices";
const SETTINGS_KEY = "gst_business_settings";

async function getInvoices(): Promise<GstInvoice[]> {
  try {
    return (await kv.get<GstInvoice[]>(INVOICES_KEY)) || [];
  } catch {
    return [];
  }
}

async function saveInvoices(invoices: GstInvoice[]): Promise<boolean> {
  try {
    await kv.set(INVOICES_KEY, invoices);
    return true;
  } catch {
    return false;
  }
}

async function getSettings(): Promise<GstBusinessSettings | null> {
  try {
    return await kv.get<GstBusinessSettings>(SETTINGS_KEY);
  } catch {
    return null;
  }
}

async function saveSettings(settings: GstBusinessSettings): Promise<boolean> {
  try {
    await kv.set(SETTINGS_KEY, settings);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const invoices = await getInvoices();

  if (id) {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ data: invoice });
  }

  const sorted = invoices.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return Response.json({ data: sorted });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const invoices = await getInvoices();
      const settings = await getSettings();

      const prefix = settings?.invoicePrefix || "INV/";
      const lastNum = settings?.lastInvoiceNumber || 0;
      const nextNum = lastNum + 1;
      const invoiceNumber = `${prefix}${String(nextNum).padStart(3, "0")}`;

      const subtotal = (body.items || []).reduce(
        (sum: number, item: { amount?: number }) => sum + (item.amount || 0),
        0
      );

      const newInvoice: GstInvoice = {
        id: crypto.randomUUID(),
        invoiceNumber,
        invoiceDate: body.invoiceDate || new Date().toISOString().split("T")[0],
        dueDate: body.dueDate || "",
        clientId: body.clientId || "",
        clientName: body.clientName || "",
        clientGstin: body.clientGstin || "",
        clientAddress: body.clientAddress || "",
        clientState: body.clientState || "",
        clientStateCode: body.clientStateCode || "",
        placeOfSupply: body.placeOfSupply || "",
        placeOfSupplyCode: body.placeOfSupplyCode || "",
        items: body.items || [],
        subtotal,
        cgst: body.cgst || 0,
        sgst: body.sgst || 0,
        igst: body.igst || 0,
        totalTax: body.totalTax || 0,
        grandTotal: body.grandTotal || 0,
        amountInWords: numberToWords(body.grandTotal || 0),
        notes: body.notes || "",
        status: body.status || "draft",
        createdAt: new Date().toISOString(),
      };

      invoices.push(newInvoice);
      const ok = await saveInvoices(invoices);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });

      if (settings) {
        settings.lastInvoiceNumber = nextNum;
        await saveSettings(settings);
      }

      return Response.json({ data: newInvoice });
    }

    if (action === "update_status") {
      const invoices = await getInvoices();
      const idx = invoices.findIndex((inv) => inv.id === body.id);
      if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
      invoices[idx].status = body.status;
      const ok = await saveInvoices(invoices);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
      return Response.json({ data: invoices[idx] });
    }

    if (action === "delete") {
      const invoices = await getInvoices();
      const filtered = invoices.filter((inv) => inv.id !== body.id);
      const ok = await saveInvoices(filtered);
      if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
