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
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1/users",
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
      const response = await api.post("/auth/refresh-token", undefined, {
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

export interface Vacancy {
  postName: string;
  postCount: number;
}

export interface Job {
  _id: string;
  title: string;
  sourceUrl: string;
  source: string;
  category: string;
  description?: string;
  eligibility?: string;
  applicationStartDate?: string;
  applicationLastDate?: string;
  applicationFee?: string;
  ageLimit?: string;
  selectionProcess?: string[];
  organization?: string;
  education?: string;
  examDate?: string;
  totalVacancies?: number;
  vacancies?: Vacancy[];
  importantDates?: { label: string; date: string }[];
  importantLinks?: { label: string; type: string; url: string }[];
  applicationUrl?: string;
  status?: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface JobQuery { page?: number; limit?: number; search?: string; category?: string; organization?: string; state?: string; qualification?: string; jobType?: string; open?: boolean; sort?: "deadline" | "vacancies" | "updated"; }
export interface JobResponse { data: Job[]; pagination: { page: number; limit: number; total: number; pages: number }; }
export const getLatestJobs = async (query: JobQuery = {}): Promise<JobResponse> => { const response = await api.get("/jobs", { params: query }); return { data: response.data.data, pagination: response.data.pagination }; };

export const getJobById = async (jobId: string): Promise<Job> => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data.data;
};
export interface Preferences { categories: string[]; organizations: string[]; departments: string[]; states: string[]; preferredLocations: string[]; jobTypes: string[]; qualifications: string[]; degrees: string[]; branches: string[]; governmentTypes: string[]; minSalary?: number; onlyActiveJobs: boolean; closingSoon: boolean; highVacancy: boolean; minimumMatchThreshold: number; onboardingComplete: boolean; }
export const getPreferences = async (): Promise<Preferences> => (await api.get("/preferences")).data.data;
export const savePreferences = async (data: Partial<Preferences>): Promise<Preferences> => (await api.patch("/preferences", data)).data.data;
export const getRecommendations = async (): Promise<(Job & { match: { score: number; matched: string[]; missing: string[] } })[]> => (await api.get("/recommendations")).data.data;
export const recordEvent = async (eventType: string, jobId?: string) => { await api.post("/events", { eventType, jobId }); };
export const logoutAll = async () => api.post("/auth/logout-all");
export const getDashboard = async () => (await api.get("/dashboard")).data.data as { totalJobs: number; viewed: number; applyClicks: number; saved: number; threshold: number; activity: { date: string; count: number }[] };
export const toggleSavedJob = async (jobId: string): Promise<{ saved: boolean }> => (await api.post(`/jobs/${jobId}/save`)).data.data;
export const getSavedJobs = async (): Promise<Job[]> => (await api.get("/me/jobs")).data.data;
