import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { logoutAll } from "../services/auth.api";

export default function AppNav() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await handleLogout();
    navigate("/login");
  };

  const logoutEverywhere = async () => {
    if (!window.confirm("Sign out from all devices?")) return;
    await logoutAll();
    await logout();
    navigate("/login");
  };

  return (
    <header className="app-nav">
      <Link className="brand" to="/">
        SarkariPing
      </Link>

      <nav>
        <NavLink className="nav-link" to="/" end>
          Jobs
        </NavLink>
        <NavLink className="nav-link" to="/recommended">
          Recommended
        </NavLink>
        <NavLink className="nav-link" to="/saved">
          Saved jobs
        </NavLink>
        <NavLink className="nav-link" to="/dashboard">
          Dashboard
        </NavLink>
        <NavLink className="nav-link" to="/settings/preferences">
          Preferences
        </NavLink>
      </nav>

      <div className="nav-account">
        <span className="user-chip">{user?.name}</span>
        <button className="text-button" onClick={logout}>
          Log out
        </button>
        <button className="text-button" onClick={logoutEverywhere}>
          All devices
        </button>
      </div>
    </header>
  );
}
