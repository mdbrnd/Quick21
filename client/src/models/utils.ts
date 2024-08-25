import { Card } from "./card";
import { ClientGameState } from "./game_state";
import { Player } from "./player";

const serializeMap = (map: Map<any, any>) => {
  return Array.from(map.entries());
};

const deserializeMap = (array: any[]) => {
  return new Map(array);
};

const findBetBySocketId = (
  betsMap: Map<Player, number>,
  socketId: string
): number | undefined => {
  for (const [player, bet] of betsMap.entries()) {
    if (player.socketId === socketId) {
      return bet;
    }
  }
  return undefined;
};

function getPlayerHandBySocketId(
  socketId: string,
  gameState: ClientGameState
): Card[] | undefined {
  for (let [player, hand] of gameState.playersHands.entries()) {
    if (player.socketId === socketId) {
      return hand;
    }
  }
  return undefined;
}

function calculateHandValue(cards: Card[]): number {
  let value = 0;
  let aceCount = 0;

  for (const card of cards) {
    if (card.value === "Ace") {
      aceCount++;
      value += 11; // Initially consider ace as 11
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

export { serializeMap, deserializeMap, findBetBySocketId, calculateHandValue, getPlayerHandBySocketId };
