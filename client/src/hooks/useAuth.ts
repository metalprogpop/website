import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "shared";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

const fetchMe = async (): Promise<AuthUser | null> => {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch auth status");
  }

  return (await res.json()) as AuthUser;
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data ?? null;

  const logout = async () => {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    queryClient.setQueryData(["auth", "me"], null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout,
  };
};
