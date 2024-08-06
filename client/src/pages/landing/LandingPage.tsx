import React, { useState } from "react";
import { useSocket } from "../../SocketContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:4000";

const LandingPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { socket, connect, disconnect } = useSocket();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const endpoint = isSignup ? "/register" : "/login";

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, password }),
      });


      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server responded with non-JSON data: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      setSuccess(data.message);
      if (!isSignup && data.token) {
        localStorage.setItem("authToken", data.token);

        // Connect to the socket server after successful login
        connect(data.token);

        // Redirect to the game page after successful login
        navigate("/lobby", { state: { data } });
      } else if (isSignup) {
        // Switch to sign in mode after successful registration
        setTimeout(() => {
          setIsSignup(false);
          setSuccess("");
        }, 1500);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const AuthForm: React.FC = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Username"
          className="w-full px-4 py-3 rounded-xl text-secondary text-lg border-2 border-primary bg-accent bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 placeholder-gray-500"
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-accent rounded-xl p-6 w-full max-w-md">
          <button onClick={onClose} className="float-right text-primary">
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };

  const openModal = (signup: boolean) => {
    setIsSignup(signup);
    setName("");
    setPassword("");
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
          onClick={() => openModal(false)}
          className="bg-primary text-secondary hover:bg-primary-light font-bold py-3 px-6 rounded-xl text-xl transition-all duration-300 shadow-lg hover:shadow-primary"
        >
          Sign In
        </button>
        <button
          onClick={() => openModal(true)}
          className="bg-secondary text-primary hover:bg-secondary-light font-bold py-3 px-6 rounded-xl text-xl transition-all duration-300 shadow-lg hover:shadow-secondary border-2 border-primary"
        >
          Sign Up
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
        <p className="text-center text-secondary mt-4">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-primary hover:underline focus:outline-none"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </Modal>
    </div>
  );
};

export default LandingPage;
