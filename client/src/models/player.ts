export interface Player {
  socketId: string;
  name: string;
}

export enum PlayerAction { // no double for now
  Hit = "hit",
  Stand = "stand",
}