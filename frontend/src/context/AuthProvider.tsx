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
  // FIX: starts true, not false. Protected.tsx gates its redirect on `loading`
  // — if this started false, Protected would see user:null for one frame
  // before bootstrapSession resolves and bounce a valid session to /login.
  const [loading, setLoading] = useState<boolean>(true);

  // FIX: new — runs once on mount. Exchanges the refreshToken cookie (the
  // only thing that survives a page refresh) for an accessToken, then uses
  // that to fetch the current user via getMe. This is what makes a logged-in
  // person stay logged in across refreshes/new tabs, instead of accessToken
  // and user resetting to null every time AuthProvider remounts state.
  useEffect(() => {
    const bootstrapSession = async () => {
      // FIX: wrapped in try/finally. Even with refreshAccessToken/getMe
      // fixed to return null instead of throwing, this guarantees
      // setLoading(false) always runs — so a future change to either
      // function (or an unexpected error) can never leave `loading` stuck
      // true and Protected stuck on "Loading..." forever.
      try {
        const token = await refreshAccessToken();

        if (!token) {
          // No valid session (first visit, or refresh token expired/revoked).
          // This is a normal state, not an error.
          return;
        }

        setAccessToken(token);
        setAuthHeader(token);

        const currentUser = await getMe();

        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token existed but getMe failed (e.g. user deleted) — clear it out
          // rather than leaving a stale accessToken with no matching user.
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
