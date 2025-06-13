"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import ProfileDropdown from "./ProfileDropdown";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
const NotificationBell = dynamic(() => import("./NotificationBell"), {
  loading: () => <Skeleton className="h-8 w-8 rounded-full" />,
  ssr: false,
});
import { DarkModeToggle } from "./DarkModeToggle";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <Card
      className="w-full rounded-none border-b shadow-sm px-0 py-0 bg-background text-foreground"
    >
      <nav className="w-full px-4 py-2 flex items-center justify-between">
        {/* Left: Logo and App Name */}
        <div className="flex items-center gap-6">
          <Link href="/feed" className="flex items-center gap-2 select-none">
            <span className="inline-block w-8 h-8">
              <Image
                src="/logo.svg"
                alt="SocialHub Logo"
                className="w-8 h-8"
                width={24}
                height={24}
              />
            </span>
            <span className="font-bold text-xl tracking-tight text-foreground">
              SocialHub
            </span>
          </Link>
          {/* Center: Nav links */}
          <NavigationMenu className="hidden md:flex items-center gap-4 ml-6 bg-transparent">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild active={pathname === "/feed"}>
                  <Link href="/feed">Feed</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  active={pathname.startsWith("/chat")}
                >
                  <Link href="/chat">Chat</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild active={pathname === "/explore"}>
                  <Link href="/explore">Discover</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </nav>
    </Card>
  );
}
