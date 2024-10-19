import Player from "./models/player";
import Room from "./room";

const MAX_PLAYERS = 5;

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  public generateRoomCode(): string {
    let isUnique = false;
    let roomCode = "";
    while (isUnique === false) {
      // Random 6-digit number from 100k to 999k
      roomCode = Math.floor(100000 + Math.random() * 900000).toString();

      if (this.rooms.has(roomCode) === false) {
        isUnique = true;
      }
    }
    return roomCode;
  }

  public createRoom(initialPlayer: Player): Room {
    const roomCode = this.generateRoomCode();
    const room = new Room(roomCode, initialPlayer);
    this.rooms.set(roomCode, room);
    return room;
  }

  public joinRoom(roomCode: string, player: Player): [success: boolean, errorMessage: string | undefined] {
    const room = this.rooms.get(roomCode);
    if (room) {
      // Only add player if room is not full, player is not already in room and round is not in progress
      if (room.players.length >= MAX_PLAYERS) {
        return [false, "Room is full."];
      }

      if (
        room.hasPlayerUserId(player.userId)
      ) {
        return [false, "Player is already in room."];
      }

      if (
        room.game.state.currentPhase !== "Betting"
      ) {
        return [false, "Round is already in progress. Wait for the next round to begin, then try joining again."];
      }

      room.addPlayer(player);
      return [true, undefined];
    }
    return [false, "Room not found."];
  }

  public getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  public closeRoom(roomCode: string): boolean {
    return this.rooms.delete(roomCode);
  }

  public getRoomThatPlayerIsIn(playerSocketId: string): Room | undefined {
    for (let [roomCode, room] of this.rooms) {
      if (room.players.find((player) => player.socketId === playerSocketId)) {
        return room;
      }
    }
    return undefined;
  }
}

export default RoomManager;
