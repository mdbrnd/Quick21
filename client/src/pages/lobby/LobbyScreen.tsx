import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, AlertCircle, ChevronRight } from "lucide-react";
import RulesModal from "../../components/Rules";
import { socket } from "../../socket";

const LobbyScreen = () => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const newGame = async () => {
    const response = await socket.emitWithAck("create-room", "Player 1");
    if (!response.success) {
      alert("Failed to create room");
      return;
    }
    navigate("/game", {
      state: { roomCode: response.roomCode, isOwner: true },
    });
  };

  const joinRoom = () => {
    if (roomCode.length !== 6) {
      alert("Room code must be 6 digits");
      return;
    }
    const playerName = `Player ${Math.floor(Math.random() * 100)}`;
    socket.emit("join-room", roomCode, playerName);
    socket.once("join-room-response", (success) => {
      if (!success) {
        alert("Room not found or full");
      } else {
        navigate("/game", { state: { roomCode: roomCode, isOwner: false } });
      }
    });
  };

  const sanitizeRoomCode = (event: any) => {
    const changed = event.target.value;
    if (/^\d*$/.test(changed) && changed.length <= 6) {
      setRoomCode(changed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c20] to-[#282c34] text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzI4MmMzNCI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIj48L2NpcmNsZT4KPC9zdmc+')] opacity-10"></div>

      <div className="container mx-auto py-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <button
            onClick={() => setShowRules(true)}
            className="bg-[#61dafb] text-[#282c34] hover:bg-[#53c4f3] transition-all duration-300 py-2 px-4 rounded-lg font-semibold flex items-center space-x-2 shadow-lg hover:shadow-[0_0_15px_rgba(97,218,251,0.5)]"
          >
            <AlertCircle size={20} />
            <span>Rules</span>
          </button>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#61dafb] to-[#53c4f3] pb-2">
            Welcome to Quick21
          </h1>
          <div className="flex items-center space-x-2 bg-[#61dafb] bg-opacity-20 rounded-full py-2 px-4">
            <User size={24} className="text-[#61dafb]" />
            <span className="font-semibold">Player</span>
          </div>
        </header>

        <main className="flex flex-col items-center space-y-12">
          <button
            onClick={newGame}
            className="bg-gradient-to-r from-[#61dafb] to-[#53c4f3] text-[#282c34] hover:from-[#53c4f3] hover:to-[#61dafb] font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 w-80 shadow-lg hover:shadow-[0_0_25px_rgba(97,218,251,0.7)] transform hover:scale-105"
          >
            New Game
          </button>

          <div className="flex flex-col items-center space-y-3 w-80">
            <div className="relative w-full">
              <input
                value={roomCode}
                onChange={sanitizeRoomCode}
                placeholder="Enter game code"
                maxLength={6}
                className="w-full px-6 py-4 rounded-xl text-white text-center text-2xl border-2 border-[#61dafb] bg-white bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-[#61dafb] transition-all duration-300 placeholder-gray-400"
              />
            </div>
            <button
              onClick={joinRoom}
              className="bg-[#61dafb] text-[#282c34] hover:bg-[#53c4f3] font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 w-full shadow-lg hover:shadow-[0_0_25px_rgba(97,218,251,0.7)] transform hover:scale-105"
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

      <div className="absolute left-5 bottom-2.5">
        <span className="text-sm text-white opacity-70 font-semibold">
          v1.0
        </span>
      </div>
    </div>
  );
};

export default LobbyScreen;
