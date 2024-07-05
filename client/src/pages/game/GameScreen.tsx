import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { ClientGameState } from "../../models/game_state";
import { Player, PlayerAction } from "../../models/player";
import { Card } from "../../models/card";
import { RoundOverInfo } from "../../models/round_over_info";
import "./Game.css";
import "../../index.css";
import { Minus, CoinsIcon, Plus, LogOut, CopyIcon } from "lucide-react";

type LocationState = {
  roomCode: string;
  isOwner: boolean;
};

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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c20] to-[#282c34] text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzI4MmMzNCI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIj48L2NpcmNsZT4KPC9zdmc+')] opacity-10"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 bg-[#61dafb] bg-opacity-20 rounded-full py-2 px-4">
            <span className="font-semibold">
              Room: {location.state.roomCode}
            </span>
            <button
              onClick={() =>
                navigator.clipboard.writeText(location.state.roomCode)
              }
              className="text-[#61dafb] hover:text-[#53c4f3] transition-colors duration-300"
            >
              <CopyIcon size={20} />
            </button>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#61dafb] to-[#53c4f3]">
            Quick21
          </h1>
          <button
            onClick={handleLeaveGameButton}
            className="absolute right-5 bottom-2 bg-[#61dafb] hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2"
          >
            <LogOut size={20} />
            <span>Leave</span>
          </button>
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
            <div className="text-2xl font-semibold text-[#61dafb]">
              Waiting for host to start...
            </div>
          )}

          {isRoomOwner && !gameState.gameStarted && (
            <button
              onClick={handleStartGameButton}
              className="bg-gradient-to-r from-[#61dafb] to-[#53c4f3] text-[#282c34] font-bold py-3 px-6 rounded-lg text-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(97,218,251,0.7)] transform hover:scale-105"
            >
              Start Game
            </button>
          )}
        </main>
      </div>

      <div className="absolute left-5 bottom-2.5">
        <span className="text-sm text-white opacity-70 font-semibold">
          v1.0
        </span>
      </div>
    </div>
  );
};

export default GameScreen;

interface PlayerListProps {
  gameState: ClientGameState;
}

const PlayerList: React.FC<PlayerListProps> = ({ gameState }) => {
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
    <div className="absolute top-5 right-5 bg-[#1f2229] text-[#61dafb] p-2.5 rounded shadow-md w-50">
      {playersHandsArray.map(([player, cards], index) => (
        <div
          key={player.socketId}
          className="p-1.5 border-b-2 border-[#61dafb] last:border-b-0"
        >
          <div className="font-bold">{player.name}</div>
          <div className="text-sm text-white">
            Bet: {findBetBySocketId(gameState.bets, player.socketId) || 0}$
          </div>
        </div>
      ))}
    </div>
  );
};

interface GameControlsProps {
  gameState: ClientGameState;
  roundOverInfo: RoundOverInfo | undefined;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onStartNewRound: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  roundOverInfo,
  onHit,
  onStand,
  onDouble,
  onStartNewRound,
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
      if (card.value === "Ace") {
        aceCount++;
        value += 11; // initially consider ace as 11
      } else if (["Jack", "Queen", "King"].includes(card.value)) {
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

  function getCardImage(card: Card): string {
    return `/assets/images/cards/${card.value.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
  }

  return (
    <div>
      {roundOverInfo !== undefined && (
        <div>
          Round Over
          <br />
          {Array.from(roundOverInfo.results.entries()).map(
            ([player, result]) => (
              <div key={player.socketId}>
                {player.name} {result}
              </div>
            )
          )}
          <button onClick={onStartNewRound}>New Round</button>
        </div>
      )}
      {gameState.currentTurn?.socketId === socket.id &&
        roundOverInfo === undefined && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex">
            <button onClick={onHit}>Hit</button>
            <button onClick={onStand}>Stand</button>
            <button onClick={onDouble}>Double</button>
          </div>
        )}
      {
        <>
          {roundOverInfo === undefined && (
            <div className="flex justify-center p-5 flex-col items-center bg-[#282c34] text-white text-center">
              Current Phase: {gameState.currentPhase}
            </div>
          )}
          {gameState.dealersVisibleCard && (
            <div className="mb-5">
              <div>Dealer</div>
              {roundOverInfo === undefined && (
                <div className="flex justify-center">
                  <img
                    src={getCardImage(gameState.dealersVisibleCard)}
                    alt={`Dealer's card: ${gameState.dealersVisibleCard.value} of ${gameState.dealersVisibleCard.suit}`}
                    className="card-image w-25 h-[150px] ml-1.5 mt-1.5"
                  />
                  <img
                    src={"/assets/images/cards/back_of_card.png"}
                    alt={`Dealer's not visible card`}
                    className="card-image w-25 h-[150px] ml-1.5 mt-1.5"
                  />
                </div>
              )}
              {roundOverInfo !== undefined && (
                <div>
                  {roundOverInfo.dealersHand.map((card, index) => (
                    <img
                      src={getCardImage(card)}
                      alt={`Dealer's card: ${card.value} of ${card.suit}`}
                      className="card-image"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="w-full flex justify-around flex-wrap mt-5 gap-12.5">
            {playersHandsArray.map(([player, cards], index) => (
              <div key={player.socketId}>
                <div
                  style={{
                    color:
                      gameState.currentTurn?.socketId === player.socketId &&
                      roundOverInfo === undefined
                        ? "green"
                        : "inherit",
                  }}
                >
                  {player.name}
                </div>
                <div>
                  Bet: {findBetBySocketId(gameState.bets, player.socketId)}$
                </div>
                <div className="card-container">
                  {cards.map((card, cardIndex) => (
                    <img
                      key={cardIndex}
                      src={getCardImage(card)}
                      alt={`${card.value} of ${card.suit}`}
                      className="card-image"
                      style={{
                        transform:
                          cardIndex === 0
                            ? "translate(0, 0)"
                            : "translate(-50px, 0)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      }
    </div>
  );
};

const BettingControls: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const betInputRef = React.useRef<HTMLInputElement>(null);
  const [betAmount, setBetAmount] = useState(0);

  const handleAddBet = () => {
    setBetAmount((prevBet) => prevBet + 25000);
  };

  const handleSubtractBet = () => {
    setBetAmount((prevBet) => Math.max(prevBet - 25000, 0));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setBetAmount(value);
    } else {
      setBetAmount(0);
    }
  };

  const handlePlaceBet = async () => {
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
    <div className="bg-[#1e2127] p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#61dafb]">Place Your Bet</h2>
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={handleSubtractBet}
          className="bg-[#61dafb] text-[#282c34] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#53c4f3] transition-colors duration-300"
        >
          <Minus size={24} color="#282c34" />
        </button>
        <input
          type="number"
          value={betAmount}
          onChange={handleInputChange}
          className="bg-[#282c34] text-[#61dafb] border-2 border-[#61dafb] rounded-lg px-4 py-2 w-40 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#61dafb]"
        />
        <button
          onClick={handleAddBet}
          className="bg-[#61dafb] text-[#282c34] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#53c4f3] transition-colors duration-300"
        >
          <Plus size={24} color="#282c34" />
        </button>
      </div>
      <button
        onClick={handlePlaceBet}
        className="bg-gradient-to-r from-[#61dafb] to-[#53c4f3] text-[#282c34] font-bold py-3 px-6 rounded-lg text-xl w-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(97,218,251,0.7)] transform hover:scale-105"
      >
        Place Bet
      </button>
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleAddBet}
          className="bg-[#61dafb] text-[#282c34] p-2 rounded-full hover:bg-[#53c4f3] transition-colors duration-300 flex items-center space-x-2"
        >
          <CoinsIcon size={24} />
          <span className="font-bold">+25k</span>
        </button>
      </div>
    </div>
  );
};
