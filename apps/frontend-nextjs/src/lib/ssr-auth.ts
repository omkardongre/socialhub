import { cookies } from "next/headers";
import { api } from "./axios";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { user: null, redirect: true };
  }

  try {
    const res = await api.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      {
        headers: { Cookie: `token=${token}` },
        withCredentials: true,
      }
    );

    if (!res.data.success) {
      return { user: null, redirect: true };
    }
    const user = res.data.data.user;
    return { user, redirect: false };
  } catch {
    return { user: null, redirect: true };
  }
}
