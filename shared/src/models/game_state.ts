import { Card } from "./card";
import { Player } from "./player";

export class ServerGameState {
  deck: Card[];
  dealersHand: Card[];
  currentTurn: Player;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;

  constructor(
    deck: Card[],
    dealersHand: Card[],
    currentTurn: Player,
    playersHands: Map<Player, Card[]>,
    currentPhase: "Betting" | "Playing" | "RoundOver",
    bets: Map<Player, number>
  ) {
    this.deck = deck;
    this.dealersHand = dealersHand;
    this.currentTurn = currentTurn;
    this.playersHands = playersHands;
    this.currentPhase = currentPhase;
    this.bets = bets;
  }

  toClientGameState(): ClientGameState {
    const dealersVisibleCard = this.dealersHand[0];
    return new ClientGameState(
      dealersVisibleCard,
      this.currentTurn,
      this.playersHands,
      this.currentPhase,
      this.bets
    );
  }
}

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
