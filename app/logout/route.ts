import { NextResponse, type NextRequest } from "next/server";

/**
 * Clears the session cookie and sends the user back to sign in.
 *
 * This lives in a Route Handler because Server Components cannot write cookies —
 * and without actually clearing it, the middleware would bounce a stale-cookie
 * user from /login straight back to /dashboard in an endless redirect loop.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?expired=1", request.url));
  response.cookies.set("session", "", { path: "/", maxAge: 0 });
  return response;
}
