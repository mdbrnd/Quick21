import React from "react";
import { ClientGameState } from "../../models/game_state";
import { Player } from "../../models/player";
import { findBetBySocketId } from "../../utils";
import {
  User,
  Clock,
  CircleDollarSign,
  HandCoins,
} from "lucide-react";
import { useSocket } from "../../SocketContext";

interface PlayerListProps {
  gameState: ClientGameState;
}

const PlayerList: React.FC<PlayerListProps> = ({ gameState }) => {
  const playersHandsArray = Array.from(gameState.playersHands.entries());
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
  const { userInfo } = useSocket();

  const isStillBetting = (name: string) => {
    if (gameState.currentPhase !== "Betting" || !gameState.gameStarted)
      return false;

    if (gameState.bets === undefined || gameState.bets.size <= 0) return true;

    // Check if the player hasn't bet yet (either their name doesn't exist in the bets map or their bet is 0)
    const playerBet = Array.from(gameState.bets.entries()).find(
      ([player]) => player.name === name
    )?.[1];

    return playerBet === undefined || playerBet === 0;
  };

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
          {isStillBetting(player.name) && (
            <span className="flex items-center text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
              <HandCoins size={12} className="mr-1" />
              Betting
            </span>
          )}
          {userInfo?.name === player.name && (
            <div className="flex items-center bg-primary text-white px-2 py-1 rounded-full text-sm">
              <CircleDollarSign size={16} className="mr-1" />
              <span>${userInfo.balance.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-accent mt-1 flex items-center">
          Bet: ${bet?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default PlayerList;
