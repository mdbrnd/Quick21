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
    newRound() {
        this.initializeDeck();
        this.state.deck = this.shuffleDeck(this.state.deck);
        this.state.dealersHand = [];
        this.state.currentTurn = { socketId: "", name: "" };
        this.state.currentPhase = "Betting";
        this.state.playersHands = new Map();
        this.state.bets = new Map();
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
        // start new round
        //this.newRound();
        // Deal to dealer
        while (this.calculateHandValue(this.state.dealersHand) < 17) {
            if (this.state.deck.length === 0) {
                this.initializeDeck();
            }
            this.state.dealersHand.push(this.state.deck.pop());
        }
        return this.determineRoundResults(this.state);
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
    // two functions below written with help from chatgpt
    calculateHandValue(cards) {
        let value = 0;
        let aceCount = 0;
        for (const card of cards) {
            if (card.value === "Ace") {
                aceCount++;
                value += 11; // initially consider ace as 11
            }
            else if (["Jack", "Queen", "King"].includes(card.value)) {
                value += 10;
            }
            else {
                value += parseInt(card.value);
            }
        }
        // Adjust if the value is over 21 and the hand contains Aces considered as 11
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }
    hasBlackjack(cards) {
        return cards.length === 2 && this.calculateHandValue(cards) === 21;
    }
    determineRoundResults(state) {
        const results = new Map();
        const updatedBalances = new Map();
        const dealerValue = this.calculateHandValue(state.dealersHand);
        const dealerBlackjack = this.hasBlackjack(state.dealersHand);
        // TODO: add db balances
        state.playersHands.forEach((hand, player) => {
            const playerValue = this.calculateHandValue(hand);
            const playerBlackjack = this.hasBlackjack(hand);
            const bet = state.bets.get(player) || 0;
            let result;
            if (playerBlackjack && !dealerBlackjack) {
                result = round_over_info_1.RoundResult.Blackjack;
                updatedBalances.set(player.socketId, bet * 2.5); // assuming 3:2 payout for blackjack
            }
            else if ((playerBlackjack && dealerBlackjack) ||
                playerValue === dealerValue) {
                result = round_over_info_1.RoundResult.Tie;
                updatedBalances.set(player.socketId, bet); // return the bet
            }
            else if ((playerValue > dealerValue && playerValue <= 21) ||
                dealerValue > 21) {
                result = round_over_info_1.RoundResult.Win;
                updatedBalances.set(player.socketId, bet * 2); // win, double the bet
            }
            else {
                result = round_over_info_1.RoundResult.Lose;
                updatedBalances.set(player.socketId, 0); // lose the bet
            }
            results.set(player.socketId, result);
        });
        return new round_over_info_1.RoundOverInfo(results, state.dealersHand, updatedBalances);
    }
}
exports.default = Game;
