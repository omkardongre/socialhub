import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/ssr-auth";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const { redirect: shouldRedirect } = await requireAuth();
  if (shouldRedirect) redirect("/auth/login");

  return <NotificationsList />;
}
