import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { kv } from "@/lib/redis";

const CONFIG_KEY = "cms_vendor_google_sheet_config";

export interface VendorGoogleSheetConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

interface EncryptedConfig {
  version: 1;
  iv: string;
  authTag: string;
  ciphertext: string;
}

function encryptionKey(): Buffer {
  const secret =
    process.env.CHANNEL_TOKEN_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("Google Sheet credential encryption is not configured");
  return createHash("sha256")
    .update(`intubemedia:vendor-google-sheet:v1:${secret}`)
    .digest();
}

export async function saveVendorGoogleSheetConfig(
  config: VendorGoogleSheetConfig
): Promise<void> {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(config), "utf8"),
    cipher.final(),
  ]);
  const stored: EncryptedConfig = {
    version: 1,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
  await kv.set(CONFIG_KEY, stored);
}

export async function getVendorGoogleSheetConfig(): Promise<VendorGoogleSheetConfig | null> {
  const stored = await kv.get<EncryptedConfig>(CONFIG_KEY);
  if (!stored || stored.version !== 1) return null;
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(stored.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(stored.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(stored.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(plaintext) as VendorGoogleSheetConfig;
}
