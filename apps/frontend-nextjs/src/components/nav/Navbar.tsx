"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";
import Image from "next/image";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="w-full bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
      {/* Left: Logo and App Name */}
      <div className="flex items-center gap-6">
        <Link href="/feed" className="flex items-center gap-2 select-none">
          <span className="inline-block w-8 h-8">
            <Image src="/logo.svg" alt="SocialHub Logo" className="w-8 h-8" width={24} height={24}/>
          </span>
          <span className="font-bold text-xl tracking-tight text-blue-600">SocialHub</span>
        </Link>
        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-4 ml-6">
          <Link
            href="/feed"
            className={`font-medium text-base px-2 py-1 rounded hover:bg-blue-50 ${pathname === "/feed" ? "text-blue-600" : "text-gray-900"}`}
          >
            Feed
          </Link>
          <Link
            href="/chat"
            className={`font-medium text-base px-2 py-1 rounded hover:bg-blue-50 ${pathname.startsWith("/chat") ? "text-blue-600" : "text-gray-900"}`}
          >
            Chat
          </Link>
          <Link
            href="/explore"
            className={`font-medium text-base px-2 py-1 rounded hover:bg-blue-50 ${pathname === "/explore" ? "text-blue-600" : "text-gray-900"}`}
          >
            Discover
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </nav>
  );
}
