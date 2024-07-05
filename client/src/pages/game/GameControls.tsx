import React from "react";
import { socket } from "../../socket";
import { ClientGameState } from "../../models/game_state";
import { Player } from "../../models/player";
import { Card } from "../../models/card";
import { RoundOverInfo } from "../../models/round_over_info";
import "../../index.css";
import { calculateHandValue, findBetBySocketId } from "../../models/utils";

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

  function getCardImage(card: Card): string {
    return `/assets/images/cards/${card.value.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
  }

  const renderStackedCards = (cards: Card[]) => {
    return (
      <div className="relative h-[190px] w-[150px]">
        {cards.map((card, index) => (
          <img
            key={index}
            src={getCardImage(card)}
            alt={`${card.value} of ${card.suit}`}
            className="absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out hover:-translate-y-6"
            style={{
              left: `${index * 25}px`,
              zIndex: index,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      {roundOverInfo !== undefined && (
        <div className="bg-secondary-light text-primary p-4 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-2">Round Over</h2>
          {Array.from(roundOverInfo.results.entries()).map(
            ([player, result]) => (
              <div key={player.socketId} className="mb-1">
                <span className="font-semibold">{player.name}:</span> {result}
              </div>
            )
          )}
          <button
            onClick={onStartNewRound}
            className="mt-4 bg-primary text-secondary font-bold py-2 px-4 rounded hover:bg-primary-light transition-colors duration-300"
          >
            New Round
          </button>
        </div>
      )}

      {gameState.currentTurn?.socketId === socket.id &&
        roundOverInfo === undefined && (
          <div className="fixed bottom-0 left-0 right-0 bg-secondary-dark p-4 flex justify-center space-x-4 z-10">
            <button
              onClick={onHit}
              className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
            >
              Hit
            </button>
            <button
              onClick={onStand}
              className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
            >
              Stand
            </button>
            <button
              onClick={onDouble}
              className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
            >
              Double
            </button>
          </div>
        )}

      {roundOverInfo === undefined && (
        <div className="bg-secondary text-accent p-4 rounded-lg shadow-lg mb-6 text-center">
          <h2 className="text-xl font-semibold">
            Current Phase: {gameState.currentPhase}
          </h2>
        </div>
      )}

      {gameState.dealersVisibleCard && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Dealer</h2>
          <div className="flex justify-center">
            {roundOverInfo === undefined ? (
              <div className="relative h-[190px] w-[150px]">
                <img
                  src={getCardImage(gameState.dealersVisibleCard)}
                  alt={`Dealer's card: ${gameState.dealersVisibleCard.value} of ${gameState.dealersVisibleCard.suit}`}
                  className="absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out hover:-translate-y-6"
                />
                <img
                  src="/assets/images/cards/back_of_card.png"
                  alt="Dealer's hidden card"
                  className="absolute w-[100px] h-[150px] transition-all duration-300 ease-in-out hover:-translate-y-6"
                  style={{ left: "25px", zIndex: 1 }}
                />
              </div>
            ) : (
              renderStackedCards(roundOverInfo.dealersHand)
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {playersHandsArray.map(([player, cards], index) => (
          <div
            key={player.socketId}
            className="bg-secondary-light p-4 rounded-lg shadow-lg"
          >
            <h3
              className={`text-xl font-bold mb-1 ${
                gameState.currentTurn?.socketId === player.socketId &&
                roundOverInfo === undefined
                  ? "text-green-500"
                  : "text-primary"
              }`}
            >
              {player.name}
            </h3>
            <p className="text-accent mb-2">
              Bet: ${findBetBySocketId(gameState.bets, player.socketId)}
            </p>
            {renderStackedCards(cards)}
            <p className="text-accent">
              Hand Value: {calculateHandValue(cards)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameControls;
