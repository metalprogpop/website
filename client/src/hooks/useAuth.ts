import { useQuery, useQueryClient } from "@tanstack/react-query";
import { meResponseSchema, type MeResponse } from "shared";
import { API_URL } from "../lib/api";

const fetchMe = async (): Promise<MeResponse | null> => {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch auth status");
  }

  return meResponseSchema.parse(await res.json());
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
    isStaff: user?.role === "staff",
    logout,
  };
};
