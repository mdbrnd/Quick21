import Room from "./room";

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  generateRoomId(): string { // Random 6-digit number from 100k to 999k
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createRoom(playerSocketId: string, playerName: string): Room {
    const roomId = this.generateRoomId();
    const room = new Room(roomId, playerSocketId, playerName);
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, playerSocketId: string, playerName: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.addPlayer(playerSocketId, playerName);
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
}

export default RoomManager;