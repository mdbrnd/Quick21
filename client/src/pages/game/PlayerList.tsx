import React, { useState } from "react";
import { ClientGameState } from "../../models/game_state";
import { User, ChevronUp, ChevronDown } from "lucide-react";
import { findBetBySocketId } from "../../models/utils";

interface PlayerListProps {
  gameState: ClientGameState;
}

const PlayerList: React.FC<PlayerListProps> = ({ gameState }) => {
  const playersHandsArray = Array.from(gameState.playersHands.entries());
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`absolute top-5 right-5 bg-secondary-light text-primary p-4 rounded-lg shadow-lg w-64 transition-all duration-300 ${
        isCollapsed ? "h-12 overflow-hidden" : "h-auto"
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-bold text-accent flex items-center">
          <User size={20} className="mr-2" />
          Players
        </h3>
        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </div>
      {!isCollapsed && (
        <div className="mt-4">
          {playersHandsArray.map(([player]) => (
            <div
              key={player.socketId}
              className="p-2 border-b border-primary last:border-b-0 flex items-center"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  player.name
                )}&background=random`}
                alt={`${player.name}'s avatar`}
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{player.name}</span>
                  {gameState.currentTurn?.socketId === player.socketId && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      Turn
                    </span>
                  )}
                </div>
                <div className="text-sm text-accent mt-1">
                  Bet: ${findBetBySocketId(gameState.bets, player.socketId)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
