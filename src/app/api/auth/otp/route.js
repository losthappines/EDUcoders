import { NextResponse } from "next/server";
import {
  createPhoneOtpChallenge,
  normalizePhoneDigits,
  verifyPhoneOtpChallenge,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action.toUpperCase() : "REQUEST";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 9 || digits.length > 15) {
    return NextResponse.json(
      { error: "Please enter a valid phone number (e.g. +998 90 123 45 67)." },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit({
    key: `otp:${action}:${ip}:${digits}`,
    limit: 6,
    windowMs: 2 * 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  if (action === "REQUEST") {
    const { code, otpToken } = createPhoneOtpChallenge(phone);
    return NextResponse.json({
      success: true,
      otpToken,
      // Displayed only in simulated/sandbox mode when external SMS gateway is not configured
      ...(process.env.SMS_GATEWAY_URL ? {} : { smsPreviewCode: code }),
      message: "6-digit phone verification code prepared.",
    });
  }

  if (action === "VERIFY") {
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const otpToken = typeof body.otpToken === "string" ? body.otpToken : "";
    const verifiedPhoneToken = verifyPhoneOtpChallenge({ phone, code, otpToken });
    if (!verifiedPhoneToken) {
      return NextResponse.json(
        { error: "Invalid or expired 6-digit phone verification code." },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      verifiedPhoneToken,
      message: "Phone number verified.",
    });
  }

  return NextResponse.json({ error: "Unsupported OTP action." }, { status: 400 });
}
