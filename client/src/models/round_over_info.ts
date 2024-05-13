import { Card } from "./card";
import { deserializeMap } from "./utils";

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

  static fromDTO(data: any) {
    return {
      results: deserializeMap(data.results),
      dealersHand: data.dealersHand,
      updatedBalances: deserializeMap(data.updatedBalances),
    };
  }
}
