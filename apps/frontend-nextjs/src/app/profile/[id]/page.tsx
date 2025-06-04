"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/axios";
import { UserProfile } from "@/components/profile/user-profile";

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => (await api.get(`profile/${userId}`)).data.data,
    enabled: !!userId,
  });

  if (isLoading || !data) return <p>Loading profile...</p>;

  return <UserProfile user={data} />;
}
