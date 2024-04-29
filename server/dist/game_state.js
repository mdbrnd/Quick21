"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerGameState = void 0;
class ServerGameState {
    constructor(deck, dealersHand, currentTurn, playersHands, currentPhase, bets) {
        this.deck = deck;
        this.dealersHand = dealersHand;
        this.currentTurn = currentTurn;
        this.playersHands = playersHands;
        this.currentPhase = currentPhase;
        this.bets = bets;
    }
    toClientGameState() {
        return {
            dealersVisibleCard: this.dealersHand[0],
            currentTurn: this.currentTurn,
            playersHands: this.playersHands,
            currentPhase: this.currentPhase,
            bets: this.bets
        };
    }
}
exports.ServerGameState = ServerGameState;
