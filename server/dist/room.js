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
        this.game.addPlayer(player);
    }
    getPlayer(playerSocketId) {
        return this.players.find((player) => player.socketId === playerSocketId);
    }
    removePlayer(playerSocketId) {
        const index = this.players.findIndex((player) => player.socketId === playerSocketId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
        this.game.removePlayer(playerSocketId);
    }
    hasPlayer(playerSocketId) {
        return this.players.some((player) => player.socketId === playerSocketId);
    }
    performAction(playerSocketId, action) {
        if (this.game.state.currentTurn.socketId !== playerSocketId) {
            return [this.game.state, undefined];
        }
        console.log("performing action: ", action);
        switch (action) {
            case PlayerAction.Hit:
                this.game.hit(playerSocketId);
                break;
            case PlayerAction.Stand: // do nothing as player is standing
                break;
        }
        if (this.game.shouldRoundEnd(action === PlayerAction.Stand)) {
            this.game.state.currentPhase = "RoundOver";
            let roundOverInfo = this.game.endRound();
            return [this.game.state, roundOverInfo];
        }
        this.game.nextTurn(action === PlayerAction.Stand);
        return [this.game.state, undefined];
    }
    placeBet(playerSocketId, betAmount, user) {
        // if same state is returned, then bet was not placed
        const player = this.getPlayer(playerSocketId);
        if (!player) {
            return this.game.state;
        }
        if (this.game.state.bets.has(player)) {
            const currentBet = this.game.state.bets.get(player);
            if (currentBet && currentBet > 0) {
                return this.game.state;
            }
        }
        // Check if player has enough balance to place bet
        if (user.balance < betAmount) {
            return this.game.state;
        }
        this.game.placeBet(player, betAmount);
        if (this.allBetsPlaced()) {
            this.game.state.currentPhase = "Playing";
            this.game.dealFirstCards();
        }
        return this.game.state;
    }
    allBetsPlaced() {
        return this.players.every((player) => {
            const bet = this.game.state.bets.get(player);
            return bet !== undefined && bet > 0;
        });
    }
}
exports.default = Room;
