import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../../SocketContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL: string =
  process.env.REACT_APP_ENV === "production" ||
  process.env.REACT_APP_ENV === undefined
    ? "https://quick21.onrender.com"
    : "http://localhost:4000";

const LandingPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { socket, connect } = useSocket();
  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement>(null);

  // useEffect to read stored token and connect to socket
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && !socket) {
      connect(token);

      // Redirect to lobby if already authenticated
      navigate("/lobby");
    }
  }, [socket, connect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(formRef.current!);
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;

    const endpoint = isSignup ? "/register" : "/login";

    try {
      console.log("Sending request to", `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      setSuccess(data.message);
      if (!isSignup && data.token) {
        localStorage.setItem("authToken", data.token);
        connect(data.token);
        navigate("/lobby");
      } else if (isSignup) {
        setTimeout(() => {
          setIsSignup(false);
          setSuccess("");
        }, 1500);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const AuthForm: React.FC = () => (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input
          type="text"
          name="name"
          placeholder="Username"
          className="w-full px-4 py-3 rounded-xl text-secondary text-lg border-2 border-primary bg-accent bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 placeholder-gray-500"
          required
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl text-secondary text-lg border-2 border-primary bg-accent bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 placeholder-gray-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-secondary hover:bg-primary-light font-bold py-3 px-4 rounded-xl text-xl transition-all duration-300 shadow-lg hover:shadow-primary"
      >
        {isSignup ? "Sign Up" : "Sign In"}
      </button>
    </form>
  );

  const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-lg flex items-center justify-center p-4 z-50">
        <div className="bg-accent rounded-xl p-6 w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-primary text-2xl hover:text-primary-light"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };

  const openModal = (signup: boolean) => {
    setIsSignup(signup);
    setError("");
    setSuccess("");
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-primary mb-8">Blackjack Game</h1>
      <p className="text-xl text-primary mb-8">
        Ready to test your luck? Sign in or sign up to start playing!
      </p>

      <div className="space-x-4">
        <button
          onClick={() => openModal(true)}
          className="bg-primary text-secondary hover:bg-primary-light font-bold py-3 px-6 rounded-xl text-xl transition-all duration-300 shadow-lg hover:shadow-primary"
        >
          Sign Up
        </button>
        <button
          onClick={() => openModal(false)}
          className="bg-secondary text-primary hover:bg-secondary-light font-bold py-3 px-6 rounded-xl text-xl transition-all duration-300 shadow-lg hover:shadow-secondary border-2 border-primary"
        >
          Sign In
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-2xl font-bold text-primary mb-4">
          {isSignup ? "Sign Up" : "Sign In"}
        </h2>
        <AuthForm />
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        <p className="text-center text-white mt-4">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-primary hover:text-white"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </Modal>
    </div>
  );
};

export default LandingPage;
