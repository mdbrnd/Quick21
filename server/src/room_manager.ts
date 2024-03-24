import Player from "./player";
import Room from "./room";

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  generateRoomId(): string {
    // Random 6-digit number from 100k to 999k
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createRoom(initialPlayer: Player): Room {
    const roomId = this.generateRoomId();
    const room = new Room(roomId, initialPlayer);
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(
    roomId: string,
    player: Player
  ): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      // Only add player if room is not full and player is not already in room
      if (room.players.length > 4 || room.hasPlayer(player.socketId)){
        return false;
      }

      room.addPlayer(player);
      return true;
    }
    return false;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  closeRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  getRoomThatPlayerIsIn(playerSocketId: string): Room | undefined {
    for (let [roomId, room] of this.rooms) {
      if (room.players.find((player) => player.socketId === playerSocketId)) {
        return room;
      }
    }
    return undefined;
  }
}

export default RoomManager;