import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

export async function requireCurrentUser() {
  const session = (await cookies()).get("session")?.value;
  if (!session) throw new Error("You must be signed in.");

  const decodedToken = await verifyFirebaseToken(session);
  const user = await prisma.user.findUnique({ where: { id: decodedToken.uid } });
  if (!user) throw new Error("Your Coinly profile was not found.");
  return user;
}