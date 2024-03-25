import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { useLocation } from "react-router-dom";

const GameScreen = () => {
  const location = useLocation(); // params passed from LobbyScreen in navigate() can be accessed here
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState({});

  let isRoomOwner = location.state.isOwner;

  useEffect(() => {
    function onStartGame() {
      setGameStarted(true);
    }

    function onGameStateUpdate(gameState) {
      console.log(gameState);
      setGameState(gameState);
    }

    socket.on("game-started", onStartGame);
    socket.on("game-state-update", onGameStateUpdate);

    // remove event listener when component unmounts
    return () => {
      socket.off("game-started", onStartGame);
      socket.off("game-state-update", onGameStateUpdate);
    };
  }, []);

  const handleStartGameButton = () => {
    socket.emit("start-game", location.state.roomCode);
    setGameStarted(true);
  };

  const handleHit = () => {};

  const handleStand = () => {};

  const handleDouble = () => {};

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Quick21</h2>
      <h3>Room Code: {location.state.roomCode}</h3>
      <h3>
        {gameStarted ? (
          <GameControls></GameControls>
        ) : (
          "Waiting for host to start..."
        )}
      </h3>
      {isRoomOwner && !gameStarted && (
        <button onClick={handleStartGameButton}>Start Game</button>
      )}
    </div>
  );
};

// Component to hit, stand, double and etc. (also place bet) + game state
const GameControls = ({ onHit, onStand, onDouble }) => {
  return (
    <div>
      <button onClick={onHit}>Hit</button>
      <button onClick={onStand}>Stand</button>
      <button onClick={onDouble}>Double</button>
    </div>
  );
};

export default GameScreen;
