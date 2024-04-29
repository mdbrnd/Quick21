import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { Location, useLocation } from "react-router-dom";
import { ClientGameState } from "../../models/game_state";

type LocationState = {
  roomCode: string;
  isOwner: boolean;
};

const GameScreen: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<ClientGameState>({
    dealersVisibleCard: null,
    currentTurn: null,
    playersHands: new Map(),
    currentPhase: "Betting",
    bets: new Map(),
  });

  let isRoomOwner = location.state.isOwner;

  useEffect(() => {
    function onStartGame(initialGameState: ClientGameState) {
      setGameStarted(true);
      console.log(initialGameState);
      setGameState(initialGameState);
    }

    function onGameStateUpdate(gameState: ClientGameState) {
      console.log(gameState);
      setGameState(gameState);
    }

    socket.on(
      "game-started",
      (response: { initialGameState: ClientGameState }) =>
        onStartGame(response.initialGameState)
    );
    socket.on("game-state-update", (response: { gameState: ClientGameState }) =>
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
          // Add null check for gameState before accessing currentPhase
          gameState && gameState.currentPhase === "Betting" ? (
            <BettingControls />
          ) : (
            <GameControls
              onHit={() => {}}
              onStand={() => {}}
              onDouble={() => {}}
            />
          )
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
const BettingControls: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const handlePlaceBet = () => {
    const betAmount = parseInt((document.getElementById("betInput") as HTMLInputElement)?.value || "0");
    socket.emit("place-bet", location.state.roomCode, betAmount);
  };

  return (
    <div>
      <input type="number" id="betInput" />
      <button onClick={handlePlaceBet}>Place Bet</button>
    </div>
  );
};

