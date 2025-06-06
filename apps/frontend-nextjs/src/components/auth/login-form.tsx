"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = useMutation({
    mutationFn: async () => api.post("/auth/login", { email, password }),
    onSuccess: () => {
      toast.success("Login successful! Redirecting...");
      setTimeout(() => router.push("/feed"), 1000);
    },
    // onError handled globally by Axios interceptor
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate();
        }}
        className="space-y-4"
      >
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={login.isPending} className="w-full">
          {login.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="text-center mt-4 text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-blue-600 hover:underline font-medium"
        >
          Sign Up
        </Link>
      </div>
    </>
  );
}
