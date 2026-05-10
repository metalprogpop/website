import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LogoutPage() {
  const { logout, isAuthenticated, isLoading } = useAuth();
  const startedRef = useRef(false);

  useEffect(() => {
    if (isLoading || startedRef.current) {
      return;
    }
    startedRef.current = true;
    void logout();
  }, [isLoading, logout]);

  if (!isLoading && !isAuthenticated && startedRef.current) {
    return <Navigate to="/" replace />;
  }

  return null;
}
