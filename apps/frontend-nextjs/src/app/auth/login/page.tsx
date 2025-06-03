import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4 font-semibold text-center">Login</h1>
      <LoginForm />
    </div>
  );
}
