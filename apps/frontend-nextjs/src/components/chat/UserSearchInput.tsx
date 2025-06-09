import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User } from "@/types/profile";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api } from "@/lib/axios";

interface UserSearchInputProps {
  selected: User[];
  setSelected: (users: User[]) => void;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({ selected, setSelected }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 400);

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/profile/search?query=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        const data = res.data;
        setResults(data.data || []);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const addUser = (user: User) => {
    if (!selected.find((u) => u.id === user.id)) {
      setSelected([...selected, user]);
    }
    setQuery("");
    setResults([]);
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
      {loading && <div className="text-xs text-gray-500">Searching...</div>}
      {!loading && results.length > 0 && (
        <ul className="border rounded bg-white max-h-40 overflow-y-auto mb-2">
          {results.map((user) => (
            <li
              key={user.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
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
              <span>
                {user.name} <span className="text-xs text-gray-400 ml-2">({user.userId})</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {selected.map((user) => (
          <Badge key={user.id} variant="secondary" className="flex items-center">
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
