import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../../SocketContext";
import { useNavigate } from "react-router-dom";
import { DollarSignIcon, PlayIcon, ShieldCheckIcon, Users } from "lucide-react";

const API_BASE_URL: string =
  process.env.REACT_APP_ENV === "production" || undefined
    ? "https://quick21.onrender.com"
    : "http://localhost:4000";

const LandingPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { connect, isAuthenticated } = useSocket();
  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/lobby");
    }
  }, [isAuthenticated, navigate]);

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
        {isSignup ? "Register" : "Log in"}
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
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary opacity-5 transform rotate-45 scale-150"></div>

      <div className="z-10 text-center max-w-4xl">
        <h1 className="text-6xl font-extrabold text-primary mb-4 tracking-tight">
          Welcome to Quick21
        </h1>
        <p className="text-2xl text-primary mb-8">
          Experience the thrill of the casino from the comfort of your home!
        </p>

        {/* Fake Money Disclaimer */}
        <div className="bg-primary text-secondary py-2 px-4 rounded-full inline-block mb-8">
          <span className="font-bold">Play with Fake Money</span> - All the fun,
          none of the risk!
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: PlayIcon, text: "Play Anytime" },
            { icon: ShieldCheckIcon, text: "Secure Gaming" },
            { icon: DollarSignIcon, text: "Win Big" },
            { icon: Users, text: "Multiplayer" },
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <feature.icon className="w-12 h-12 text-primary mb-2" />
              <span className="text-primary font-semibold">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="space-x-6">
          <button
            onClick={() => openModal(true)}
            className="bg-primary text-secondary hover:bg-opacity-90 font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={() => openModal(false)}
            className="bg-secondary text-primary hover:bg-opacity-90 font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-primary transform hover:scale-105"
          >
            Log in
          </button>
        </div>
      </div>

      <div className="mt-16 bg-primary bg-opacity-10 p-6 rounded-lg max-w-2xl mx-auto">
        <p className="text-primary italic text-lg">
          "This is the best online Blackjack game I've ever played. The
          interface is smooth, and the multiplayer feature is addictive!"
        </p>
        <p className="text-primary font-semibold mt-2">- Matthew B.</p>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="text-3xl font-bold text-primary mb-6">
          {isSignup ? "Join the Table" : "Welcome Back"}
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
        <p className="text-center text-primary mt-6">
          {isSignup ? "Already at the table?" : "New to the game?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-primary hover:text-secondary underline font-semibold"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </Modal>
    </div>
  );
};

export default LandingPage;
