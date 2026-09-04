"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyFirebaseToken } from "@/lib/firebase-admin";

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 5,
};

export async function syncUser(token: string) {
  if (!token) throw new Error("A Firebase ID token is required.");

  const decodedToken = await verifyFirebaseToken(token);
  const email = decodedToken.email;
  if (!email) throw new Error("Your Firebase account does not have an email address.");

  const user = await prisma.user.upsert({
    where: { id: decodedToken.uid },
    update: { email, name: decodedToken.name ?? null },
    create: { id: decodedToken.uid, email, name: decodedToken.name ?? null },
    select: { id: true, email: true, name: true, currency: true },
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, sessionCookieOptions);
  return user;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}