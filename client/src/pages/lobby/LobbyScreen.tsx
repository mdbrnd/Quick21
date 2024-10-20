import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Diamond,
  Spade,
  LogOut,
  ScrollText,
} from "lucide-react";
import RulesModal from "./Rules";
import { useSocket } from "../../SocketContext";

const LobbyScreen = () => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const { socket, userInfo } = useSocket();

  useEffect(() => {
    if (!socket) {
      navigate("/");
      return;
    }
  }, [socket, navigate]);

  const logOut = () => {
    if (socket) {
      socket.disconnect();
      localStorage.removeItem("authToken");
    }
    navigate("/");
  };

  const newGame = async () => {
    if (!socket) {
      navigate("/");
      return;
    }

    const response = await socket.emitWithAck("create-room");
    if (!response.success) {
      alert("Failed to create room");
      return;
    }
    navigate("/game", {
      state: { roomCode: response.roomCode, isOwner: true },
    });
  };

  const joinRoom = async () => {
    if (roomCode.length !== 6) {
      alert("Room code must be 6 digits.");
      return;
    }

    if (!socket) {
      alert("Socket connection not established. Try refreshing the page.");
      return;
    }

    const result = await socket.emitWithAck(
      "join-room",
      roomCode
    );

    if (!result.success) {
      if (result.errorMessage) {
        alert(result.errorMessage);
      } else {
        alert("Room not found or full");
      }
      return;
    }
    navigate("/game", { state: { roomCode: roomCode, isOwner: false } });
  };

  const sanitizeRoomCode = (event: any) => {
    const changed = event.target.value;
    if (/^\d*$/.test(changed) && changed.length <= 6) {
      setRoomCode(changed);
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-accent font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzBhNGEyZiI+PC9yZWN0Pgo8cGF0aCBkPSJNMzAgMTBMMTAgMzBMMzAgNTBMNTAgMzBMMzAgMTBaIiBmaWxsPSJub25lIiBzdHJva2U9IiMxYTYxM2YiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+Cjwvc3ZnPg==')] opacity-40"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <button
            onClick={() => setShowRules(true)}
            className="bg-primary text-secondary hover:bg-primary-light transition-all duration-300 py-2 px-4 rounded-lg font-semibold flex items-center space-x-2 shadow-md"
          >
            <ScrollText size={20} />
            <span>Rules</span>
          </button>
          <h1 className="text-5xl font-bold text-primary pb-2 flex items-center absolute left-1/2 transform -translate-x-1/2">
            <Spade className="mr-2" />
            Quick21
            <Diamond className="ml-2" />
          </h1>
          <div className="flex items-center space-x-2 bg-secondary border-2 border-primary rounded-full py-2 px-4">
            <User size={24} className="text-primary" />
            <span className="font-semibold text-white">{userInfo?.name}</span>
            <div className="flex items-center space-x-1 text-primary">
              <span className="font-bold">
                ${userInfo?.balance.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => logOut()}
              className="hover:bg-primary-light rounded-md"
            >
              <LogOut size={24} className="text-white" />
            </button>
          </div>
        </header>

        <main className="flex flex-col items-center space-y-12">
          <button
            onClick={newGame}
            className="bg-primary text-secondary hover:bg-primary-light font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 w-80 shadow-lg hover:shadow-primary"
          >
            New Game
          </button>

          <div className="flex flex-col items-center space-y-6 w-80">
            <input
              value={roomCode}
              onChange={sanitizeRoomCode}
              placeholder="Enter room code"
              maxLength={6}
              className="w-full px-6 py-4 rounded-xl text-secondary text-center text-2xl border-2 border-primary bg-accent bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-light transition-all duration-300 placeholder-gray-500"
            />
            <button
              onClick={joinRoom}
              className="bg-primary text-secondary hover:bg-primary-light font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 w-full shadow-lg hover:shadow-primary"
            >
              Join Game
            </button>
          </div>
        </main>

        {showRules && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowRules(false)}
          >
            <RulesModal onClose={() => setShowRules(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
