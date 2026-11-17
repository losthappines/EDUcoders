import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "./types";

export const SESSION_COOKIE_NAME = "patronaj_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const SESSION_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ENCRYPTION_KEY ||
  "ovabmu-patronaj-session-secret-key-2026";

export const VALID_ROLES: UserRole[] = [
  "OVABMU_MD",
  "FAMILY_MD",
  "PATIENT",
  "ADMIN_RECEPTION",
];

export interface SessionPayload {
  userId: string;
  role: UserRole;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith("scrypt:")) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 3) return false;
  const [, salt, originalHex] = parts;
  if (!salt || !originalHex) return false;

  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, "hex");
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  } catch {
    return false;
  }
}

function signData(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(userId: string, role: UserRole): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = signData(encoded);
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expectedSig = signData(encoded);
  try {
    const sigBuf = Buffer.from(sig, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
    if (
      !parsed?.userId ||
      !parsed?.role ||
      !VALID_ROLES.includes(parsed.role) ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(
  req?: NextRequest | Request
): SessionPayload | null {
  if (!req) return null;
  let token: string | undefined;

  if ("cookies" in req && typeof req.cookies?.get === "function") {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (match) {
      token = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
    }
  }

  return token ? verifySessionToken(token) : null;
}

export function setSessionCookie(
  res: NextResponse,
  userId: string,
  role: UserRole
): void {
  const token = createSessionToken(userId, role);
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  res.cookies.delete("patronaj_role");
  res.cookies.delete("patronaj_user_id");
}

export function getPortalPathForRole(role: UserRole): string {
  switch (role) {
    case "PATIENT":
      return "/patient";
    case "OVABMU_MD":
    case "FAMILY_MD":
      return "/clinical";
    case "ADMIN_RECEPTION":
      return "/admin";
  }
}
