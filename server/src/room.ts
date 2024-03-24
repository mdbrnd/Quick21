import Game, { GameState } from "./game";
import Player from "./player";

enum PlayerAction { // no double for now
  Hit = "hit",
  Stand = "stand",
  Insurance = "insurance",
}

interface ActionResponse {
  success: boolean;
  updatedGameState: GameState;
}

class Room {
  public id: string;
  public players: Player[] = [];
  public currentPlayer: Player;
  public game: Game;

  constructor(roomId: string, playerSocketId: string, playerName: string) {
    // The initial playerSocketId is the player who created the room
    this.id = roomId;
    this.players.push({ socketId: playerSocketId, name: playerName });
    this.currentPlayer = this.players[0];
    this.game = new Game({socketId: playerSocketId, name: playerName});
  }

  addPlayer(playerSocketId: string, playerName: string) {
    this.players.push({ socketId: playerSocketId, name: playerName });
  }

  removePlayer(playerSocketId: string) {
    const index = this.players.findIndex(
      (player) => player.socketId === playerSocketId
    );
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  performAction(playerSocketId: string, action: PlayerAction): ActionResponse {

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
