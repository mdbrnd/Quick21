import { Card } from "./models/card";
import { ServerGameState } from "./models/game_state";
import Player from "./models/player";
import { RoundOverInfo, RoundResult } from "./models/round_over_info";

class Game {
  public state: ServerGameState = new ServerGameState(
    false, // gameStarted
    [], // deck
    [], // dealersHand
    { socketId: "", name: "", balance: 0, userId: -1 }, // currentTurn
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
    this.state.gameStarted = true;
    console.log("game started");
    return this.state;
  }

  public newRound(): ServerGameState {
    this.initializeDeck();
    this.state.dealersHand = [];
    const firstPlayer = Array.from(this.state.bets.keys())[0];
    this.state.currentTurn = firstPlayer || { socketId: "", name: "" };
    this.state.currentPhase = "Betting";
    this.state.playersHands = new Map(
      Array.from(this.state.playersHands.keys()).map((player) => [player, []])
    );
    this.state.bets = new Map(
      Array.from(this.state.bets.keys()).map((player) => [player, 0])
    );
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

  public nextTurn(didStand: boolean) {
    const players = Array.from(this.state.playersHands.keys());
    const currentIndex = players.indexOf(this.state.currentTurn);
    const nextIndex = (currentIndex + 1) % players.length;
    // only next turn if the player busted/has blackjack or stood
    if (
      didStand ||
      this.calculateHandValue(
        this.state.playersHands.get(players[currentIndex])!
      ) >= 21
    ) {
      this.state.currentTurn = players[nextIndex];
    }
  }

  public isLastTurn(): boolean {
    const players = Array.from(this.state.playersHands.keys());
    const currentIndex = players.indexOf(this.state.currentTurn);
    return currentIndex === players.length - 1;
  }

  public shouldRoundEnd(didStand: boolean): boolean {
    // if the last player busted or stood, the round should end
    return (
      this.isLastTurn() &&
      (didStand ||
        this.calculateHandValue(
          this.state.playersHands.get(this.state.currentTurn)!
        ) >= 21)
    );
  }

  public endRound(): RoundOverInfo {
    // Deal to dealer
    while (this.calculateHandValue(this.state.dealersHand) < 17) {
      if (this.state.deck.length === 0) {
        this.initializeDeck();
      }
      this.state.dealersHand.push(this.state.deck.pop()!);
    }

    return this.determineRoundResults(this.state);
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

    // After all cards dealt, skip to person that doesn't have blackjack
    for (let [player, hand] of this.state.playersHands.entries()) {
      if (!this.hasBlackjack(hand)) {
        this.state.currentTurn = player;
        return false;
      }
    }

    //TODO: If all players have blackjack, end the round
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

  // two functions below written with help from chatgpt
  public calculateHandValue(cards: Card[]): number {
    let value = 0;
    let aceCount = 0;

    for (const card of cards) {
      if (card.value === "Ace") {
        aceCount++;
        value += 11; // initially consider ace as 11
      } else if (["Jack", "Queen", "King"].includes(card.value)) {
        value += 10;
      } else {
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

  public hasBlackjack(cards: Card[]): boolean {
    return cards.length === 2 && this.calculateHandValue(cards) === 21;
  }

  private determineRoundResults(state: ServerGameState): RoundOverInfo {
    const results = new Map<Player, RoundResult>();
    const updatedBalances = new Map<Player, number>();
    const dealerValue = this.calculateHandValue(state.dealersHand);
    const dealerBlackjack = this.hasBlackjack(state.dealersHand);

    // TODO: add db balances

    state.playersHands.forEach((hand, player) => {
      const playerValue = this.calculateHandValue(hand);
      const playerBlackjack = this.hasBlackjack(hand);
      const bet = state.bets.get(player) || 0;

      let result: RoundResult;
      if (playerBlackjack && !dealerBlackjack) {
        result = RoundResult.Blackjack;
        updatedBalances.set(player, bet * 2.5); // assuming 3:2 payout for blackjack
      } else if (
        (playerBlackjack && dealerBlackjack) ||
        (playerValue === dealerValue && playerValue <= 21)
      ) {
        result = RoundResult.Tie;
        updatedBalances.set(player, bet); // return the bet
      } else if (
        (playerValue > dealerValue && playerValue <= 21) ||
        (playerValue <= 21 && dealerValue > 21)
      ) {
        result = RoundResult.Win;
        updatedBalances.set(player, bet * 2); // win, double the bet
      } else {
        result = RoundResult.Lose;
        updatedBalances.set(player, 0); // lose the bet
      }

      results.set(player, result);
    });

    return new RoundOverInfo(results, state.dealersHand, updatedBalances);
  }
}

export default Game;
