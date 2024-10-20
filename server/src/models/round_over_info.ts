import { Card } from "./card";
import Player from "./player";
import { serializeMap } from "../utils";

export enum RoundResult {
  Win = "Win",
  Lose = "Lose",
  Tie = "Tie",
  Blackjack = "Blackjack", // Player won with blackjack, 1.5x payout
}

export class RoundOverInfo {
  results: Map<Player, RoundResult>;
  dealersHand: Card[];
  balanceChanges: Map<Player, number>;

  constructor(
    results: Map<Player, RoundResult>,
    dealersHand: Card[],
    balanceChanges: Map<Player, number>
  ) {
    this.results = results;
    this.dealersHand = dealersHand;
    this.balanceChanges = balanceChanges;
  }

  toDTO() {
    return {
      results: serializeMap(this.results),
      dealersHand: this.dealersHand,
      balanceChanges: serializeMap(this.balanceChanges),
    };
  }
}
