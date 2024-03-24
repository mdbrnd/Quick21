import Game from "./game";
import { GameState } from "./game_state";
import Player from "./player";

enum PlayerAction { // no double for now
  Hit = "hit",
  Stand = "stand",
  Insurance = "insurance",
}

interface GameActionResponse {
  success: boolean;
  updatedGameState: GameState;
}

class Room {
  public id: string;
  public players: Player[] = [];
  public currentPlayer: Player;
  public game: Game;

  constructor(roomId: string, initialPlayer: Player) {
    // The initial playerSocketId is the player who created the room
    this.id = roomId;
    this.players.push(initialPlayer);
    this.currentPlayer = this.players[0];
    this.game = new Game(initialPlayer);
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(playerSocketId: string) {
    const index = this.players.findIndex(
      (player) => player.socketId === playerSocketId
    );
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  hasPlayer(playerSocketId: string): boolean {
    return this.players.some((player) => player.socketId === playerSocketId);
  }

  performAction(playerSocketId: string, action: PlayerAction): GameActionResponse {
    if (this.currentPlayer.socketId !== playerSocketId) {
      return { success: false, updatedGameState: this.game.state };
    }

    switch (action) {
      case PlayerAction.Hit:
        break;
      case PlayerAction.Stand:
        break;
      case PlayerAction.Insurance:
        break;
    }

    return { success: true, updatedGameState: this.game.state };
  }
}

export default Room;
