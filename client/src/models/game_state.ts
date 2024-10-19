import { Card } from "./card";
import { Player } from "./player";
import { deserializeMap, serializeMap } from "../utils";

export class ClientGameState {
  gameStarted: boolean;
  dealersVisibleCard: Card | null;
  currentTurn: Player | null;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;

  constructor(
    gameStarted: boolean,
    dealersVisibleCard: Card | null,
    currentTurn: Player | null,
    playersHands: Map<Player, Card[]>,
    currentPhase: "Betting" | "Playing" | "RoundOver",
    bets: Map<Player, number>
  ) {
    this.gameStarted = gameStarted;
    this.dealersVisibleCard = dealersVisibleCard;
    this.currentTurn = currentTurn;
    this.playersHands = playersHands;
    this.currentPhase = currentPhase;
    this.bets = bets;
  }

  toDTO() {
    return {
      gameStarted: this.gameStarted,
      dealersVisibleCard: this.dealersVisibleCard,
      currentTurn: this.currentTurn,
      playersHands: serializeMap(this.playersHands),
      currentPhase: this.currentPhase,
      bets: serializeMap(this.bets),
    };
  }

  static fromDTO(data: any): ClientGameState {
    return new ClientGameState(
      data.gameStarted,
      data.dealersVisibleCard,
      data.currentTurn,
      deserializeMap(data.playersHands) as Map<Player, Card[]>,
      data.currentPhase,
      deserializeMap(data.bets) as Map<Player, number>
    );
  }
}
