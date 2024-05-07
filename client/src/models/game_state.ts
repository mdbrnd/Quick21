import { Card } from "./card";
import Player from "./player";

export class ClientGameState {
  dealersVisibleCard: Card | null;
  currentTurn: Player | null;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;

  constructor(
    dealersVisibleCard: Card | null,
    currentTurn: Player | null,
    playersHands: Map<Player, Card[]>,
    currentPhase: "Betting" | "Playing" | "RoundOver",
    bets: Map<Player, number>
  ) {
    this.dealersVisibleCard = dealersVisibleCard;
    this.currentTurn = currentTurn;
    this.playersHands = playersHands;
    this.currentPhase = currentPhase;
    this.bets = bets;
  }

  toSerializedFormat() {
    return {
      dealersVisibleCard: this.dealersVisibleCard,
      currentTurn: this.currentTurn,
      playersHands: serializeMap(this.playersHands),
      currentPhase: this.currentPhase,
      bets: serializeMap(this.bets),
    };
  }

  static fromSerializedFormat(data: any): ClientGameState {
    return new ClientGameState(
      data.dealersVisibleCard,
      data.currentTurn,
      deserializeMap(data.playersHands) as Map<Player, Card[]>,
      data.currentPhase,
      deserializeMap(data.bets) as Map<Player, number>
    );
  }
}

const serializeMap = (map: Map<any, any>) => {
  return Array.from(map.entries());
};

const deserializeMap = (array: any[]) => {
  return new Map(array);
};