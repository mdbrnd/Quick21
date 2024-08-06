export interface Player {
  socketId: string;
  name: string;
  balance: number;
  userId: number;
}

export enum PlayerAction { // no double for now
  Hit = "hit",
  Stand = "stand",
}