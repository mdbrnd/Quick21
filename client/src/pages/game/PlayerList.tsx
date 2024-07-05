import React from "react";
import { ClientGameState } from "../../models/game_state";
import { Player } from "../../models/player";

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
    <div className="absolute top-5 right-5 bg-secondary-light text-primary p-4 rounded-lg shadow-lg w-64">
      <h3 className="text-lg font-bold mb-2 text-accent">Players</h3>
      {playersHandsArray.map(([player, cards], index) => (
        <div
          key={player.socketId}
          className="p-2 border-b border-primary last:border-b-0"
        >
          <div className="font-bold text-primary-light">{player.name}</div>
          <div className="text-sm text-accent flex justify-between items-center mt-1">
            <span>Bet:</span>
            <span className="bg-primary text-secondary px-2 py-1 rounded">
              ${findBetBySocketId(gameState.bets, player.socketId)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
