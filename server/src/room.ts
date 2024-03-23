class Room {
  public id: string;
  public playerSocketIds: string[] = [];

  constructor(roomId: string, playerSocketId: string) {
    // The initial playerSocketId is the player who created the room
    this.id = roomId;
    this.playerSocketIds.push(playerSocketId);
  }

  addPlayer(playerSocketId: string) {
    this.playerSocketIds.push(playerSocketId);
  }

  removePlayer(playerSocketId: string) {
    const index = this.playerSocketIds.indexOf(playerSocketId);
    if (index !== -1) {
      this.playerSocketIds.splice(index, 1);
    }
  }
}
