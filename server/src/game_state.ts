import { Card } from "./card";
import Player from "./player";

export interface ServerGameState {
  deck: Card[];
  dealersHand: Card[];
  currentTurn: Player;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;
}

export interface ClientGameState {
  dealersVisibleCard: Card | null;
  currentTurn: Player | null;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;
}

