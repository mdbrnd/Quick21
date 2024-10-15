import { DBManager } from "./database/dbmanager";
import Game from "./game";
import { ServerGameState } from "./models/game_state";
import Player, { PlayerAction } from "./models/player";
import { RoundOverInfo } from "./models/round_over_info";
import { User } from "./models/user";

const dbManager = new DBManager();

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

  // could unify the two hasPlayer functions into one, but this is more readable
  hasPlayer(playerSocketId: string): boolean {
    return this.players.some((player) => player.socketId === playerSocketId);
  }

  hasPlayerUserId(userId: number): boolean {
    return this.players.some((player) => player.userId === userId);
  }

  async performAction(
    playerSocketId: string,
    action: PlayerAction,
    user: User | undefined
  ): Promise<[state: ServerGameState, roundOver: RoundOverInfo | undefined]> {
    if (this.game.state.currentTurn.socketId !== playerSocketId) {
      return [this.game.state, undefined];
    }

    console.log("performing action: ", action);

    switch (action) {
      case PlayerAction.Hit:
        this.game.hit(playerSocketId);
        break;
      case PlayerAction.Double:
        this.game.hit(playerSocketId);

        if (!user) {
          return [this.game.state, undefined];
        }

        let player = this.getPlayer(playerSocketId);
        if (!player) {
          return [this.game.state, undefined];
        }

        console.log(
          "placing bet to double: ",
          this.game.state.bets.get(player)! * 2
        );

        this.placeBet(
          playerSocketId,
          this.game.state.bets.get(player)! * 2,
          user
        );
        break;
      case PlayerAction.Stand: // do nothing as player is standing
        break;
    }

    if (this.game.shouldRoundEnd(action)) {
      this.game.state.currentPhase = "RoundOver";
      let roundOverInfo = this.game.endRound();
      await this.updatePlayerBalances(roundOverInfo);
      return [this.game.state, roundOverInfo];
    }

    this.game.shouldNextTurn(action);

    // TODO: add tests, like a simulation game
    // Check if next player has blackjack; repeated code is a bit ugly, might change in the future
    const nextPlayer = this.game.state.currentTurn;
    const nextPlayerHand = this.game.state.playersHands.get(nextPlayer);
    if (nextPlayerHand && this.game.calculateHandValue(nextPlayerHand) === 21 && this.game.state.currentPhase == "Playing") {
      if (this.game.isLastTurn()) {
        this.game.state.currentPhase = "RoundOver";
        let roundOverInfo = this.game.endRound();
        await this.updatePlayerBalances(roundOverInfo);
        return [this.game.state, roundOverInfo];
      } else {
        this.game.shouldNextTurn(PlayerAction.Stand);
      }
    }

    return [this.game.state, undefined];
  }

  public async updatePlayerBalances(
    roundOverInfo: RoundOverInfo
  ): Promise<RoundOverInfo> {
    // Update balances in the database
    for (const [player, balanceChange] of roundOverInfo.updatedBalances) {
      const user = await dbManager.getUser(player.userId);
      if (user) {
        const newBalance = user.balance + balanceChange;
        await dbManager.updateUserBalance(user.id, newBalance);

        // Update the player's balance in the game state
        player.balance = newBalance;
        console.log(player, " new balance: ", newBalance);
      }
    }

    return roundOverInfo;
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

    // If you already bet, you can't bet again except for if you double during the round
    if (
      this.game.state.bets.has(player) &&
      this.game.state.currentPhase == "Betting"
    ) {
      const currentBet = this.game.state.bets.get(player);
      if (currentBet && currentBet > 0) {
        return this.game.state;
      }
    }

    console.log("checking balance");

    // Check if player has enough balance to place bet
    if (user.balance < betAmount) {
      return this.game.state;
    }

    console.log("placing bet");

    this.game.placeBet(player, betAmount);

    if (this.allBetsPlaced() && this.game.state.currentPhase == "Betting") {
      this.game.state.currentPhase = "Playing";
      this.game.dealFirstCards();
    }

    return this.game.state;
  }

  private allBetsPlaced(): boolean {
    return this.players.every((player) => {
      const bet = this.game.state.bets.get(player);
      return bet !== undefined && bet > 0;
    });
  }
}

export default Room;
