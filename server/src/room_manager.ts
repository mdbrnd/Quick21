import Player from "./models/player";
import Room from "./room";

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  generateRoomCode(): string {
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

  createRoom(initialPlayer: Player): Room {
    const roomCode = this.generateRoomCode();
    const room = new Room(roomCode, initialPlayer);
    this.rooms.set(roomCode, room);
    return room;
  }

  joinRoom(roomCode: string, player: Player): boolean {
    const room = this.rooms.get(roomCode);
    if (room) {
      // Only add player if room is not full and player is not already in room
      if (room.players.length >= 5 || room.hasPlayer(player.socketId)) {
        return false;
      }

      room.addPlayer(player);
      return true;
    }
    return false;
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  closeRoom(roomCode: string): boolean {
    return this.rooms.delete(roomCode);
  }

  getRoomThatPlayerIsIn(playerSocketId: string): Room | undefined {
    for (let [roomCode, room] of this.rooms) {
      if (room.players.find((player) => player.socketId === playerSocketId)) {
        return room;
      }
    }
    return undefined;
  }
}

export default RoomManager;
