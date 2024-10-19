import Game from "../src/game";
import Player from "../src/models/player";
import { PlayerAction } from "../src/models/player";
import { Card } from "../src/models/card";

describe("Game", () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = { socketId: "123", name: "Test Player 1", userId: 1 };
    player2 = { socketId: "456", name: "Test Player 2", userId: 2 };
    game = new Game(player1);
    game.addPlayer(player2);
  });

  test("calculateHandValue calculates correct hand value", () => {
    const testCases: [Card[], number][] = [
      [
        [
          { value: "Ace", suit: "Hearts" },
          { value: "King", suit: "Spades" },
        ],
        21,
      ],
      [
        [
          { value: "5", suit: "Hearts" },
          { value: "7", suit: "Diamonds" },
          { value: "Queen", suit: "Clubs" },
        ],
        22,
      ],
      [
        [
          { value: "Ace", suit: "Spades" },
          { value: "Ace", suit: "Hearts" },
          { value: "9", suit: "Diamonds" },
        ],
        21,
      ],
    ];

    testCases.forEach(([hand, expectedValue]) => {
      expect(game.calculateHandValue(hand)).toBe(expectedValue);
    });
  });

  test("hasBlackjack correctly identifies blackjack", () => {
    expect(
      game.hasBlackjack([
        { value: "Ace", suit: "Hearts" },
        { value: "King", suit: "Spades" },
      ])
    ).toBe(true);

    expect(
      game.hasBlackjack([
        { value: "Queen", suit: "Hearts" },
        { value: "Jack", suit: "Spades" },
      ])
    ).toBe(false);

    expect(
      game.hasBlackjack([
        { value: "10", suit: "Hearts" },
        { value: "Ace", suit: "Spades" },
        { value: "King", suit: "Diamonds" },
      ])
    ).toBe(false);
  });

  test("shouldNextTurn correctly determines when to move to next turn", () => {
    game.state.playersHands.set(player1, [
      { value: "10", suit: "Hearts" },
      { value: "5", suit: "Spades" },
    ]);
    game.state.playersHands.set(player2, [
      { value: "9", suit: "Clubs" },
      { value: "7", suit: "Diamonds" },
    ]);
    game.state.currentTurn = player1;

    game.shouldNextTurn(PlayerAction.Hit);
    expect(game.state.currentTurn).toBe(player1);

    game.shouldNextTurn(PlayerAction.Stand);
    expect(game.state.currentTurn).toBe(player2);

    game.state.currentTurn = player2;
    game.state.playersHands.set(player2, [
      { value: "10", suit: "Hearts" },
      { value: "King", suit: "Spades" },
      { value: "Ace", suit: "Diamonds" },
    ]);
    game.shouldNextTurn(PlayerAction.Hit);
    expect(game.state.currentTurn).not.toBe(player2);
  });

  test("shouldRoundEnd correctly determines when the round should end", () => {
    const player2: Player = {
      socketId: "456",
      name: "Player 2",
      userId: 2,
    };
    game.addPlayer(player2);
    game.state.playersHands.set(player1, [
      { value: "10", suit: "Hearts" },
      { value: "8", suit: "Spades" },
    ]);
    game.state.playersHands.set(player2, [
      { value: "King", suit: "Clubs" },
      { value: "7", suit: "Diamonds" },
    ]);
    game.state.currentTurn = player1;

    expect(game.shouldRoundEnd(PlayerAction.Hit)).toBe(false);
    expect(game.shouldRoundEnd(PlayerAction.Stand)).toBe(false);

    game.state.currentTurn = player2;
    expect(game.shouldRoundEnd(PlayerAction.Hit)).toBe(false);
    expect(game.shouldRoundEnd(PlayerAction.Stand)).toBe(true);
  });
});
