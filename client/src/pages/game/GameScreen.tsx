import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { Location, useLocation } from "react-router-dom";
import { ClientGameState } from "../../models/game_state";
import { Player, PlayerAction } from "../../models/player";
import { Card } from "../../models/card";
import { RoundOverInfo } from "../../models/round_over_info";

type LocationState = {
  roomCode: string;
  isOwner: boolean;
};

const GameScreen: React.FC = () => {
  const location: Location<LocationState> = useLocation();
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
          gameState.currentPhase === "Betting" &&
          roundOverInfo === undefined ? (
            <BettingControls />
          ) : (
            <GameControls
              gameState={gameState}
              roundOverInfo={roundOverInfo}
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
  roundOverInfo: RoundOverInfo | undefined;
  updateGameState: (gameState: ClientGameState) => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  roundOverInfo,
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

  function calculateHandValue(cards: Card[]): number {
    let value = 0;
    let aceCount = 0;

    for (const card of cards) {
      if (card.value === "A") {
        aceCount++;
        value += 11; // initially consider ace as 11
      } else if (["J", "Q", "K"].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    // Adjust if the value is over 21 and the hand contains Aces considered as 11
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }

    return value;
  }

  return (
    <div>
      {roundOverInfo !== undefined && (
        <div>
          Round Over
          <br />
        </div>
      )}
      {gameState.currentTurn?.socketId === socket.id && (
        <div>
          <button onClick={onHit}>Hit</button>
          <button onClick={onStand}>Stand</button>
          <button onClick={onDouble}>Double</button>
        </div>
      )}
      {roundOverInfo === undefined && (
        <>
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
              {player.name}'s Hand Value: {calculateHandValue(cards)}
              <br />
              Bet: {findBetBySocketId(gameState.bets, player.socketId)}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const BettingControls: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const betInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = () => {
    if (betInputRef.current) {
      const value = parseInt(betInputRef.current.value, 10);
      if (value <= 0) {
        betInputRef.current.value = ""; // Reset the input if the value is 0 or negative
      }
    }
  };

  const handlePlaceBet = async () => {
    const betAmount = parseInt(betInputRef.current?.value || "0", 10);

    if (betAmount > 0) {
      const response = await socket.emitWithAck(
        "place-bet",
        location.state.roomCode,
        betAmount
      );
      if (!response.success) {
        alert("Failed to place bet");
      }
    } else {
      alert("Please enter a valid bet amount greater than zero.");
    }
  };

  return (
    <div>
      <input
        type="number"
        id="betInput"
        ref={betInputRef}
        min="1"
        onChange={handleInputChange}
      />
      <button onClick={handlePlaceBet}>Place Bet</button>
    </div>
  );
};

