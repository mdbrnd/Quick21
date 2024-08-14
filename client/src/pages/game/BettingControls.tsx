import React, { useState } from "react";
import { Location, useLocation, useNavigate } from "react-router-dom";
import "../../index.css";
import { Minus, CoinsIcon, Plus } from "lucide-react";
import LocationState from "../../models/location_state";
import { useSocket } from "../../SocketContext";

const BettingControls: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const { socket, userInfo } = useSocket();
  const [betAmount, setBetAmount] = useState(0);
  const navigate = useNavigate();

  const handleSubtractBet = () => {
    setBetAmount(Math.max(betAmount - 25000, 0));
  };

  const handleAddBet = () => {
    setBetAmount(betAmount + 25000);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(Math.min(value, userInfo!.balance));
    } else {
      setBetAmount(0);
    }
  };

  const handlePlaceBet = async () => {
    if (!socket) {
      navigate("/");
      return;
    }
    if (betAmount > userInfo!.balance) {
      alert("Bet amount cannot exceed your balance.");
    } else if (betAmount > 0) {
      const response = await socket.emitWithAck(
        "place-bet",
        location.state.roomCode,
        betAmount
      );
      if (!response.success) {
        alert("Failed to place bet");
      }
    } else {
      alert("Please enter a valid bet amount greater than zero.");
    }
  };

  return (
    <div className="bg-secondary-dark border-1 border-primary p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-primary">Place Your Bet</h2>
      <p className="text-accent mb-4">Your Balance: ${userInfo!.balance}</p>
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={handleSubtractBet}
          className="bg-primary text-secondary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary transition-colors duration-300"
        >
          <Minus size={24} color="#282c34" />
        </button>
        <input
          type="number"
          value={betAmount}
          onChange={handleInputChange}
          className="bg-secondary text-primary border-2 border-primary rounded-lg px-4 py-2 w-40 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleAddBet}
          className="bg-primary text-secondary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary transition-colors duration-300"
        >
          <Plus size={24} color="#282c34" />
        </button>
      </div>
      <button
        onClick={handlePlaceBet}
        className="bg-gradient-to-r from-primary to-primary text-secondary font-bold py-3 px-6 rounded-lg text-xl w-full transition-all duration-300 hover:bg-primary transform hover:scale-105"
      >
        Place Bet
      </button>
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleAddBet}
          className="bg-primary text-secondary p-2 rounded-full hover:bg-primary transition-colors duration-300 flex items-center space-x-2"
        >
          <CoinsIcon size={24} />
          <span className="font-bold">+25k</span>
        </button>
      </div>
    </div>
  );
};

export default BettingControls;
