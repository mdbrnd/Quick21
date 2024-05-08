import { Card } from "./card";
import Player from "./player";
export declare class ServerGameState {
    deck: Card[];
    dealersHand: Card[];
    currentTurn: Player;
    playersHands: Map<Player, Card[]>;
    currentPhase: "Betting" | "Playing" | "RoundOver";
    bets: Map<Player, number>;
    constructor(deck: Card[], dealersHand: Card[], currentTurn: Player, playersHands: Map<Player, Card[]>, currentPhase: "Betting" | "Playing" | "RoundOver", bets: Map<Player, number>);
    toClientGameState(): ClientGameState;
}
export declare class ClientGameState {
    dealersVisibleCard: Card | null;
    currentTurn: Player | null;
    playersHands: Map<Player, Card[]>;
    currentPhase: "Betting" | "Playing" | "RoundOver";
    bets: Map<Player, number>;
    constructor(dealersVisibleCard: Card | null, currentTurn: Player | null, playersHands: Map<Player, Card[]>, currentPhase: "Betting" | "Playing" | "RoundOver", bets: Map<Player, number>);
    toSerializedFormat(): {
        dealersVisibleCard: Card | null;
        currentTurn: Player | null;
        playersHands: [any, any][];
        currentPhase: "Betting" | "Playing" | "RoundOver";
        bets: [any, any][];
    };
}
//# sourceMappingURL=game_state.d.ts.map