import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/ssr-auth";
import { NewPostForm } from "@/components/feed/new-post-form";
import { FeedList } from "@/components/feed/feed-list";

export default async function FeedPage() {
  const { redirect: shouldRedirect } = await requireAuth();
  if (shouldRedirect) redirect("/auth/login");

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <NewPostForm />
      <FeedList />
    </div>
  );
}
