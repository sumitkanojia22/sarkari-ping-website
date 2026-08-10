import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedProps {
  children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const { loading, user } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }

  return children;
}
