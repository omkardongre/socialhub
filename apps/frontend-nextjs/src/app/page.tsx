import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/ssr-auth";

export default async function Home() {
  const { redirect: shouldRedirect } = await requireAuth();
  if (shouldRedirect) redirect("/auth/login");
  redirect("/feed");
}
