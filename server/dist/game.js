"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(firstPlayer) {
        this.deck = [];
        this.playersHands = new Map();
        this.dealersHand = [];
        this.initializeDeck();
        this.deck = this.shuffleDeck(this.deck);
        this.playersHands.set(firstPlayer, []);
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
                this.deck.push({ value, suit });
            }
        }
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
            for (let [player, hand] of this.playersHands) {
                hand.push(this.deck.pop()); // remove last card from deck and add to players hands
            }
            this.dealersHand.push(this.deck.pop());
        }
    }
    addPlayer(player) {
        this.playersHands.set(player, []);
    }
}
exports.default = Game;
