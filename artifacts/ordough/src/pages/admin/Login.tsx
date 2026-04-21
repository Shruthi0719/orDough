import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminAuthQueryKey, loginAdmin } from "@/lib/auth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(username, password);
      await queryClient.invalidateQueries({ queryKey: adminAuthQueryKey });
      setLocation("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#D2E2EC] flex items-center justify-center px-6 text-[#3A2119]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#EBCDB7] border border-[#957662]/30 shadow-2xl p-8"
      >
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3A2119] text-[#EBCDB7]">
            <LockKeyhole size={22} />
          </div>
          <h1 className="font-serif text-3xl">Administrator Login</h1>
          <p className="mt-2 text-sm text-[#957662]">Sign in to manage orDough orders and menu.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="bg-[#D2E2EC]/70 border-[#957662]/40"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="bg-[#D2E2EC]/70 border-[#957662]/40"
              required
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-[#3A2119] text-[#EBCDB7] hover:bg-[#957662]"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </main>
  );
}
