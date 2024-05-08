"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientGameState = exports.ServerGameState = void 0;
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
        const dealersVisibleCard = this.dealersHand[0];
        return new ClientGameState(dealersVisibleCard, this.currentTurn, this.playersHands, this.currentPhase, this.bets);
    }
}
exports.ServerGameState = ServerGameState;
class ClientGameState {
    constructor(dealersVisibleCard, currentTurn, playersHands, currentPhase, bets) {
        this.dealersVisibleCard = dealersVisibleCard;
        this.currentTurn = currentTurn;
        this.playersHands = playersHands;
        this.currentPhase = currentPhase;
        this.bets = bets;
    }
    toSerializedFormat() {
        return {
            dealersVisibleCard: this.dealersVisibleCard,
            currentTurn: this.currentTurn,
            playersHands: serializeMap(this.playersHands),
            currentPhase: this.currentPhase,
            bets: serializeMap(this.bets)
        };
    }
}
exports.ClientGameState = ClientGameState;
const serializeMap = (map) => {
    return Array.from(map.entries());
};
const deserializeMap = (array) => {
    return new Map(array);
};
