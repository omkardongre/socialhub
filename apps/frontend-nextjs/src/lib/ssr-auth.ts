import { cookies } from "next/headers";

/**
 * SSR Auth check helper for Next.js App Router.
 * Throws a redirect to /auth/login if not authenticated.
 * Returns user info if authenticated.
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    // No token at all, redirect immediately
    return { user: null, redirect: true };
  }

  // Call backend /auth/me to validate token and get user info
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
      headers: { Cookie: `token=${token}` },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      return { user: null, redirect: true };
    }
    const user = await res.json();
    return { user, redirect: false };
  } catch {
    return { user: null, redirect: true };
  }
}
