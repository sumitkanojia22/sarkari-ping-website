import { createBrowserRouter } from "react-router";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Protected from "./components/Protected";

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
    path: "/",
    element: (
      <Protected>
        <HomePage />
      </Protected>
    ),
  },
]);
