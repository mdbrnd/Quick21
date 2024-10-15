import React from "react";
import { ClientGameState } from "../../models/game_state";
import { Player } from "../../models/player";
import { findBetBySocketId } from "../../models/utils";
import { User, DollarSign, Clock } from "lucide-react";

interface PlayerListProps {
  gameState: ClientGameState;
}

const PlayerList: React.FC<PlayerListProps> = ({ gameState }) => {
  const playersHandsArray = Array.from(gameState.playersHands.entries());
  console.log("gameState pahe", gameState.currentPhase);
  const showCurrentTurn =
    gameState.currentPhase !== "Betting" &&
    gameState.currentPhase !== "RoundOver";

  return (
    <div className="absolute top-5 right-5 w-80 bg-secondary-light text-primary rounded-lg shadow-lg overflow-hidden">
      <div className="bg-secondary-light px-4 py-3 border-b border-primary">
        <h3 className="text-lg font-bold flex items-center text-accent">
          <User size={20} className="mr-2" />
          Players
        </h3>
      </div>
      <div className="divide-y divide-primary">
        {playersHandsArray.map(([player]) => (
          <PlayerItem
            key={player.socketId}
            player={player}
            gameState={gameState}
            showCurrentTurn={showCurrentTurn}
          />
        ))}
      </div>
    </div>
  );
};

interface PlayerItemProps {
  player: Player;
  gameState: ClientGameState;
  showCurrentTurn: boolean;
}

const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  gameState,
  showCurrentTurn,
}) => {
  const isCurrentTurn =
    showCurrentTurn && gameState.currentTurn?.socketId === player.socketId;
  const bet = findBetBySocketId(gameState.bets, player.socketId);

  return (
    <div className="flex items-center space-x-4 p-4">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary font-semibold text-sm">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{player.name}</span>
          {isCurrentTurn && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center animate-pulse">
              <Clock size={12} className="mr-1" />
              Players Turn
            </span>
          )}
        </div>
        <div className="text-sm text-accent mt-1 flex items-center">
          Bet: ${bet}
        </div>
      </div>
    </div>
  );
};

export default PlayerList;
