import crypto from "node:crypto";

const SESSION_VERSION = "yuntune-session-v1";

function toBase64Url(data: Uint8Array): string {
  return Buffer.from(data)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(text: string): Uint8Array {
  const normalized = text.replaceAll("-", "+").replaceAll("_", "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return new Uint8Array(Buffer.from(normalized + pad, "base64"));
}

function deriveKey(secret: string, context: string): Buffer {
  return Buffer.from(
    crypto.hkdfSync(
      "sha256",
      Buffer.from(secret, "utf8"),
      Buffer.from(SESSION_VERSION, "utf8"),
      Buffer.from(context, "utf8"),
      32,
    ),
  );
}

export function sealJson(secret: string, value: unknown): string {
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const key = deriveKey(secret, "aes-256-gcm");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, tag, ciphertext]);
  return toBase64Url(payload);
}

export function unsealJson<T>(secret: string, token: string): T | null {
  try {
    const payload = Buffer.from(fromBase64Url(token));
    if (payload.length < 12 + 16) return null;
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const ciphertext = payload.subarray(28);
    const key = deriveKey(secret, "aes-256-gcm");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch {
    return null;
  }
}
