import Player from "./player";

interface Card {
  value: string;
  suit: string;
}

export interface GameState {
  deck: Card[];
  playersHands: Map<Player, Card[]>;
  dealersHand: Card[];
}

class Game {
  public state: GameState = {
    deck: [],
    playersHands: new Map(),
    dealersHand: [],
  };

  constructor(firstPlayer: Player) {
    this.initializeDeck();
    this.state.deck = this.shuffleDeck(this.state.deck);
    this.state.playersHands.set(firstPlayer, []);
    this.dealFirstCards();
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

    for (let suit of suits) {
      for (let value of values) {
        this.state.deck.push({ value, suit });
      }
    }
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

  private dealFirstCards() {
    for (let i = 0; i < 2; i++) {
      for (let [player, hand] of this.state.playersHands) {
        hand.push(this.state.deck.pop()!); // remove last card from deck and add to players hands
      }
      this.state.dealersHand.push(this.state.deck.pop()!);
    }
  }

  public addPlayer(player: Player) {
    this.state.playersHands.set(player, []);
  }
}

export default Game;
