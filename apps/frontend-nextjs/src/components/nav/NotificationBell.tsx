"use client";
import React from "react";
import { Bell, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";

interface Notification {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  entityType: string;
  entityId: string;
  senderId?: string;
}

export default function NotificationBell() {
  const { user } = useAuth();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const res = await api.get(
        `/notifications?receiverId=${user.userId}&limit=10`
      );

      return res.data.data || [];
    },
    enabled: !!user?.userId,
    refetchInterval: 30000, // Poll every 30s for new notifications
  });

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Show notifications"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-700 dark:bg-red-400 text-white px-1.5 py-0.5 min-w-[18px] text-xs border border-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-xs p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-2 font-semibold">
          Notifications
          <Link
            href="/notifications"
            className="text-xs text-blue-600 hover:underline"
          >
            See all
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {unreadNotifications.length === 0 && !isLoading && (
          <DropdownMenuItem disabled className="text-center text-gray-500 py-4">
            No unread notifications
          </DropdownMenuItem>
        )}
        {isLoading && (
          <DropdownMenuItem disabled className="text-center text-gray-400 py-4">
            Loading...
          </DropdownMenuItem>
        )}
        {unreadNotifications.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex items-center gap-2 bg-blue-50`}
          >
            <XCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-800 flex-1">{n.content}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
