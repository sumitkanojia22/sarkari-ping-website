import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "@heroui/react";

export default function SignUp() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { loading, handleSignUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSignUp({ name, email, password });
    navigate("/");
  };
  return (
    <section className="w-[65%] h-full flex flex-col gap-4 justify-center items-center">
      <h1>Sign Up</h1>
      <p>Create an account to find your currated Job.</p>
      <form
        className="flex flex-col gap-4 w-96 "
        onSubmit={handleSubmit}
        action=""
      >
        <div className="flex flex-col ">
          <label htmlFor="username">Username</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Write your name"
            name="username"
            id="username"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">Email-Id</label>
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
            disabled={loading}
          >
            Sign Up
            {loading && (
              <span className="flex justify-center items-center">
                <Spinner color="current" size="sm" />
              </span>
            )}
          </button>
        </div>
        <p className="text-center">
          Already have an account <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}
