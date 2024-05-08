import { Card } from "./models/card";
import { ServerGameState } from "./models/game_state";
import Player from "./models/player";
import { RoundOverInfo, RoundResult } from "./models/round_over_info";

class Game {
  public state: ServerGameState = new ServerGameState(
    false, // gameStarted
    [], // deck
    [], // dealersHand
    { socketId: "", name: "" }, // currentTurn
    new Map(), // playersHands
    "Betting", // currentPhase
    new Map() // bets
  );

  constructor(firstPlayer: Player) {
    this.state.playersHands.set(firstPlayer, []);
    this.state.currentTurn = firstPlayer;
  }

  public start(): ServerGameState {
    this.initializeDeck();
    this.state.deck = this.shuffleDeck(this.state.deck);
    this.state.gameStarted = true;
    console.log("game started");
    return this.state;
  }

  private initializeDeck() {
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

  public hit(playerSocketId: string) {
    const player = this.getPlayerHandBySocketId(playerSocketId);
    if (player) {
      // if deck is empty, create a new deck
      if (this.state.deck.length === 0) {
        this.initializeDeck();
      }
      player.push(this.state.deck.pop()!);
    }
  }

  public nextTurn() {
    const players = Array.from(this.state.playersHands.keys());
    const currentIndex = players.indexOf(this.state.currentTurn);
    const nextIndex = (currentIndex + 1) % players.length;
    this.state.currentTurn = players[nextIndex];
  }

  public isLastTurn(): boolean {
    const players = Array.from(this.state.playersHands.keys());
    const currentIndex = players.indexOf(this.state.currentTurn);
    return currentIndex === players.length - 1;
  }

  public endRound() {
    //TODO: evaluate results

    let roundOverInfo: RoundOverInfo = new RoundOverInfo(
      new Map(),
      this.state.dealersHand,
      new Map()
    );

    return roundOverInfo;
  }

  public getPlayerHandBySocketId(socketId: string): Card[] | undefined {
    for (let [player, hand] of this.state.playersHands.entries()) {
      if (player.socketId === socketId) {
        return hand;
      }
    }
    return undefined;
  }

  // copilot
  private shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    return deck;
  }

  public dealFirstCards() {
    for (let i = 0; i < 2; i++) {
      for (let [player, hand] of this.state.playersHands) {
        // if deck is empty, create a new deck
        if (this.state.deck.length === 0) {
          this.initializeDeck();
        }

        hand.push(this.state.deck.pop()!); // remove last card from deck and add to players hands
      }
      this.state.dealersHand.push(this.state.deck.pop()!);
    }
  }

  public addPlayer(player: Player) {
    this.state.playersHands.set(player, []);
  }

  public removePlayer(playerSocketId: string) {
    for (let [player, hand] of this.state.playersHands.entries()) {
      if (player.socketId === playerSocketId) {
        this.state.playersHands.delete(player);
        return;
      }
    }
  }
  public placeBet(player: Player, betAmount: number) {
    this.state.bets.set(player, betAmount);
  }
}

export default Game;
