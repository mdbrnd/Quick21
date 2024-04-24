import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { Location, useLocation } from "react-router-dom";
import { GameState } from "../../models/game_state";

type LocationState = {
  roomCode: string;
  isOwner: boolean;
};

const GameScreen: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    currentTurn: null,
    playersHands: new Map(),
    dealersHand: [],
    currentPhase: "Betting",
    bets: new Map(),
  });

  let isRoomOwner = location.state.isOwner;

  useEffect(() => {
    function onStartGame(initialGameState: GameState) {
      setGameStarted(true);
      console.log(initialGameState);
      setGameState(initialGameState);
    }

    function onGameStateUpdate(gameState: GameState) {
      console.log(gameState);
      setGameState(gameState);
    }

    socket.on("game-started", (response: { initialGameState: GameState }) =>
      onStartGame(response.initialGameState)
    );
    socket.on("game-state-update", (response: { gameState: GameState }) =>
      onGameStateUpdate(response.gameState)
    );

    // Remove event listener when component unmounts
    return () => {
      socket.off("game-started", onStartGame);
      socket.off("game-state-update", onGameStateUpdate);
    };
  }, []);

  const handleStartGameButton = () => {
    socket.emit("start-game", location.state.roomCode);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Quick21</h2>
      <h3>Room Code: {location.state.roomCode}</h3>
      <h3>
        {gameStarted ? (
          <GameControls
            onHit={() => {}}
            onStand={() => {}}
            onDouble={() => {}}
          />
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

export default GameScreen;

interface GameControlsProps {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  onHit,
  onStand,
  onDouble,
}) => {
  return (
    <div>
      <button onClick={onHit}>Hit</button>
      <button onClick={onStand}>Stand</button>
      <button onClick={onDouble}>Double</button>
    </div>
  );
};
