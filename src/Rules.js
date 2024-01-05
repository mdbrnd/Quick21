import React, { useState } from "react";

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "5px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  zIndex: 1000,
  width: "80%",
  maxWidth: "400px",
  color: "black",
  textAlign: "left",
};

const closeButtonStyle = {
  backgroundColor: "#61dafb", // Light blue background
  color: "#282c34", // Dark text color
  padding: "5px 10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "15px",
};

const ruleStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "10px",
};

const ruleImageStyle = {
  width: "50px",
  height: "50px",
  marginRight: "10px",
};

const arrowButtonStyle = {
  backgroundColor: "#61dafb", // Light blue background for visibility
  color: "#282c34", // Dark text color for contrast
  border: "none",
  borderRadius: "5px",
  padding: "10px 20px",
  margin: "10px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold",
  display: "inline-block", // To align buttons in a row
};


const rules = [
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

const RulesModal = ({ onClose }) => {
  const [currentRule, setCurrentRule] = useState(0);

  const nextRule = () => {
    setCurrentRule((currentRule + 1) % rules.length);
  };

  const prevRule = () => {
    setCurrentRule((currentRule - 1 + rules.length) % rules.length);
  };

  return (
    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
      <h2>Blackjack Rules</h2>

      <div style={ruleStyle}>
        <img
          src={rules[currentRule].image}
          alt={rules[currentRule].altText}
          style={ruleImageStyle}
        />
        <p>{rules[currentRule].text}</p>
      </div>

      <button onClick={prevRule} style={arrowButtonStyle}>
        Previous
      </button>
      <button onClick={nextRule} style={arrowButtonStyle}>
        Next
      </button>

      <button onClick={onClose} style={closeButtonStyle}>
        Close
      </button>
    </div>
  );
};

export default RulesModal;
