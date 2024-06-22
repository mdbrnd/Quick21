import { Card } from "./card";
import Player from "./player";
import { serializeMap } from "./utils";

export enum RoundResult {
  Win = "Win",
  Lose = "Lose",
  Tie = "Tie",
  Blackjack = "Blackjack", // player won with blackjack
}

export class RoundOverInfo {
  results: Map<Player, RoundResult>;
  dealersHand: Card[];
  updatedBalances: Map<Player, number>;

  constructor(
    results: Map<Player, RoundResult>,
    dealersHand: Card[],
    updatedBalances: Map<Player, number>
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
