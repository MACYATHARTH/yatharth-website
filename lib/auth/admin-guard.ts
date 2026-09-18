import { getAdminSession } from "./session";

/**
 * Administrative Authorization Guard
 *
 * Enforces server-side session authentication for all administrative mutations.
 * Development and production both strictly require a valid authenticated session.
 * No bypasses or unauthenticated exceptions are permitted.
 */
export async function assertAdminAuthorized(): Promise<void> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized: A valid administrative session is required.");
  }
}

