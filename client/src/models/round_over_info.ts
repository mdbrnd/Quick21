import { Card } from "./card";
import { Player } from "./player";
import { deserializeMap } from "./utils";

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

  static fromDTO(data: any) {
    return {
      results: deserializeMap(data.results) as Map<Player, RoundResult>,
      dealersHand: data.dealersHand,
      updatedBalances: deserializeMap(data.updatedBalances) as Map<
        Player,
        number
      >,
    };
  }
}
