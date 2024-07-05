import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, AlertCircle, ChevronRight, Diamond, Spade, Heart, Club } from "lucide-react";
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
    <div className="min-h-screen bg-[#0a4a2f] text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzBhNGEyZiI+PC9yZWN0Pgo8cGF0aCBkPSJNMzAgMTBMMTAgMzBMMzAgNTBMNTAgMzBMMzAgMTBaIiBmaWxsPSJub25lIiBzdHJva2U9IiMxYTYxM2YiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+Cjwvc3ZnPg==')] opacity-30"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <button
            onClick={() => setShowRules(true)}
            className="bg-[#d4af37] text-[#0a4a2f] hover:bg-[#f1c40f] transition-all duration-300 py-2 px-4 rounded-lg font-semibold flex items-center space-x-2 shadow-md"
          >
            <AlertCircle size={20} />
            <span>Rules</span>
          </button>
          <h1 className="text-5xl font-bold text-[#d4af37] pb-2 flex items-center">
            <Spade className="mr-2" />
            Quick21
            <Diamond className="ml-2" />
          </h1>
          <div className="flex items-center space-x-2 bg-[#0a4a2f] border-2 border-[#d4af37] rounded-full py-2 px-4">
            <User size={24} className="text-[#d4af37]" />
            <span className="font-semibold">Player</span>
          </div>
        </header>

        <main className="flex flex-col items-center space-y-12">
          <button
            onClick={newGame}
            className="bg-[#d4af37] text-[#0a4a2f] hover:bg-[#f1c40f] font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 w-80 shadow-lg hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
          >
            New Game
          </button>

          <div className="flex flex-col items-center space-y-6 w-80">
            <input
              value={roomCode}
              onChange={sanitizeRoomCode}
              placeholder="Enter game code"
              maxLength={6}
              className="w-full px-6 py-4 rounded-xl text-[#0a4a2f] text-center text-2xl border-2 border-[#d4af37] bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#f1c40f] transition-all duration-300 placeholder-gray-500"
            />
            <button
              onClick={joinRoom}
              className="bg-[#d4af37] text-[#0a4a2f] hover:bg-[#f1c40f] font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 w-full shadow-lg hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
            >
              Join Game
            </button>
          </div>
        </main>

        <footer className="mt-16 text-center">
          <span className="text-sm text-[#d4af37] font-semibold">v1.0</span>
        </footer>

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
