"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { Avatar } from "../ui/avatar";
import Image from "next/image";
import { api } from "@/lib/axios";

export default function ProfileDropdown() {
  const { user, refresh } = useAuth();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    await refresh();
    window.location.href = "/auth/login";
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
      >
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
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
          <Link
            href={`/profile/${user.userId}`}
            className="block px-4 py-2 text-gray-900 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
