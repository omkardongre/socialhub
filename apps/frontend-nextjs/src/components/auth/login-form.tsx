"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { AxiosError } from "axios";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const login = useMutation({
    mutationFn: async () => {
      setError("");
      setSuccess("");
      return api.post("/auth/login", { email, password });
    },
    onSuccess: () => {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push("/feed"), 1000);
    },
    onError: (err) => {
      if ((err as AxiosError)?.response) {
        setError(
          ((err as AxiosError).response?.data as { message?: string })
            ?.message || "Login failed"
        );
      } else {
        setError((err as Error).message || "Login failed");
      }
    },
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
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
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
