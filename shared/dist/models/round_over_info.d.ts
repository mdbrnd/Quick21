import { Card } from "./card";
export declare enum RoundResult {
    Win = "Win",
    Lose = "Lose",
    Tie = "Tie",
    Blackjack = "Blackjack"
}
export interface RoundOverInfo {
    results: Map<string, RoundResult>;
    dealerHand: Card[];
    updatedBalances: Map<string, number>;
}
//# sourceMappingURL=round_over_info.d.ts.map