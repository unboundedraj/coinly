import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyFirebaseSession } from "@/lib/firebase-admin";

/**
 * Resolves the signed-in user, or null when there is no usable session.
 * Only session-cookie failures are treated as "signed out" — database errors
 * still propagate so an outage is never mistaken for a logged-out user.
 */
export async function getCurrentUser() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  let uid: string;
  try {
    uid = (await verifyFirebaseSession(session)).uid;
  } catch {
    // Expired, revoked, or a legacy raw-ID-token cookie issued before session cookies.
    return null;
  }

  return prisma.user.findUnique({ where: { id: uid } });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return user;
}
