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
})(PlayerAction || (PlayerAction = {}));
class Room {
    constructor(roomCode, initialPlayer) {
        this.players = [];
        // The initial playerSocketId is the player who created the room
        this.code = roomCode;
        this.players.push(initialPlayer);
        this.owner = initialPlayer;
        this.game = new game_1.default(initialPlayer);
    }
    addPlayer(player) {
        this.players.push(player);
    }
    getPlayer(playerSocketId) {
        return this.players.find((player) => player.socketId === playerSocketId);
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
        if (this.game.state.currentTurn.socketId !== playerSocketId) {
            return this.game.state;
        }
        switch (action) {
            case PlayerAction.Hit:
                break;
            case PlayerAction.Stand:
                break;
        }
        return this.game.state;
    }
    placeBet(playerSocketId, betAmount, user) {
        const player = this.getPlayer(playerSocketId);
        if (!player) {
            return this.game.state;
        }
        // Check if player has enough balance to place bet
        // if (user.balance < betAmount) { TODO: uncomment in prod
        //   return this.game.state;
        // }
        this.game.placeBet(player, betAmount);
        return this.game.state;
    }
}
exports.default = Room;
