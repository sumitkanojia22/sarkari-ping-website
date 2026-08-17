import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { refreshAccessToken, getMe, setAuthHeader } from "../services/auth.api";

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const token = await refreshAccessToken();

        if (!token) {
          return;
        }

        setAccessToken(token);
        setAuthHeader(token);

        const currentUser = await getMe();

        if (currentUser) {
          setUser(currentUser);
        } else {
          setAccessToken(null);
          setAuthHeader(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
