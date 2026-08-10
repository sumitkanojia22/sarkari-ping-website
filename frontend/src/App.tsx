import { RouterProvider } from "react-router";
import { Toast } from "@heroui/react";
import { router } from "./app.routes.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";

export default function App() {
  return (
    <AuthProvider>
      <Toast.Provider placement="bottom" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
