import React from "react";
import { ClientGameState } from "../../models/game_state";
import { Player } from "../../models/player";
import { findBetBySocketId } from "../../models/utils";
import { User, DollarSign } from "lucide-react";

interface PlayerListProps {
  gameState: ClientGameState;
}

const PlayerList: React.FC<PlayerListProps> = ({ gameState }) => {
  const playersHandsArray = Array.from(gameState.playersHands.entries());

  return (
    <div className="absolute top-5 right-5 bg-secondary-light text-primary p-4 rounded-lg shadow-lg w-64">
      <h3 className="text-lg font-bold mb-4 text-accent flex items-center">
        <User size={20} className="mr-2" />
        Players
      </h3>
      {playersHandsArray.map(([player]) => (
        <div
          key={player.socketId}
          className="p-2 border-b border-primary last:border-b-0"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold">{player.name}</span>
            {gameState.currentTurn?.socketId === player.socketId && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Players Turn
              </span>
            )}
          </div>
          <div className="text-sm text-accent mt-1">
            Bet: ${findBetBySocketId(gameState.bets, player.socketId)}
          </div>
        </div>
      ))}
    </div>
  );
};
export default PlayerList;
