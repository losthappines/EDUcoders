import crypto from "crypto";

export function verifyTelegramWebAppInitData(initData, botToken, maxAgeSeconds = 86400) {
  if (!initData || typeof initData !== "string") {
    return { valid: false, error: "Missing initData" };
  }
  if (!botToken) {
    return { valid: false, error: "Bot token not configured" };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    return { valid: false, error: "Missing initData hash" };
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (authDate > 0) {
    const ageSec = Math.floor(Date.now() / 1000) - authDate;
    if (ageSec > maxAgeSeconds) {
      return { valid: false, error: "Telegram initData expired" };
    }
  }

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHex = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const hashBuf = Buffer.from(hash, "hex");
  const computedBuf = Buffer.from(computedHex, "hex");
  if (hashBuf.length !== computedBuf.length || !crypto.timingSafeEqual(hashBuf, computedBuf)) {
    return { valid: false, error: "Invalid Telegram initData signature" };
  }

  let user = null;
  const userRaw = params.get("user");
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      return { valid: false, error: "Malformed user payload in initData" };
    }
  }

  if (!user?.id) {
    return { valid: false, error: "Missing Telegram user ID in initData" };
  }

  return {
    valid: true,
    user,
    authDate,
    startParam: params.get("start_param") || null,
  };
}
