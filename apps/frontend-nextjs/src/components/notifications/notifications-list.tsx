"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import type { Notification } from "@/types/notification";

export function NotificationsList() {
  const queryClient = useQueryClient();
  const [filterUnread, setFilterUnread] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", { unread: filterUnread }],
    queryFn: async () => {
      const res = await api.get("/notifications", {
        params: { isRead: filterUnread ? false : undefined },
      });
      return res.data.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      api.put(`/notifications/${id}/read`, { isRead: true }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>

      <div className="flex items-center gap-2">
        <Checkbox
          id="unread-filter"
          checked={filterUnread}
          onCheckedChange={(val: boolean) => setFilterUnread(!!val)}
        />
        <Label htmlFor="unread-filter">Show only unread</Label>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((_, idx) => (
            <Card key={idx} className="p-4 flex flex-col gap-1 bg-slate-100">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/3 mb-1" />
              <Skeleton className="h-3 w-1/4" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications?.map((notification: Notification) => (
            <Card
              key={notification.id}
              className={`p-4 flex flex-col gap-1 ${
                notification.isRead ? "bg-white" : "bg-slate-100"
              }`}
            >
              <p className="font-medium">{notification.content}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
              {!notification.isRead && (
                <Button
                  size="sm"
                  className="mt-2 w-fit"
                  onClick={() => handleMarkRead(notification.id)}
                >
                  Mark as read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
