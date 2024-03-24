"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(firstPlayer) {
        this.state = {
            deck: [],
            playersHands: new Map(),
            dealersHand: [],
        };
        this.initializeDeck();
        this.state.deck = this.shuffleDeck(this.state.deck);
        this.state.playersHands.set(firstPlayer, []);
        this.dealFirstCards();
    }
    initializeDeck() {
        const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const values = [
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "Jack",
            "Queen",
            "King",
            "Ace",
        ];
        for (let suit of suits) {
            for (let value of values) {
                this.state.deck.push({ value, suit });
            }
        }
    }
    hit(playerSocketId) {
        const player = this.getPlayerHandBySocketId(playerSocketId);
        if (player) {
            player.push(this.state.deck.pop());
        }
    }
    getPlayerHandBySocketId(socketId) {
        for (let [player, hand] of this.state.playersHands.entries()) {
            if (player.socketId === socketId) {
                return hand;
            }
        }
        return undefined;
    }
    // copilot
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = deck[i];
            deck[i] = deck[j];
            deck[j] = temp;
        }
        return deck;
    }
    dealFirstCards() {
        for (let i = 0; i < 2; i++) {
            for (let [player, hand] of this.state.playersHands) {
                hand.push(this.state.deck.pop()); // remove last card from deck and add to players hands
            }
            this.state.dealersHand.push(this.state.deck.pop());
        }
    }
    addPlayer(player) {
        this.state.playersHands.set(player, []);
    }
}
exports.default = Game;
