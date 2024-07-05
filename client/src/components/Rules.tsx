import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
    <div
      className="bg-secondary border-2 border-primary rounded-xl p-6 max-w-2xl w-full mx-4 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Blackjack Rules</h2>
        <button
          onClick={onClose}
          className="bg-primary text-secondary hover:bg-primary-light transition-all duration-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="mb-6">
        <img
          src={rules[currentRule].image}
          alt={rules[currentRule].altText}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <p className="text-accent text-lg">{rules[currentRule].text}</p>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={prevRule}
          className="bg-primary text-secondary hover:bg-primary-light transition-all duration-200 py-2 px-4 rounded-lg flex items-center"
        >
          <ChevronLeft size={20} />
          <span className="ml-2">Previous</span>
        </button>
        <span className="text-accent">
          {currentRule + 1} / {rules.length}
        </span>
        <button
          onClick={nextRule}
          className="bg-primary text-secondary hover:bg-primary-light transition-all duration-200 py-2 px-4 rounded-lg flex items-center"
        >
          <span className="mr-2">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RulesModal;
