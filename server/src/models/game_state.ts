import { Card } from "./card";
import Player from "./player";

export class ServerGameState {
  gameStarted: boolean;
  deck: Card[];
  dealersHand: Card[];
  currentTurn: Player;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;

  constructor(
    gameStarted: boolean,
    deck: Card[],
    dealersHand: Card[],
    currentTurn: Player,
    playersHands: Map<Player, Card[]>,
    currentPhase: "Betting" | "Playing" | "RoundOver",
    bets: Map<Player, number>
  ) {
    this.gameStarted = gameStarted;
    this.deck = deck;
    this.dealersHand = dealersHand;
    this.currentTurn = currentTurn;
    this.playersHands = playersHands;
    this.currentPhase = currentPhase;
    this.bets = bets;
  }

  toDTO() {
    return this.toClientGameState().toSerializedFormat();
  }

  toClientGameState(): ClientGameState {
    const dealersVisibleCard = this.dealersHand[0];
    return new ClientGameState(
      this.gameStarted,
      dealersVisibleCard,
      this.currentTurn,
      this.playersHands,
      this.currentPhase,
      this.bets,
    );
  }
}

export class ClientGameState {
  gameStarted: boolean;
  dealersVisibleCard: Card | null;
  currentTurn: Player | null;
  playersHands: Map<Player, Card[]>;
  currentPhase: "Betting" | "Playing" | "RoundOver";
  bets: Map<Player, number>;

  constructor(
    gameStarted: boolean,
    dealersVisibleCard: Card | null,
    currentTurn: Player | null,
    playersHands: Map<Player, Card[]>,
    currentPhase: "Betting" | "Playing" | "RoundOver",
    bets: Map<Player, number>
  ) {
    this.gameStarted = gameStarted;
    this.dealersVisibleCard = dealersVisibleCard;
    this.currentTurn = currentTurn;
    this.playersHands = playersHands;
    this.currentPhase = currentPhase;
    this.bets = bets;
  }

  toSerializedFormat() {
    return {
      gameStarted: this.gameStarted,
      dealersVisibleCard: this.dealersVisibleCard,
      currentTurn: this.currentTurn,
      playersHands: serializeMap(this.playersHands),
      currentPhase: this.currentPhase,
      bets: serializeMap(this.bets)
    };
  }
}

const serializeMap = (map: Map<any, any>) => {
  return Array.from(map.entries());
};

const deserializeMap = (array: any[]) => {
  return new Map(array);
};