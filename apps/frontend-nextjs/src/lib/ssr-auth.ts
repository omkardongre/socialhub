import { cookies } from "next/headers";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { user: null, redirect: true };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
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
