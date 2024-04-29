import { Card } from "./card";
import Player from "./player";

export class ServerGameState {
  deck: Card[];
  dealersHand: Card[];
  currentTurn: Player;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;

  constructor(
    deck: Card[],
    dealersHand: Card[],
    currentTurn: Player,
    playersHands: Map<Player, Card[]>,
    currentPhase: "Betting" | "Playing" | "RoundOver",
    bets: Map<Player, number>
  ) {
    this.deck = deck;
    this.dealersHand = dealersHand;
    this.currentTurn = currentTurn;
    this.playersHands = playersHands;
    this.currentPhase = currentPhase;
    this.bets = bets;
  }

  toClientGameState(): ClientGameState {
    return {
      dealersVisibleCard: this.dealersHand[0],
      currentTurn: this.currentTurn,
      playersHands: this.playersHands,
      currentPhase: this.currentPhase,
      bets: this.bets,
    };
  }
}

export interface ClientGameState {
  dealersVisibleCard: Card | null;
  currentTurn: Player | null;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;
}
