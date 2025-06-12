"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { User } from "@/types/profile";
import { useUserSearch } from "@/hooks/useUserSearch";

interface UserSearchInputForChatProps {
  selected: User[];
  setSelected: (users: User[]) => void;
}

export const UserSearchInputForChat: React.FC<UserSearchInputForChatProps> = ({
  selected,
  setSelected,
}) => {
  const [query, setQuery] = useState("");
  const { results, loading } = useUserSearch(query);

  const addUser = (user: User) => {
    if (!selected.find((u) => u.id === user.id)) {
      setSelected([...selected, user]);
    }
    setQuery("");
  };

  const removeUser = (userId: string) => {
    setSelected(selected.filter((u) => u.id !== userId));
  };

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
            <ScrollArea className="max-h-40">
              <ul>
                {results.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center"
                    onClick={() => addUser(user)}
                  >
                    {user.avatarUrl && (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span>{user.name}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {selected.map((user) => (
          <Badge
            key={user.id}
            variant="secondary"
            className="flex items-center"
          >
            {user.name}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="ml-1 h-4 w-4 p-0"
              onClick={() => removeUser(user.id)}
            >
              &times;
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
