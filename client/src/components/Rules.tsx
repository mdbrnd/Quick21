import React, { useState } from "react";
import "./Rules.css";

interface Rule {
  image: string;
  altText: string;
  text: string;
}

const rules: Rule[] = [
  {
    image: "/assets/images/beat-dealer.png",
    altText: "Beat the Dealer",
    text: "Beat the dealer's hand without going over 21.",
  },
  {
    image: "/assets/images/card-values.png",
    altText: "Card Values",
    text: "Cards 2-10 are worth their face value. Face cards are worth 10, and Aces can be 1 or 11.",
  },
  {
    image: "/assets/images/hit-stand.png",
    altText: "Hit or Stand",
    text: "'Hit' to draw another card, 'Stand' to hold your total and end your turn.",
  },
  {
    image: "/assets/images/blackjack.png",
    altText: "Blackjack",
    text: "If you are dealt 21 from the start (Ace & 10), you got a blackjack.",
  },
  {
    image: "/assets/images/double-down.png",
    altText: "Double Down",
    text: "Double down: Double your bet and get exactly one more card.",
  },
];

interface RulesModalProps {
  onClose: () => void; // Specifies that onClose is a function that returns void
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [currentRule, setCurrentRule] = useState(0);

  const nextRule = () => {
    setCurrentRule((currentRule + 1) % rules.length);
  };

  const prevRule = () => {
    setCurrentRule((currentRule - 1 + rules.length) % rules.length);
  };

  return (
    <div className="modalStyle" onClick={(e) => e.stopPropagation()}>
      <h2>Blackjack Rules</h2>

      <div className="ruleStyle">
        <img
          src={rules[currentRule].image}
          alt={rules[currentRule].altText}
          className="ruleImageStyle"
        />
        <p>{rules[currentRule].text}</p>
      </div>

      <button onClick={prevRule} className="buttonStyle leftShiftButton">
        Previous
      </button>
      <button onClick={nextRule} className="buttonStyle">
        Next
      </button>

      <button onClick={onClose} className="buttonStyle">
        Close
      </button>
    </div>
  );
};

export default RulesModal;
