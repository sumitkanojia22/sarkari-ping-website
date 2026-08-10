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

// FIX: new — used on app load to silently exchange the refreshToken cookie
// (httpOnly, survives page refresh) for a fresh accessToken (lives only in
// memory, wiped on refresh). No email/password involved.
//
// IMPORTANT: this must return null on failure, not throw. AuthProvider's
// bootstrapSession does `const token = await refreshAccessToken()` with no
// try/catch — a throw here on a fresh visit (no cookie yet -> 401, totally
// expected) skips straight past setLoading(false), leaving `loading` stuck
// true forever and Protected showing "Loading..." indefinitely. This was
// the actual cause of the reload-stuck-on-loading bug.
export const refreshAccessToken = async () => {
  try {
    const response = await api.get("/auth/refresh-token");
    return response.data.newAccessToken as string;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status !== 401) {
      // 401 = no session yet, expected and silent (first visit, expired
      // refresh token). Anything else is unexpected — log it so a broken
      // network/CORS/server config doesn't silently strand the user.
      console.error(
        "refreshAccessToken failed unexpectedly:",
        error.response?.data?.message ?? error.message,
      );
    } else if (!axios.isAxiosError(error)) {
      console.error("refreshAccessToken failed unexpectedly:", error);
    }
    return null;
  }
};

// FIX: new — fetches the current user using whatever token setAuthHeader
// last set. Requires refreshAccessToken (+ setAuthHeader) to have run first,
// since the backend's `protect` middleware needs a valid Authorization header.
//
// IMPORTANT: same contract as refreshAccessToken above — must return null,
// not throw, or bootstrapSession's setLoading(false) gets skipped and
// Protected is stuck showing "Loading..." forever.
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
