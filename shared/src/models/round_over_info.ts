import { Card } from "./card";

export enum RoundResult {
  Win = "Win",
  Lose = "Lose",
  Tie = "Tie",
  Blackjack = "Blackjack", // player won with blackjack
}

export interface RoundOverInfo {
  results: Map<string, RoundResult>;
  dealerHand: Card[];
  updatedBalances: Map<string, number>;
}
