import React, { useEffect, useState } from "react";
import { ClientGameState } from "../../models/game_state";
import { Card } from "../../models/card";
import { RoundOverInfo } from "../../models/round_over_info";
import "../../index.css";
import {
  calculateHandValue,
  findBetBySocketId,
  getPlayerHandBySocketId,
} from "../../models/utils";
import { useSocket } from "../../SocketContext";
import { useNavigate } from "react-router-dom";

const DealerHand: React.FC<{
  visibleCard: Card | null;
  fullHand: Card[] | null;
  onRevealComplete: () => void;
}> = ({ visibleCard, fullHand, onRevealComplete }) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);

  useEffect(() => {
    if (fullHand && fullHand.length > 1 && !isRevealing) {
      setIsRevealing(true);
      setRevealedCards([fullHand[0], fullHand[1]]);
      setTimeout(() => {
        setRevealedCards(fullHand);
        setTimeout(() => {
          onRevealComplete();
        }, 1000);
      }, 500);
    }
  }, [fullHand, isRevealing, onRevealComplete]);

  const getCardImage = (card: Card): string => {
    return `/assets/images/cards/${card.value.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
  };

  if (!visibleCard && !fullHand) return null;

  return (
    <div className="relative h-[190px] w-[150px]">
      {visibleCard && (
        <img
          src={getCardImage(visibleCard)}
          alt={`Dealer's card: ${visibleCard.value} of ${visibleCard.suit}`}
          className="absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out"
        />
      )}
      {!fullHand && (
        <img
          src="/assets/images/cards/back_of_card.png"
          alt="Dealer's hidden card"
          className="absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out"
          style={{ left: "25px", zIndex: 1 }}
        />
      )}
      {isRevealing &&
        revealedCards.map((card, index) => (
          <img
            key={index}
            src={getCardImage(card)}
            alt={`${card.value} of ${card.suit}`}
            className={`absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out ${
              index === 1
                ? "animate-card-flip"
                : index > 1
                ? "animate-card-enter"
                : ""
            }`}
            style={{
              left: `${index * 35}px`,
              zIndex: index,
            }}
          />
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
  const playersHandsArray = Array.from(gameState.playersHands.entries());
  const [animatedCards, setAnimatedCards] = useState<{ [key: string]: number }>(
    {}
  );
  const [dealerRevealComplete, setDealerRevealComplete] = useState(false);
  const { socket, userInfo } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    playersHandsArray.forEach(([player, cards]) => {
      const playerKey = player.socketId;
      if (
        !animatedCards[playerKey] ||
        animatedCards[playerKey] < cards.length
      ) {
        setAnimatedCards((prev) => ({ ...prev, [playerKey]: cards.length }));
      }
    });
  }, [playersHandsArray, animatedCards, roundOverInfo]);

  if (!socket) {
    navigate("/");
    return;
  }

  function getCardImage(card: Card): string {
    return `/assets/images/cards/${card.value.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
  }

  const renderStackedCards = (cards: Card[], playerKey: string) => {
    const animatedCount = animatedCards[playerKey] || 0;

    return (
      <div className="relative h-[170px] w-[150px]">
        {cards.map((card, index) => (
          <img
            key={index}
            src={getCardImage(card)}
            alt={`${card.value} of ${card.suit}`}
            className={`absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out ${
              index === cards.length - 1 && index + 1 > animatedCount - 1
                ? "animate-card-enter"
                : ""
            }`}
            style={{
              left: `${index * 35}px`,
              zIndex: index,
            }}
            onAnimationEnd={() => {
              setAnimatedCards((prev) => ({
                ...prev,
                [playerKey]: cards.length,
              }));
            }}
          />
        ))}
      </div>
    );
  };

  function currentPlayerCanDouble(): boolean {
    const player = gameState.currentTurn;
    if (!player) return false;

    const bet = findBetBySocketId(gameState.bets, player.socketId);
    if (bet === undefined) return false;

    const playersHand = getPlayerHandBySocketId(player.socketId, gameState);
    if (playersHand === undefined) return false;

    return (
      bet * 2 <= userInfo!.balance &&
      playersHand.length === 2 &&
      calculateHandValue(playersHand) < 21
    );
  }

  function shouldShowHitBtn(): boolean {
    const player = gameState.currentTurn;
    if (!player) return true;

    const playersHand = getPlayerHandBySocketId(player.socketId, gameState);
    if (playersHand === undefined) return true;

    return calculateHandValue(playersHand) >= 21 ? false : true;
  }

  return (
    <div className="w-full mx-auto">
      <div className="h-28 flex items-center justify-center">
        {roundOverInfo !== undefined && dealerRevealComplete ? (
          <RoundOverDisplay
            roundOverInfo={roundOverInfo}
            onStartNewRound={onStartNewRound}
          />
        ) : (
          <div className="invisible">Placeholder</div>
        )}
      </div>

      {gameState.currentTurn?.socketId === socket.id &&
        roundOverInfo === undefined && (
          <div className="fixed bottom-0 left-0 right-0 bg-secondary-dark p-4 flex justify-center space-x-4 z-10">
            {shouldShowHitBtn() && (
              <button
                onClick={onHit}
                className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
              >
                Hit
              </button>
            )}
            <button
              onClick={onStand}
              className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
            >
              Stand
            </button>
            {currentPlayerCanDouble() && (
              <button
                onClick={onDouble}
                className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
              >
                Double
              </button>
            )}
          </div>
        )}

      {(gameState.dealersVisibleCard || roundOverInfo) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2 flex items-center">
            Dealer
            {roundOverInfo !== undefined &&
              dealerRevealComplete &&
              calculateHandValue(roundOverInfo.dealersHand) > 21 && (
                <span className="ml-2 px-2 py-1 text-sm font-semibold rounded bg-red-600 text-white">
                  Bust
                </span>
              )}
          </h2>
          <div className="flex">
            <div className="flex justify-center items-center w-12 h-6 rounded-full bg-primary text-white text-lg font-bold shadow-lg">
              {roundOverInfo !== undefined &&
                dealerRevealComplete &&
                calculateHandValue(roundOverInfo.dealersHand)}
              {roundOverInfo === undefined &&
                calculateHandValue(new Array(gameState.dealersVisibleCard!))}
              {roundOverInfo !== undefined &&
                !dealerRevealComplete &&
                calculateHandValue(new Array(gameState.dealersVisibleCard!))}
            </div>
          </div>
          <div className="flex justify-center">
            <DealerHand
              visibleCard={gameState.dealersVisibleCard}
              fullHand={roundOverInfo?.dealersHand ?? null}
              onRevealComplete={() => {
                setDealerRevealComplete(true);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {playersHandsArray.map(([player, cards], index) => (
          <div
            key={player.socketId}
            className="bg-secondary-light p-4 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-bold mb-1 flex items-center">
              <span
                className={
                  gameState.currentTurn?.socketId === player.socketId &&
                  roundOverInfo === undefined
                    ? "text-green-500"
                    : "text-primary"
                }
              >
                {player.name}
              </span>
              {calculateHandValue(cards) > 21 && (
                  <span className="ml-2 px-2 py-1 text-sm font-semibold rounded bg-red-600 text-white">
                    Bust
                  </span>
                )}
            </h3>
            <p className="text-accent mb-2 font-semibold">
              ${findBetBySocketId(gameState.bets, player.socketId)}
            </p>
            {renderStackedCards(cards, player.socketId)}
            <div className="flex">
              <div className="flex justify-center items-center w-12 h-6 rounded-full bg-primary text-white text-lg font-bold shadow-lg">
                {calculateHandValue(cards)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameControls;

interface RoundOverDisplayProps {
  roundOverInfo: RoundOverInfo;
  onStartNewRound: () => void;
}

const RoundOverDisplay: React.FC<RoundOverDisplayProps> = ({
  roundOverInfo,
  onStartNewRound,
}) => {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (roundOverInfo !== undefined) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      const startNewRoundTimer = setTimeout(() => {
        onStartNewRound();
      }, 6000);

      return () => {
        clearInterval(timer);
        clearTimeout(startNewRoundTimer);
      };
    }
  }, [roundOverInfo, onStartNewRound]);

  return (
    <div className="bg-secondary-light text-primary p-4 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-2">Round Over</h2>
      <p className="text-lg">
        New round starting in <span className="font-bold">{timeLeft}</span>{" "}
        seconds...
      </p>
    </div>
  );
};
