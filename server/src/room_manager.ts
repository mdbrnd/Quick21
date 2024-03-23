class RoomManager {
  private rooms: Map<string, Room> = new Map();

  generateRoomId(): string { // Random 6-digit number from 100k to 999k
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createRoom(playerSocketId: string): Room {
    const roomId = this.generateRoomId();
    const room = new Room(roomId, playerSocketId);
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, playerSocketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      room.addPlayer(playerSocketId);
      return true;
    }
    return false;
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  closeRoom(roomId: string) {
    this.rooms.delete(roomId);
  }
}