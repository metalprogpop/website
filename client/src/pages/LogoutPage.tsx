import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LogoutPage() {
  const { logout, isLoading } = useAuth();
  const startedRef = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isLoading || startedRef.current) {
      return;
    }
    startedRef.current = true;
    void logout().finally(() => {
      setDone(true);
    });
  }, [isLoading, logout]);

  if (done) {
    return <Navigate to="/" replace />;
  }

  return null;
}
