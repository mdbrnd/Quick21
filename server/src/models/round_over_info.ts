import { Card } from "./card";

export enum RoundResult {
  Win = "Win",
  Lose = "Lose",
  Tie = "Tie",
  Blackjack = "Blackjack", // player won with blackjack
}

export class RoundOverInfo {
  results: Map<string, RoundResult>;
  dealersHand: Card[];
  updatedBalances: Map<string, number>;

  constructor(
    results: Map<string, RoundResult>,
    dealersHand: Card[],
    updatedBalances: Map<string, number>
  ) {
    this.results = results;
    this.dealersHand = dealersHand;
    this.updatedBalances = updatedBalances;
  }

  toDTO() {
    return {
      results: serializeMap(this.results),
      dealersHand: this.dealersHand,
      updatedBalances: serializeMap(this.updatedBalances),
    };
  }
}
