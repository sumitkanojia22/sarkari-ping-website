import axios from "axios";

interface SignUpPayloadType {
  name: string;
  email: string;
  password: string;
}

interface LoginPayloadType {
  email: string;
  password: string;
}

//Creating axios Instance
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1/users",
  withCredentials: true,
});

export const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

//SignUp api service
export const signUp = async ({ name, email, password }: SignUpPayloadType) => {
  try {
    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? "Something went wrong", {
        cause: error,
      });
    }

    throw error;
  }
};

//Login api service
export const login = async ({ email, password }: LoginPayloadType) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? "Something went wrong", {
        cause: error,
      });
    }

    throw error;
  }
};

//Logout api service
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? "Something went wrong", {
        cause: error,
      });
    }

    throw error;
  }
};

let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = async () => {
  // Someone is already refreshing.
  // Wait for that same request.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await api.get("/auth/refresh-token", {
        withCredentials: true,
      });

      return response.data.newAccessToken ?? null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const getMe = async () => {
  try {
    const response = await api.get("/auth/get-me");
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status !== 401) {
      console.error(
        "getMe failed unexpectedly:",
        error.response?.data?.message ?? error.message,
      );
    } else if (!axios.isAxiosError(error)) {
      console.error("getMe failed unexpectedly:", error);
    }
    return null;
  }
};
