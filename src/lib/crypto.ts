import crypto from "crypto";

const RAW_KEY =
  process.env.ENCRYPTION_KEY || "ovabmu-patronaj-aes256-hackathon-key-32b";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(RAW_KEY).digest();
}

export function encryptField(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `aes256gcm:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptField(cipherText: string): string {
  if (!cipherText.startsWith("aes256gcm:")) {
    return cipherText;
  }
  const [, ivHex, tagHex, dataHex] = cipherText.split(":");
  if (!ivHex || !tagHex || !dataHex) return "[DECRYPTION_ERROR]";
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "[DECRYPTION_ERROR]";
  }
}

export function maskJshshir(jshshir: string): string {
  const clean = jshshir.replace(/\D/g, "");
  if (clean.length < 10) return "**************";
  return `${clean.slice(0, 7)}****${clean.slice(-3)}`;
}
