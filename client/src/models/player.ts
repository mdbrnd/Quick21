export interface Player {
  socketId: string;
  name: string;
  balance: number;
  userId: number;
}

// Enums are used with strings instead of ints for better serialization when transferring data
export enum PlayerAction {
  Hit = "hit",
  Stand = "stand",
  Double = "double",
}