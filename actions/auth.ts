"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export type SyncUserResult =
  | { ok: true; user: { id: string; email: string; name: string | null; currency: string } }
  | { ok: false; error: string };

/**
 * Returns failures instead of throwing: production replaces a thrown server-action
 * error with an opaque digest (React error #441), which leaves the sign-in form with
 * nothing to show. The full error is logged server-side for the runtime logs.
 */
export async function syncUser(token: string): Promise<SyncUserResult> {
  try {
    if (!token) throw new Error("A Firebase ID token is required.");

    // Loaded lazily so a failure to load firebase-admin (missing credentials, a
    // runtime that cannot import it) is caught here rather than at module load.
    const { createFirebaseSessionCookie, verifyFirebaseToken } = await import("@/lib/firebase-admin");

    const decodedToken = await verifyFirebaseToken(token);
    const email = decodedToken.email;
    if (!email) throw new Error("Your Firebase account does not have an email address.");

    const user = await prisma.user.upsert({
      where: { id: decodedToken.uid },
      update: { email, name: decodedToken.name ?? null },
      create: { id: decodedToken.uid, email, name: decodedToken.name ?? null },
      select: { id: true, email: true, name: true, currency: true },
    });

    // Store a real session cookie rather than the raw ID token: the token expires
    // after an hour, so a 5-day cookie holding one would keep being sent long after
    // the server could still verify it.
    const sessionCookie = await createFirebaseSessionCookie(token, SESSION_MAX_AGE_SECONDS * 1000);

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, sessionCookieOptions);
    return { ok: true, user };
  } catch (error) {
    console.error("[syncUser] sign-in failed:", error);
    // Only the error's class name is surfaced: enough to tell "database" from
    // "firebase" from "config" without leaking connection strings or key material.
    const kind = error instanceof Error ? error.name : "UnknownError";
    return { ok: false, error: `We couldn't finish signing you in (${kind}). Please try again.` };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
