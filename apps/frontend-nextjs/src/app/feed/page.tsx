import { NewPostForm } from "@/components/feed/new-post-form";
import { FeedList } from "@/components/feed/feed-list";

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <NewPostForm />
      <FeedList />
    </div>
  );
}
