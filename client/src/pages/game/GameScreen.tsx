import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { ClientGameState } from "../../models/game_state";
import { PlayerAction } from "../../models/player";
import { RoundOverInfo } from "../../models/round_over_info";
import "../../index.css";
import { LogOut, Copy } from "lucide-react";
import GameControls from "./GameControls";
import PlayerList from "./PlayerList";
import LocationState from "../../models/location_state";
import BettingControls from "./BettingControls";

const GameScreen: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<ClientGameState>(
    new ClientGameState(false, null, null, new Map(), "Betting", new Map())
  );
  const [roundOverInfo, setRoundOverInfo] = useState<RoundOverInfo | undefined>(
    undefined
  );

  let isRoomOwner = location.state.isOwner;

  function updateGameState(gameState: ClientGameState) {
    console.log("updating game state to:");
    console.log(gameState);
    setGameState(gameState);
  }

  useEffect(() => {
    socket.on("game-state-update", (newGameState: any) => {
      newGameState = ClientGameState.fromDTO(newGameState);
      updateGameState(newGameState);
      if (newGameState.currentPhase !== "RoundOver") {
        setRoundOverInfo(undefined);
      }
    });

    socket.on("round-over", (roundOverInfo: any) => {
      console.log("Round over");
      console.log(roundOverInfo);
      roundOverInfo = RoundOverInfo.fromDTO(roundOverInfo);
      setRoundOverInfo(roundOverInfo);
    });

    // Remove event listener when component unmounts
    return () => {
      socket.off("game-state-update", updateGameState);
      socket.off("round-over");
    };
  }, []);

  const handleStartGameButton = () => {
    socket.emit("start-game", location.state.roomCode);
  };

  const handleLeaveGameButton = () => {
    socket.emit("leave-room", location.state.roomCode);
    // Route to home page
    navigate("/");
  };

  function hit() {
    socket.emit("action", location.state.roomCode, PlayerAction.Hit);
  }

  function stand() {
    socket.emit("action", location.state.roomCode, PlayerAction.Stand);
  }

  function startNewRound() {
    socket.emit("new-round", location.state.roomCode);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-dark to-secondary text-accent font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzBhNGEyZiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIj48L2NpcmNsZT4KPC9zdmc+')] opacity-10"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 bg-primary bg-opacity-20 rounded-full py-2 px-4">
            <span className="font-semibold">
              Room: {location.state.roomCode}
            </span>
            <button
              onClick={() =>
                navigator.clipboard.writeText(location.state.roomCode)
              }
              className="text-primary hover:text-primary-light transition-colors duration-300"
            >
              <Copy size={20} />
            </button>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
            Quick21
          </h1>
        </header>

        <main className="flex flex-col items-center space-y-8">
          <PlayerList gameState={gameState} />

          {gameState.gameStarted ? (
            gameState.currentPhase === "Betting" &&
            roundOverInfo === undefined ? (
              <BettingControls />
            ) : (
              <GameControls
                gameState={gameState}
                roundOverInfo={roundOverInfo}
                onHit={hit}
                onStand={stand}
                onDouble={() => {}}
                onStartNewRound={startNewRound}
              />
            )
          ) : (
            <div className="text-2xl font-semibold text-primary">
              Waiting for host to start...
            </div>
          )}

          {isRoomOwner && !gameState.gameStarted && (
            <button
              onClick={handleStartGameButton}
              className="bg-gradient-to-r from-primary to-primary-light text-secondary font-bold py-3 px-6 rounded-lg text-xl transition-all duration-300 hover:shadow-primary hover:scale-105"
            >
              Start Game
            </button>
          )}
        </main>
      </div>

      <div className="absolute left-5 bottom-2.5">
        <span className="text-sm text-accent opacity-70 font-semibold">
          v1.0
        </span>
      </div>

      <button
        onClick={handleLeaveGameButton}
        className="absolute right-5 bottom-2.5 bg-primary hover:bg-red-600 text-secondary font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2"
      >
        <LogOut size={20} />
        <span>Leave</span>
      </button>
    </div>
  );
};

export default GameScreen;