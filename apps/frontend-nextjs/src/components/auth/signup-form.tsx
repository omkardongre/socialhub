"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = useMutation({
    mutationFn: async () => api.post("/auth/signup", { email, password }),
    onSuccess: () => {
      toast.success("Signup successful! Please check your email or login.");
    },
    onError: (error: AxiosError) => {
      let errorMessage = "An unexpected error occurred.";
      if (error.response && (error.response.data as ApiErrorResponse).message) {
        errorMessage = (error.response.data as ApiErrorResponse).message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(`Signup failed: ${errorMessage}`);
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
      </form>
      <div className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Login
        </Link>
      </div>
    </>
  );
}
