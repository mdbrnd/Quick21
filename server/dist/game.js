"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_state_1 = require("./models/game_state");
const round_over_info_1 = require("./models/round_over_info");
class Game {
    constructor(firstPlayer) {
        this.state = new game_state_1.ServerGameState(false, // gameStarted
        [], // deck
        [], // dealersHand
        { socketId: "", name: "" }, // currentTurn
        new Map(), // playersHands
        "Betting", // currentPhase
        new Map() // bets
        );
        this.state.playersHands.set(firstPlayer, []);
        this.state.currentTurn = firstPlayer;
    }
    start() {
        this.initializeDeck();
        this.state.deck = this.shuffleDeck(this.state.deck);
        this.state.gameStarted = true;
        console.log("game started");
        return this.state;
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
        this.state.deck = [];
        for (let suit of suits) {
            for (let value of values) {
                this.state.deck.push({ value, suit });
            }
        }
        this.state.deck = this.shuffleDeck(this.state.deck);
    }
    hit(playerSocketId) {
        const player = this.getPlayerHandBySocketId(playerSocketId);
        if (player) {
            // if deck is empty, create a new deck
            if (this.state.deck.length === 0) {
                this.initializeDeck();
            }
            player.push(this.state.deck.pop());
        }
    }
    nextTurn() {
        const players = Array.from(this.state.playersHands.keys());
        const currentIndex = players.indexOf(this.state.currentTurn);
        const nextIndex = (currentIndex + 1) % players.length;
        this.state.currentTurn = players[nextIndex];
    }
    isLastTurn() {
        const players = Array.from(this.state.playersHands.keys());
        const currentIndex = players.indexOf(this.state.currentTurn);
        return currentIndex === players.length - 1;
    }
    endRound() {
        //TODO: evaluate results
        let roundOverInfo = new round_over_info_1.RoundOverInfo(new Map(), this.state.dealersHand, new Map());
        return roundOverInfo;
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
                // if deck is empty, create a new deck
                if (this.state.deck.length === 0) {
                    this.initializeDeck();
                }
                hand.push(this.state.deck.pop()); // remove last card from deck and add to players hands
            }
            this.state.dealersHand.push(this.state.deck.pop());
        }
    }
    addPlayer(player) {
        this.state.playersHands.set(player, []);
    }
    removePlayer(playerSocketId) {
        for (let [player, hand] of this.state.playersHands.entries()) {
            if (player.socketId === playerSocketId) {
                this.state.playersHands.delete(player);
                return;
            }
        }
    }
    placeBet(player, betAmount) {
        this.state.bets.set(player, betAmount);
    }
}
exports.default = Game;
