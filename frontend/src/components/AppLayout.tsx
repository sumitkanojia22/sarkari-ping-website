import { Outlet } from "react-router";
import AppNav from "./AppNav";

export default function AppLayout() {
  return (
    <>
      <AppNav />
      <Outlet />
    </>
  );
}
