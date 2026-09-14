"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createFirebaseSessionCookie, verifyFirebaseToken } from "@/lib/firebase-admin";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
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

  // Store a real session cookie rather than the raw ID token: the token expires
  // after an hour, so a 5-day cookie holding one would keep being sent long after
  // the server could still verify it.
  const sessionCookie = await createFirebaseSessionCookie(token, SESSION_MAX_AGE_SECONDS * 1000);

  const cookieStore = await cookies();
  cookieStore.set("session", sessionCookie, sessionCookieOptions);
  return user;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
