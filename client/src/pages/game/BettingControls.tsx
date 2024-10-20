import React, { useState, useEffect } from "react";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { useSocket } from "../../SocketContext";
import LocationState from "../../models/location_state";

const BettingControls: React.FC = () => {
  const location: Location<LocationState> = useLocation();
  const { socket, userInfo } = useSocket();
  const [betAmount, setBetAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !userInfo) {
      navigate("/");
    }
  }, [socket, userInfo, navigate]);

  const addBet = (amount: number) => {
    setBetAmount(Math.min(betAmount + amount, userInfo?.balance || 0));
    setError("");
  };

  const handlePlaceBet = async () => {
    if (betAmount <= 0) {
      setError("Please enter a valid bet amount greater than zero.");
      return;
    }

    if (betAmount > userInfo!.balance) {
      setError("Bet amount cannot exceed your balance.");
      return;
    }

    try {
      const response = await socket?.emitWithAck(
        "place-bet",
        location.state?.roomCode,
        betAmount
      );
      if (!response?.success) {
        setError("Failed to place bet. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while placing your bet.");
    }
  };

  return (
    <div className="bg-secondary-dark border border-primary p-6 sm:p-8 rounded-xl shadow-lg max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Place Your Bet
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-white text-base sm:text-lg">Your Balance:</span>
          <span className="text-primary text-xl sm:text-2xl font-bold">
            ${userInfo?.balance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
          <button
            onClick={() =>
              setBetAmount(
                Math.floor(Math.max(betAmount - userInfo!.balance * 0.05, 0))
              )
            }
            className="bg-primary text-secondary w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors duration-300"
          >
            <Minus size={24} />
          </button>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="bg-secondary text-primary border-2 border-primary rounded-lg px-4 sm:px-6 py-2 sm:py-3 w-40 sm:w-64 text-center text-2xl sm:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() =>
              setBetAmount(
                Math.floor(
                  Math.min(
                    betAmount + userInfo!.balance * 0.05,
                    userInfo!.balance
                  )
                )
              )
            }
            className="bg-primary text-secondary w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors duration-300"
          >
            <Plus size={24} />
          </button>
        </div>

        <input
          type="range"
          min="0"
          max={userInfo?.balance || 100000}
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          className="w-full appearance-none bg-secondary h-2 sm:h-3 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 sm:[&::-webkit-slider-thumb]:w-6 sm:[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          {[100, 500, 1000, 5000, 25000].map((amount) => (
            <button
              key={amount}
              onClick={() => addBet(amount)}
              className="bg-primary text-secondary px-2 sm:px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors duration-300 text-xs sm:text-sm font-semibold"
            >
              +${amount.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handlePlaceBet}
            className="bg-gradient-to-r from-primary to-primary text-secondary font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-xl sm:text-2xl flex-grow transition-all duration-300 hover:bg-opacity-80 transform hover:scale-105 flex items-center justify-center"
          >
            Place Bet
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingControls;
