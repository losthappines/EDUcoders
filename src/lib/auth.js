import crypto from "crypto";
export const SESSION_COOKIE_NAME = "patronaj_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET = process.env.AUTH_SECRET ||
    process.env.ENCRYPTION_KEY ||
    "ovabmu-patronaj-session-secret-key-2026";
export const VALID_ROLES = [
    "OVABMU_MD",
    "FAMILY_MD",
    "PATIENT",
    "ADMIN_RECEPTION",
];
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${derived}`;
}
export function verifyPassword(password, storedHash) {
    if (typeof password !== "string" || !password)
        return false;
    if (typeof storedHash !== "string" ||
        !storedHash ||
        !storedHash.startsWith("scrypt:")) {
        return false;
    }
    const parts = storedHash.split(":");
    if (parts.length !== 3)
        return false;
    const [, salt, originalHex] = parts;
    if (!salt ||
        !originalHex ||
        !/^[0-9a-f]+$/i.test(originalHex) ||
        originalHex.length % 2 !== 0) {
        return false;
    }
    try {
        const derived = crypto.scryptSync(password, salt, 64);
        const original = Buffer.from(originalHex, "hex");
        if (derived.length !== original.length)
            return false;
        return crypto.timingSafeEqual(derived, original);
    }
    catch {
        return false;
    }
}
export function createPasswordResetChallenge(email, currentPasswordHash) {
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(`${email.toLowerCase()}:${code}`)
        .digest("hex");
    const payload = {
        email: email.toLowerCase(),
        codeHash,
        hashPrefix: (currentPasswordHash || "").slice(0, 24),
        exp: Math.floor(Date.now() / 1000) + 60 * 15,
    };
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    const sig = signData(encoded);
    return { code, resetToken: `${encoded}.${sig}` };
}
export function verifyPasswordResetChallenge(params) {
    const { resetToken, email, code, currentPasswordHash } = params;
    if (!resetToken || !resetToken.includes(".") || !email || !code) {
        return false;
    }
    const [encoded, sig] = resetToken.split(".");
    if (!encoded || !sig)
        return false;
    const expectedSig = signData(encoded);
    try {
        const sigBuf = Buffer.from(sig, "utf8");
        const expectedBuf = Buffer.from(expectedSig, "utf8");
        if (sigBuf.length !== expectedBuf.length)
            return false;
        if (!crypto.timingSafeEqual(sigBuf, expectedBuf))
            return false;
        const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
        if (!parsed?.email ||
            !parsed?.codeHash ||
            typeof parsed.exp !== "number" ||
            parsed.exp < Math.floor(Date.now() / 1000)) {
            return false;
        }
        if (parsed.email !== email.trim().toLowerCase())
            return false;
        if ((parsed.hashPrefix || "") !== (currentPasswordHash || "").slice(0, 24)) {
            return false;
        }
        const expectedCodeHash = crypto
            .createHmac("sha256", SESSION_SECRET)
            .update(`${email.trim().toLowerCase()}:${code.trim()}`)
            .digest("hex");
        const codeBuf = Buffer.from(parsed.codeHash, "utf8");
        const expectedCodeBuf = Buffer.from(expectedCodeHash, "utf8");
        if (codeBuf.length !== expectedCodeBuf.length)
            return false;
        return crypto.timingSafeEqual(codeBuf, expectedCodeBuf);
    }
    catch {
        return false;
    }
}
export function normalizePhoneDigits(phone) {
    return String(phone || "").replace(/\D/g, "");
}
export function createPhoneOtpChallenge(phone) {
    const normalized = normalizePhoneDigits(phone);
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(`phone:${normalized}:${code}`)
        .digest("hex");
    const payload = {
        phone: normalized,
        codeHash,
        exp: Math.floor(Date.now() / 1000) + 60 * 10,
    };
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    const sig = signData(encoded);
    return { code, otpToken: `${encoded}.${sig}` };
}
export function verifyPhoneOtpChallenge({ phone, code, otpToken }) {
    const normalized = normalizePhoneDigits(phone);
    if (!otpToken || !otpToken.includes(".") || !normalized || !code) {
        return null;
    }
    const [encoded, sig] = otpToken.split(".");
    if (!encoded || !sig)
        return null;
    const expectedSig = signData(encoded);
    try {
        const sigBuf = Buffer.from(sig, "utf8");
        const expectedBuf = Buffer.from(expectedSig, "utf8");
        if (sigBuf.length !== expectedBuf.length)
            return null;
        if (!crypto.timingSafeEqual(sigBuf, expectedBuf))
            return null;
        const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
        if (!parsed?.phone ||
            !parsed?.codeHash ||
            typeof parsed.exp !== "number" ||
            parsed.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        if (parsed.phone !== normalized)
            return null;
        const expectedCodeHash = crypto
            .createHmac("sha256", SESSION_SECRET)
            .update(`phone:${normalized}:${String(code).trim()}`)
            .digest("hex");
        const codeBuf = Buffer.from(parsed.codeHash, "utf8");
        const expectedCodeBuf = Buffer.from(expectedCodeHash, "utf8");
        if (codeBuf.length !== expectedCodeBuf.length)
            return null;
        if (!crypto.timingSafeEqual(codeBuf, expectedCodeBuf))
            return null;
        const proofPayload = {
            phone: normalized,
            verified: true,
            exp: Math.floor(Date.now() / 1000) + 60 * 30,
        };
        const proofEncoded = Buffer.from(JSON.stringify(proofPayload), "utf8").toString("base64url");
        return `${proofEncoded}.${signData(proofEncoded)}`;
    }
    catch {
        return null;
    }
}
export function verifyPhoneVerifiedToken(phone, token) {
    const normalized = normalizePhoneDigits(phone);
    if (!token || !token.includes(".") || !normalized)
        return false;
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig)
        return false;
    const expectedSig = signData(encoded);
    try {
        const sigBuf = Buffer.from(sig, "utf8");
        const expectedBuf = Buffer.from(expectedSig, "utf8");
        if (sigBuf.length !== expectedBuf.length)
            return false;
        if (!crypto.timingSafeEqual(sigBuf, expectedBuf))
            return false;
        const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
        return Boolean(parsed?.verified &&
            parsed?.phone === normalized &&
            typeof parsed.exp === "number" &&
            parsed.exp >= Math.floor(Date.now() / 1000));
    }
    catch {
        return false;
    }
}
function signData(encodedPayload) {
    return crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(encodedPayload)
        .digest("base64url");
}
export function createSessionToken(userId, role) {
    const payload = {
        userId,
        role,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    const sig = signData(encoded);
    return `${encoded}.${sig}`;
}
export function verifySessionToken(token) {
    if (!token || !token.includes("."))
        return null;
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig)
        return null;
    const expectedSig = signData(encoded);
    try {
        const sigBuf = Buffer.from(sig, "utf8");
        const expectedBuf = Buffer.from(expectedSig, "utf8");
        if (sigBuf.length !== expectedBuf.length)
            return null;
        if (!crypto.timingSafeEqual(sigBuf, expectedBuf))
            return null;
        const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
        if (!parsed?.userId ||
            !parsed?.role ||
            !VALID_ROLES.includes(parsed.role) ||
            typeof parsed.exp !== "number") {
            return null;
        }
        if (parsed.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
export function getSessionFromRequest(req) {
    if (!req)
        return null;
    let token;
    if ("cookies" in req && typeof req.cookies?.get === "function") {
        token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    }
    else {
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
export function setSessionCookie(res, userId, role) {
    const token = createSessionToken(userId, role);
    res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_SECONDS,
    });
}
export function clearSessionCookie(res) {
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
export function createTelegramLinkToken(userId) {
    if (!userId || typeof userId !== "string")
        return "";
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const exp36 = exp.toString(36);
    const sig = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(`tglink:${userId}:${exp36}`)
        .digest("hex")
        .slice(0, 16);
    return `link_${userId}_${exp36}_${sig}`;
}
export function verifyTelegramLinkToken(rawToken) {
    if (typeof rawToken !== "string" || !rawToken)
        return null;
    const trimmed = rawToken.trim();
    const body = trimmed.startsWith("link_") ? trimmed.slice(5) : trimmed;
    const lastIdx = body.lastIndexOf("_");
    if (lastIdx <= 0)
        return null;
    const prevIdx = body.lastIndexOf("_", lastIdx - 1);
    if (prevIdx <= 0)
        return null;
    const userId = body.slice(0, prevIdx);
    const exp36 = body.slice(prevIdx + 1, lastIdx);
    const sig = body.slice(lastIdx + 1);
    if (!userId || !exp36 || !sig || sig.length !== 16)
        return null;
    const expectedSig = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(`tglink:${userId}:${exp36}`)
        .digest("hex")
        .slice(0, 16);
    try {
        const sigBuf = Buffer.from(sig, "utf8");
        const expectedBuf = Buffer.from(expectedSig, "utf8");
        if (sigBuf.length !== expectedBuf.length)
            return null;
        if (!crypto.timingSafeEqual(sigBuf, expectedBuf))
            return null;
        const exp = parseInt(exp36, 36);
        if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000))
            return null;
        return { userId, exp };
    }
    catch {
        return null;
    }
}
export function getPortalPathForRole(role) {
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
