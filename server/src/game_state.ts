import { Card } from "./card";
import Player from "./player";

export interface GameState {
  deck: Card[];
  currentTurn: Player;
  playersHands: Map<Player, Card[]>;
  dealersHand: Card[];
  currentPhase: "Betting" | "Playing" | "GameOver";
  bets: Map<Player, number>;
}
