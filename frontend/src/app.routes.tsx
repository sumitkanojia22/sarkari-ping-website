import { createBrowserRouter } from "react-router";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import JobDetailsPage from "./pages/JobDetailsPage";
import Protected from "./components/Protected";
import PreferencesPage from "./pages/PreferencesPage";
import RecommendedPage from "./pages/RecommendedPage";
import DashboardPage from "./pages/DashboardPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import AppLayout from "./components/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/landing",
    element: <div>base</div>,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/jobs/:jobId",
        element: <JobDetailsPage />,
      },
      {
        path: "/settings/preferences",
        element: <PreferencesPage />,
      },
      {
        path: "/recommended",
        element: <RecommendedPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/saved",
        element: <SavedJobsPage />,
      },
    ],
  },
]);
