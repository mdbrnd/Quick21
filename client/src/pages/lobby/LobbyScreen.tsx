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
    const response = await socket.emitWithAck("create-room", "Player 1");

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

    const playerName = `Player ${Math.floor(Math.random() * 100)}`; // int from 0 to 99

    socket.emit("join-room", roomCode, playerName);

    socket.once("join-room-response", (success: boolean) => {
      if (!success) {
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
    <div className="lobby-screen-style">
      <div className="header">
        <button className="rules-icon" onClick={toggleRules}>
          📋 Rules
        </button>
        <h1 className="title">Welcome to Quick21</h1>
        <div className="profile">
          <img src="/assets/images/profile-icon-3.svg" alt="Profile Icon" />

          <span>Player</span>
        </div>
      </div>

      <button className="new-game-button" onClick={newGame}>
        New Game
      </button>

      <div className="input-group">
        <input
          value={roomCode}
          onChange={sanitizeRoomCode}
          placeholder="Enter game code"
          maxLength={6}
        />
        <button onClick={joinRoom}>Join Game</button>
      </div>

      <span className="version-number">v1.0</span>

      {showRules && (
        <div className="overlay-style" onClick={() => setShowRules(false)}>
          <RulesModal onClose={() => setShowRules(false)} />
        </div>
      )}
    </div>
  );
};

export default LobbyScreen;
