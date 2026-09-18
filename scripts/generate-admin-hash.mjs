import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function generateSessionSecret() {
  return crypto.randomBytes(32).toString("hex");
}

import { fileURLToPath } from "url";

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const password = process.argv[2] || "Yatharth2026Admin!";
  const isDefault = !process.argv[2];

  const hash = await hashPassword(password);
  const secret = generateSessionSecret();
  console.log("\n================ ADMIN AUTH CONFIGURATION ================");
  console.log("ADMIN_USERNAME=admin");
  console.log("ADMIN_PASSWORD_HASH=" + hash);
  console.log("ADMIN_SESSION_SECRET=" + secret);
  console.log("==========================================================\n");
}