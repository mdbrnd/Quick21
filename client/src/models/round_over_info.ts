import { Card } from "./card";
import { Player } from "./player";
import { deserializeMap } from "../utils";

// Enums are used with strings instead of ints for better serialization when transferring data
export enum RoundResult {
  Win = "Win",
  Lose = "Lose",
  Tie = "Tie",
  Blackjack = "Blackjack", // player won with blackjack
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

  static fromDTO(data: any) {
    return {
      results: deserializeMap(data.results) as Map<Player, RoundResult>,
      dealersHand: data.dealersHand,
      balanceChanges: deserializeMap(data.balanceChanges) as Map<
        Player,
        number
      >,
    };
  }
}
