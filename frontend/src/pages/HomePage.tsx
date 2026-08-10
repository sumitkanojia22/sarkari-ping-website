import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.name.toUpperCase()}</h1>
    </div>
  );
}
