import Game from "./game";
import { GameState } from "./game_state";
import Player from "./player";

enum PlayerAction { // no double for now
  Hit = "hit",
  Stand = "stand",
  Insurance = "insurance", // TODO: extract this to a separate enum
}

class Room {
  public code: string;
  public players: Player[] = [];
  public owner: Player;
  public game: Game;

  constructor(roomCode: string, initialPlayer: Player) {
    // The initial playerSocketId is the player who created the room
    this.code = roomCode;
    this.players.push(initialPlayer);
    this.owner = initialPlayer;
    this.game = new Game(initialPlayer);
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  getPlayer(playerSocketId: string): Player | undefined {
    return this.players.find((player) => player.socketId === playerSocketId);
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

  performAction(
    playerSocketId: string,
    action: PlayerAction
  ): GameState {
    if (this.game.state.currentTurn.socketId !== playerSocketId) {
      return this.game.state;
    }

    switch (action) {
      case PlayerAction.Hit:
        break;
      case PlayerAction.Stand:
        break;
      case PlayerAction.Insurance:
        break;
    }

    return this.game.state;
  }

  placeBet(playerSocketId: string, betAmount: number): GameState { //TODO: implement this
    const player = this.getPlayer(playerSocketId);
    if (!player) {
      return this.game.state;
    }

    //this.game.placeBet(player, betAmount);

    return this.game.state;
  }
}

export default Room;
