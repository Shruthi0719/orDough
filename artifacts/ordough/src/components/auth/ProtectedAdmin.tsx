import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { adminAuthQueryKey, getAdminSession } from "@/lib/auth";

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError } = useQuery({
    queryKey: adminAuthQueryKey,
    queryFn: getAdminSession,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      setLocation("/admin/login");
    }
  }, [isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EBCDB7] flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D2E2EC] border-t-[#3A2119]" />
      </div>
    );
  }

  if (!data?.authenticated) {
    return null;
  }

  return <>{children}</>;
}
