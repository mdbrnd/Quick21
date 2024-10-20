import React, { useEffect, useState } from "react";
import { useSocket } from "../../SocketContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL: string =
  process.env.REACT_APP_ENV === "production" ||
  process.env.REACT_APP_ENV === undefined // In production, the custom REACT_APP_ENV doesn't exist, so we use undefined
    ? "https://quick21.onrender.com"
    : "http://localhost:4000";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket, userInfo } = useSocket();
  const [username, setUsername] = useState("");
  const [amount, setBalance] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setToken(token);
    }
  }, [socket, navigate, userInfo]);

  const handleAddMoney = async () => {
    try {
      if (!username || !amount) {
        alert("Please fill in all fields.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/add-money`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token: token,
          name: username,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      alert("Money added successfully!");
    } catch (error) {
      console.error("Failed to add money:", error);
      alert("Failed to add money.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Admin Panel
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username:
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance to add:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </label>
            </div>
            <button
              onClick={handleAddMoney}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Add Money
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
