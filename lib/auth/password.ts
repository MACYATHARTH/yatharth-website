import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a plaintext password using crypto.scrypt with a cryptographically secure random salt.
 * Returns format: "salt:hash" (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string.");
  }
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" string.
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 * Safely returns false for malformed hashes or invalid inputs.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!password || typeof password !== "string" || !storedHash || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, keyHex] = parts;
  if (
    !salt ||
    !keyHex ||
    !/^[0-9a-fA-F]{32}$/.test(salt) ||
    !/^[0-9a-fA-F]{128}$/.test(keyHex)
  ) {
    return false;
  }

  try {
    const expectedKey = Buffer.from(keyHex, "hex");
    if (expectedKey.length === 0) {
      return false;
    }

    const derivedKey = (await scryptAsync(
      password,
      salt,
      expectedKey.length
    )) as Buffer;

    if (derivedKey.length !== expectedKey.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}
