import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RulesModal from "../../components/Rules";
import { socket } from "../../socket";
import "./Lobby.css";

const LobbyScreen = () => {
  let navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const newGame = () => {
    socket.emit("create-room", "player 1");

    socket.once("create-room-response", (response) => {
      console.log(response.success);
      console.log(response.roomCode);
      navigate("/game", { state: { roomCode: response.roomCode, isOwner: true } });
      gameLoop();
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

    socket.once("join-room-response", (response) => {
      if (response.success === false) {
        alert("Room not found or full");
      } else {
        navigate("/game", { state: { roomCode: roomCode, isOwner: false } });
        gameLoop();
      }
    });
  };

  const sanitizeRoomCode = (event) => {
    let changed = event.target.value;
    if (/^\d*$/.test(changed) && changed.length <= 6) {
      setRoomCode(changed);
    }
  };

  const gameLoop = () => {
    socket.on("game-state-update", (gameState) => {
      console.log(gameState);
    });
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
          maxLength="6"
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
