import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { Location, useLocation } from "react-router-dom";
import { ClientGameState } from "../../models/game_state";
import { Player, PlayerAction } from "../../models/player";

type LocationState = {
  roomCode: string;
  isOwner: boolean;
};

const GameScreen: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const [gameState, setGameState] = useState<ClientGameState>(
    new ClientGameState(false, null, null, new Map(), "Betting", new Map())
  );

  let isRoomOwner = location.state.isOwner;

  function updateGameState(gameState: ClientGameState) {
    console.log("updating game state to:");
    console.log(gameState);
    setGameState(gameState);
  }

  useEffect(() => {
    socket.on("game-state-update", (newGameState: any) => {
      newGameState = ClientGameState.fromSerializedFormat(newGameState);
      updateGameState(newGameState);
    });

    socket.on("round-over", (roundOverInfo: any) => {
      console.log("Round over");
      console.log(roundOverInfo);
    });

    // Remove event listener when component unmounts
    return () => {
      socket.off("game-state-update", updateGameState);
    };
  }, []);

  const handleStartGameButton = () => {
    socket.emit("start-game", location.state.roomCode);
  };

  function hit() {
    socket.emit("action", location.state.roomCode, PlayerAction.Hit);
  }

  function stand() {
    socket.emit("action", location.state.roomCode, PlayerAction.Stand);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Quick21</h2>
      <h3>
        Room Code: {location.state.roomCode} &nbsp;
        <button
          onClick={() => {
            navigator.clipboard.writeText(location.state.roomCode);
          }}
        >
          Copy
        </button>
      </h3>
      <h3>
        {gameState.gameStarted ? (
          gameState.currentPhase === "Betting" ? (
            <BettingControls />
          ) : (
            <GameControls
              gameState={gameState}
              updateGameState={updateGameState}
              onHit={hit}
              onStand={stand}
              onDouble={() => {}}
            />
          )
        ) : (
          "Waiting for host to start..."
        )}
      </h3>
      {isRoomOwner && !gameState.gameStarted && (
        <button onClick={handleStartGameButton}>Start Game</button>
      )}
    </div>
  );
};

export default GameScreen;

interface GameControlsProps {
  gameState: ClientGameState;
  updateGameState: (gameState: ClientGameState) => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onHit,
  onStand,
  onDouble,
}) => {
  console.log(gameState);
  const playersHandsArray = Array.from(gameState.playersHands.entries());

  const findBetBySocketId = (
    betsMap: Map<Player, number>,
    socketId: string
  ): number | undefined => {
    for (const [player, bet] of betsMap.entries()) {
      if (player.socketId === socketId) {
        return bet;
      }
    }
    return undefined;
  };

  return (
    <div>
      {gameState.currentTurn?.socketId === socket.id && (
        <div>
          <button onClick={onHit}>Hit</button>
          <button onClick={onStand}>Stand</button>
          <button onClick={onDouble}>Double</button>
        </div>
      )}
      <div>Current Phase: {gameState.currentPhase}</div>
      {gameState.dealersVisibleCard && (
        <div>
          Dealer's Visible Card: {gameState.dealersVisibleCard.value} of{" "}
          {gameState.dealersVisibleCard.suit}
        </div>
      )}
      <div>Players' Hands:</div>
      {playersHandsArray.map(([player, cards]) => (
        <div key={player.socketId}>
          {player.name}'s Hand:{" "}
          {cards.map((card) => `${card.value} of ${card.suit}`).join(", ")}
          <br />
          Bet: {findBetBySocketId(gameState.bets, player.socketId)}
        </div>
      ))}
    </div>
  );
};

const BettingControls: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const handlePlaceBet = async () => {
    const betAmount = parseInt(
      (document.getElementById("betInput") as HTMLInputElement)?.value || "0"
    );
    const response = await socket.emitWithAck(
      "place-bet",
      location.state.roomCode,
      betAmount
    );
    if (!response.success) {
      alert("Failed to place bet");
    }
  };

  return (
    <div>
      <input type="number" id="betInput" />
      <button onClick={handlePlaceBet}>Place Bet</button>
    </div>
  );
};
