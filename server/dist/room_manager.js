"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = __importDefault(require("./room"));
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    generateRoomId() {
        // Random 6-digit number from 100k to 999k
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    createRoom(initialPlayer) {
        const roomId = this.generateRoomId();
        const room = new room_1.default(roomId, initialPlayer);
        this.rooms.set(roomId, room);
        return room;
    }
    joinRoom(roomId, player) {
        const room = this.rooms.get(roomId);
        if (room) {
            // Only add player if room is not full and player is not already in room
            if (room.players.length > 4 || room.hasPlayer(player.socketId)) {
                return false;
            }
            room.addPlayer(player);
            return true;
        }
        return false;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    closeRoom(roomId) {
        return this.rooms.delete(roomId);
    }
    getRoomThatPlayerIsIn(playerSocketId) {
        for (let [roomId, room] of this.rooms) {
            if (room.players.find((player) => player.socketId === playerSocketId)) {
                return room;
            }
        }
        return undefined;
    }
}
exports.default = RoomManager;
