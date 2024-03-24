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
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    createRoom(playerSocketId, playerName) {
        const roomId = this.generateRoomId();
        const room = new room_1.default(roomId, playerSocketId, playerName);
        this.rooms.set(roomId, room);
        return room;
    }
    joinRoom(roomId, playerSocketId, playerName) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.addPlayer(playerSocketId, playerName);
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
}
exports.default = RoomManager;
