"use client";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useUserSearch } from "@/hooks/useUserSearch";

export const UserSearchInputForDiscovery: React.FC = () => {
  const [query, setQuery] = useState("");
  const { results, loading } = useUserSearch(query);

  return (
    <div>
      <Input
        placeholder="Search username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="mb-2"
      />
      {loading && (
        <div className="mb-2">
          <Skeleton className="h-8 w-full mb-1" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      )}
      {!loading && results.length > 0 && (
        <Card className="mb-2">
          <CardContent className="p-0">
            <ScrollArea className="max-h-60" data-testid="user-search-results">
              <ul className="divide-y divide-gray-200">
                {results.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/profile/${user.userId}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent transition-colors"
                    >
                      {user.avatarUrl && (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full border"
                        />
                      )}
                      <span className="font-medium">{user.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
