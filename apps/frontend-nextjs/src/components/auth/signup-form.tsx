"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { AxiosError } from "axios";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const signup = useMutation({
    mutationFn: async () => {
      setError("");
      setSuccess("");
      return api.post("/auth/signup", { email, password });
    },
    onSuccess: () => {
      setSuccess("Signup successful! Please check your email or login.");
    },
    onError: (err) => {
      if ((err as AxiosError)?.response) {
        setError(
          ((err as AxiosError).response?.data as { message?: string })?.message ||
            "Signup failed"
        );
      } else {
        setError((err as Error).message || "Signup failed");
      }
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signup.mutate();
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
        <Button type="submit" disabled={signup.isPending} className="w-full">
          {signup.isPending ? "Signing up..." : "Sign Up"}
        </Button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
      </form>
      <div className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Login</Link>
      </div>
    </>
  );
}
