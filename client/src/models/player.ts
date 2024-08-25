export interface Player {
  socketId: string;
  name: string;
  balance: number;
  userId: number;
}

export enum PlayerAction {
  Hit = "hit",
  Stand = "stand",
  Double = "double",
}