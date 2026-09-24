import { useContext } from "react";
import { signUp, login, logout, setAuthHeader } from "../services/auth.api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "@heroui/react";
import axios from "axios";

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  const { user, setUser, accessToken, setAccessToken, loading, setLoading } =
    context;

  //Handle SignUp
  const handleSignUp = async ({ name, email, password }: SignUpData) => {
    try {
      setLoading(true);
      const data = await signUp({ name, email, password });
      setAccessToken(data.accessToken);

      setAuthHeader(data.accessToken);
      setUser(data.newUser);

      toast.success("Account created", {
        description: `Welcome to Sarkari Ping ${data.newUser.name} `,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.danger("Signup Failed", {
          description: error.response?.data?.message ?? error.message,
        });
      } else if (error instanceof Error) {
        toast.danger("Signup Failed", {
          description: error.message,
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //Handle Login
  const handleLogin = async ({ email, password }: LoginData) => {
    try {
      setLoading(true);
      const data = await login({ email, password });

      setAccessToken(data.accessToken);
      setAuthHeader(data.accessToken); // FIX: see handleSignUp
      setUser(data.loginUser);

      toast.success("Logged In", {
        description: `Welcome to Sarkari Ping ${data.loginUser.name} `,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.danger("Login Failed", {
          description: error.response?.data?.message ?? error.message,
        });
      } else if (error instanceof Error) {
        toast.danger("Login Failed", {
          description: error.message,
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //Handle Logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setAccessToken(null);
      setAuthHeader(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    accessToken,
    handleLogin,
    handleLogout,
    handleSignUp,
  };
};
