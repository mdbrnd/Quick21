import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BettingScreen = () => {
  let navigate = useNavigate();
  const [betAmount, setBetAmount] = useState(0);

  const handleBetSubmit = () => {
    // Send bet amount
    navigate("/game");
  };

  return (
    <div>
      <h2>Place Your Bet</h2>
      <input
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
      />
      <button onClick={handleBetSubmit}>Bet</button>
    </div>
  );
};

export default BettingScreen;
