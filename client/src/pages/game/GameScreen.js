import React, { useState, useEffect } from "react";

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    /* initial game state */
  });

  useEffect(() => {
    // Fetch initial game state
  }, []);

  const handleHit = () => {
    
  };

  const handleStand = () => {
    
  };

  const handleDouble = () => {
   
  };


  return (
    <div>
      <h2>Blackjack Game</h2>
      {/* Display player and dealer hands */}
      <button onClick={handleHit}>Hit</button>
      <button onClick={handleStand}>Stand</button>
      <button onClick={handleDouble}>Double</button>
    </div>
  );
};

export default GameScreen;
