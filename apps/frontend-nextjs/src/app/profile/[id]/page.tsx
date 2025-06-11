import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/ssr-auth";
import { api } from "@/lib/axios";
import { UserProfile } from "@/components/profile/user-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { cookies } from "next/headers";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { redirect: shouldRedirect } = await requireAuth();
  if (shouldRedirect) redirect("/auth/login");

  const { id: userId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Fetch user profile data on the server (SSR)
  let data = null;
  try {
    const res = await api.get(`/profile/${userId}`, {
      headers: {
        Cookie: `token=${token}`,
      },
      withCredentials: true,
    });
    data = res.data.data;
  } catch (e) {
    console.log("e", e);
    data = null;
  }

  if (!data)
    return (
      <div className="max-w-xl mx-auto mt-6">
        <div className="flex flex-col items-center text-center p-6 space-y-4">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );

  // Hydrate user for client (edit mode needs client-side state)
  return <UserProfile user={data} />;
}
