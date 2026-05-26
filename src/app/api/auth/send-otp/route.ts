import { kv } from "@/lib/redis";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const OTP_PREFIX = "otp:";
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isKVAvailable(): boolean {
  return true; // Always available — using DigitalOcean Redis
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in KV with expiry
    if (isKVAvailable()) {
      try {
        await kv.set(`${OTP_PREFIX}${normalizedEmail}`, otp, { ex: OTP_EXPIRY_SECONDS });
      } catch (error) {
        console.error("[OTP] Failed to store OTP in KV:", error);
        return Response.json({ error: "Failed to store OTP. Please try again." }, { status: 500 });
      }
    } else {
      console.error("[OTP] Vercel KV not configured — cannot store OTP");
      return Response.json({ error: "OTP service not configured. Please contact admin." }, { status: 500 });
    }

    // Send OTP via email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[OTP] RESEND_API_KEY not configured");
      return Response.json({ error: "Email service not configured. Please contact admin." }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.OTP_FROM_EMAIL || "onboarding@resend.dev";

    const result = await resend.emails.send({
      from: `InTubeMedia <${fromEmail}>`,
      to: normalizedEmail,
      subject: "Your InTubeMedia OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin: 0;">InTubeMedia</h2>
            <p style="color: #666; font-size: 14px;">Password Reset / Login Verification</p>
          </div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px;">Your One-Time Password</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; margin: 0;">${otp}</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            This OTP is valid for 5 minutes. Do not share it with anyone.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error("[OTP] Resend error:", result.error);
      // Check if domain verification issue
      const errMsg = result.error.message || "Unknown error";
      if (errMsg.includes("testing emails") || errMsg.includes("verify a domain")) {
        return Response.json({ error: "Email service needs domain setup. Please ask admin to verify domain at resend.com/domains. Contact: contact@intubemedia.com" }, { status: 500 });
      }
      return Response.json({ error: `Email send failed: ${errMsg}` }, { status: 500 });
    }

    console.log(`[OTP] Sent to ${normalizedEmail}`);

    return Response.json({
      data: { success: true, message: "OTP sent successfully" },
    });
  } catch (error) {
    console.error("[OTP] Error sending OTP:", error);
    return Response.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
