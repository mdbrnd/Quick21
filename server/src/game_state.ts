import { Card } from "./card";
import Player from "./player";

export interface GameState {
  deck: Card[];
  playersHands: Map<Player, Card[]>;
  dealersHand: Card[];
}
