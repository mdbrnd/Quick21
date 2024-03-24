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
    constructor(roomId, initialPlayer) {
        this.players = [];
        // The initial playerSocketId is the player who created the room
        this.id = roomId;
        this.players.push(initialPlayer);
        this.currentPlayer = this.players[0];
        this.game = new game_1.default(initialPlayer);
    }
    addPlayer(player) {
        this.players.push(player);
    }
    removePlayer(playerSocketId) {
        const index = this.players.findIndex((player) => player.socketId === playerSocketId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }
    hasPlayer(playerSocketId) {
        return this.players.some((player) => player.socketId === playerSocketId);
    }
    performAction(playerSocketId, action) {
        if (this.currentPlayer.socketId !== playerSocketId) {
            return { success: false, updatedGameState: this.game.state };
        }
        switch (action) {
            case PlayerAction.Hit:
                break;
            case PlayerAction.Stand:
                break;
            case PlayerAction.Insurance:
                break;
        }
        return { success: true, updatedGameState: this.game.state };
    }
}
exports.default = Room;
