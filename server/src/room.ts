import Game from "./game";
import { ServerGameState } from "./models/game_state";
import Player from "./models/player";
import { User } from "./models/user";

enum PlayerAction { // no double for now
  Hit = "hit",
  Stand = "stand",
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
    this.game.addPlayer(player);
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

    this.game.removePlayer(playerSocketId);
  }

  hasPlayer(playerSocketId: string): boolean {
    return this.players.some((player) => player.socketId === playerSocketId);
  }

  performAction(playerSocketId: string, action: PlayerAction): ServerGameState {
    if (this.game.state.currentTurn.socketId !== playerSocketId) {
      return this.game.state;
    }
    console.log("performing action: ", action);

    switch (action) {
      case PlayerAction.Hit:
        break;
      case PlayerAction.Stand:
        break;
    }

    return this.game.state;
  }

  placeBet(
    playerSocketId: string,
    betAmount: number,
    user: User
  ): ServerGameState {
    // if same state is returned, then bet was not placed
    const player = this.getPlayer(playerSocketId);
    if (!player) {
      return this.game.state;
    }
    if (this.game.state.bets.has(player)) {
      return this.game.state;
    }

    // Check if player has enough balance to place bet
    // if (user.balance < betAmount) { TODO: uncomment in prod
    //   return this.game.state;
    // }

    this.game.placeBet(player, betAmount);

    if (this.allBetsPlaced()) {
      this.game.state.currentPhase = "Playing";
      this.game.dealFirstCards();
    }

    return this.game.state;
  }

  private allBetsPlaced(): boolean {
    return this.players.every((player) => this.game.state.bets.has(player));
  }
}

export default Room;
