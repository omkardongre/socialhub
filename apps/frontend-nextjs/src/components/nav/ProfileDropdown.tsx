"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { Avatar } from "../ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/axios";

export default function ProfileDropdown() {
  const { user, refresh } = useAuth();

  // No longer need custom open/close logic; handled by DropdownMenu

  const handleLogout = async () => {
    await api.post("/auth/logout");
    await refresh();
    window.location.href = "/auth/login";
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2" aria-label="Open profile menu">
          <Avatar>
            <Image
              src={user.avatarUrl || "/default-avatar.png"}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full w-8 h-8"
              unoptimized
            />
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">
            {user.name || user.userId}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/profile/${user.userId}`} className="w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
