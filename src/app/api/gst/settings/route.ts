import { kv } from "@vercel/kv";
import type { GstBusinessSettings } from "@/lib/gst-types";

export const dynamic = "force-dynamic";

const SETTINGS_KEY = "gst_business_settings";

const DEFAULT_SETTINGS: GstBusinessSettings = {
  companyName: "",
  address: "",
  city: "",
  state: "",
  stateCode: "",
  pincode: "",
  gstin: "",
  pan: "",
  phone: "",
  email: "",
  invoicePrefix: "INV/2024-25/",
  lastInvoiceNumber: 0,
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
};

async function getSettings(): Promise<GstBusinessSettings> {
  try {
    const settings = await kv.get<GstBusinessSettings>(SETTINGS_KEY);
    return settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
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

export async function GET() {
  const settings = await getSettings();
  return Response.json({ data: settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await getSettings();
    const updated: GstBusinessSettings = {
      ...current,
      ...body,
      gstin: body.gstin ? body.gstin.toUpperCase() : current.gstin,
      pan: body.pan ? body.pan.toUpperCase() : current.pan,
    };
    const ok = await saveSettings(updated);
    if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
    return Response.json({ data: updated });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
