"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("./game"));
var PlayerAction;
(function (PlayerAction) {
    PlayerAction["Hit"] = "hit";
    PlayerAction["Stand"] = "stand";
    PlayerAction["Insurance"] = "insurance";
})(PlayerAction || (PlayerAction = {}));
class Room {
    constructor(roomId, playerSocketId, playerName) {
        this.players = [];
        // The initial playerSocketId is the player who created the room
        this.id = roomId;
        this.players.push({ socketId: playerSocketId, name: playerName });
        this.game = new game_1.default({ socketId: playerSocketId, name: playerName });
    }
    addPlayer(playerSocketId, playerName) {
        this.players.push({ socketId: playerSocketId, name: playerName });
    }
    removePlayer(playerSocketId) {
        const index = this.players.findIndex((player) => player.socketId === playerSocketId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }
    performAction(playerSocketId, action) {
        switch (action) {
            case PlayerAction.Hit:
                break;
            case PlayerAction.Stand:
                break;
            case PlayerAction.Insurance:
                break;
        }
    }
}
exports.default = Room;
