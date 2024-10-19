interface Player {
  socketId: string;
  name: string;
  userId: number;
}

export enum PlayerAction {
  Hit = "hit",
  Stand = "stand",
  Double = "double",
}

export default Player;