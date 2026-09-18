import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "yatharth_admin_session";
const SESSION_DURATION_SECONDS = 86400; // 24 hours
const MIN_SECRET_LENGTH = 32;

export interface AdminSession {
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Retrieves the session secret securely.
 * Throws a safe error if the secret is missing or insufficient.
 */
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length < MIN_SECRET_LENGTH) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. It must be at least 32 characters long."
    );
  }
  return secret.trim();
}

/**
 * Computes an HMAC-SHA256 signature for a payload string.
 */
function signPayload(payloadString: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
}

/**
 * Constant-time signature verification.
 */
function verifySignature(payloadString: string, signature: string, secret: string): boolean {
  if (
    typeof signature !== "string" ||
    signature.length !== 64 ||
    !/^[0-9a-fA-F]{64}$/.test(signature)
  ) {
    return false;
  }

  try {
    const expectedSig = signPayload(payloadString, secret);
    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");

    if (sigBuf.length !== expectedBuf.length || sigBuf.length === 0) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Creates and sets a signed admin session cookie.
 */
export async function createAdminSession(username: string): Promise<AdminSession> {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + SESSION_DURATION_SECONDS;

  const session: AdminSession = {
    sub: username,
    iat: now,
    exp,
  };

  const payloadString = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signPayload(payloadString, secret);
  const token = `${payloadString}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return session;
}

/**
 * Validates and retrieves the current admin session from the request cookie.
 * Returns null if unauthenticated, tampered, or expired.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const secret = getSessionSecret();
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!cookie || !cookie.value) {
      return null;
    }

    const parts = cookie.value.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [payloadB64, signature] = parts;
    if (!payloadB64 || !signature) {
      return null;
    }

    const isValid = verifySignature(payloadB64, signature, secret);
    if (!isValid) {
      return null;
    }

    const jsonString = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(jsonString) as Partial<AdminSession>;

    if (
      !payload ||
      typeof payload.sub !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    return {
      sub: payload.sub,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Clears the admin session cookie.
 */
export async function clearAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    cookieStore.set(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch {
    // Ignore error if invoked where cookies cannot be mutated
  }
}
