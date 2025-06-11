"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="w-full bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/feed"
          className={`font-semibold text-lg ${
            pathname === "/feed" ? "text-blue-600" : "text-gray-900"
          }`}
        >
          Feed
        </Link>
        <Link
          href="/chat"
          className={`font-semibold text-lg ${
            pathname.startsWith("/chat") ? "text-blue-600" : "text-gray-900"
          }`}
        >
          Chat
        </Link>

      </div>
      <div className="flex items-center gap-3">
        <ProfileDropdown />
      </div>
    </nav>
  );
}
