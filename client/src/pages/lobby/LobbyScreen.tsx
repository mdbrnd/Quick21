import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RulesModal from "../../components/Rules";
import { socket } from "../../socket";
import "./Lobby.css";

const LobbyScreen: React.FC = () => {
  let navigate = useNavigate();
  const [showRules, setShowRules] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");

  const newGame = async () => {
    const response = await socket.emitWithAck("create-room", "player 1");

    if (!response.success) {
      alert("Failed to create room");
      return;
    }

    navigate("/game", {
      state: { roomCode: response.roomCode, isOwner: true },
    });
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  const joinRoom = () => {
    if (roomCode.length !== 6) {
      alert("Room code must be 6 digits");
      return;
    }

    socket.emit("join-room", roomCode);

    socket.once("join-room-response", (response: { success: boolean }) => {
      if (!response.success) {
        alert("Room not found or full");
      } else {
        navigate("/game", { state: { roomCode: roomCode, isOwner: false } });
      }
    });
  };

  const sanitizeRoomCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    let changed = event.target.value;
    if (/^\d*$/.test(changed) && changed.length <= 6) {
      setRoomCode(changed);
    }
  };

  return (
    <div className="lobbyScreenStyle">
      <h1>Welcome to Quick21</h1>
      <button onClick={newGame} className="buttonStyle">
        New Game
      </button>
      <div>
        <input
          value={roomCode}
          onChange={sanitizeRoomCode}
          placeholder="Enter game code"
          maxLength={6}
        />
        <button onClick={joinRoom} className="buttonStyle">
          Join Game
        </button>
      </div>
      <button onClick={toggleRules} className="buttonStyle">
        Rules
      </button>

      {showRules && (
        <div className="overlayStyle" onClick={() => setShowRules(false)}>
          <RulesModal onClose={() => setShowRules(false)} />
        </div>
      )}
    </div>
  );
};

export default LobbyScreen;
