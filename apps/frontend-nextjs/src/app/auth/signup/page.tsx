import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4 font-semibold text-center">Sign Up</h1>
      <SignupForm />
    </div>
  );
}
