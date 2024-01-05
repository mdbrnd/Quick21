import React, { useState, useEffect } from "react";

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    /* initial game state */
  });

  useEffect(() => {
    // Fetch initial game state from backend
  }, []);

  const handleHit = () => {
    fetch("/hit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        /* game state or player ID as needed */
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the game state based on the response
        setGameState(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleStand = () => {
    fetch("/stand", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        /* game state or player ID as needed */
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the game state based on the response
        setGameState(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleDouble = () => {
    fetch("/double", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        /* game state or player ID as needed */
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the game state based on the response
        setGameState(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
