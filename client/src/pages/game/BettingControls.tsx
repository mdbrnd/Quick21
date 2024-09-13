import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useSocket } from "../../SocketContext";
import { useLocation, useNavigate } from "react-router-dom";

const BettingControls: React.FC = () => {
  const { socket, userInfo } = useSocket();
  const [bet, setBet] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBet = async () => {
    if (!socket) {
      navigate("/");
      return;
    }

    if (bet > (userInfo?.balance ?? 0)) {
      alert("Bet amount cannot exceed your balance.");
      return;
    }

    if (bet <= 0) {
      alert("Please enter a valid bet amount greater than zero.");
      return;
    }

    try {
      const response = await socket.emitWithAck(
        "place-bet",
        location.state?.roomCode,
        bet
      );
      if (!response.success) {
        alert("Failed to place bet");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("An error occurred while placing your bet. Please try again.");
    }
  };

  const chipValues = [5, 10, 25, 50, 100];

  return (
    <div className="bg-secondary-light p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-primary mb-4">Place Your Bet</h2>
      <div className="mb-4">
        <Slider
          min={0}
          max={userInfo ? userInfo.balance : 1000}
          step={5}
          value={bet}
          onChange={(value) => setBet(value as number)}
        />
      </div>
      <div className="flex justify-center mb-4">
        {chipValues.map((value) => (
          <button
            key={value}
            onClick={() =>
              setBet(Math.min(bet + value, userInfo?.balance ?? 0))
            }
            className="mx-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-2 px-4 rounded-full shadow-md"
            disabled={bet + value > (userInfo?.balance ?? 0)}
          >
            +${value}
          </button>
        ))}
      </div>
      <div className="text-center mb-4">
        <span className="text-xl font-semibold">Bet Amount: ${bet}</span>
      </div>
      <button
        onClick={handleBet}
        className="bg-primary text-secondary font-bold py-2 px-6 rounded-lg hover:bg-primary-light transition-colors duration-300"
        disabled={bet === 0}
      >
        Place Bet
      </button>
    </div>
  );
};

export default BettingControls;
