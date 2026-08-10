import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "@heroui/react";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleLogin({ email, password });

      navigate("/");
    } catch (error) {
      if (error instanceof Error) console.log("Error");
    }
  };
  return (
    <section className="w-[50%] h-full flex flex-col gap-4 justify-center items-center sec-vertical">
      <h1>Login</h1>
      <p>Get into an account to find your currated Job.</p>
      <form
        className="flex flex-col gap-4 w-96 "
        onSubmit={handleSubmit}
        action=""
      >
        <div className="flex flex-col">
          <label htmlFor="">Email-Id</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Give valid email-id"
            name="email"
            id="email"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            name="password"
            id="password"
          />
        </div>
        <div className="w-full flex justify-center items-center">
          <button
            className="btn-primary text-black w-max flex justify-center items-center gap-x-2"
            type="submit"
          >
            Login
            {loading && (
              <span className="flex justify-center items-center">
                <Spinner color="current" size="sm" />
              </span>
            )}
          </button>
        </div>
        <p className="text-center">
          Create an account <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </section>
  );
}
