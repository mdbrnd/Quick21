import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RulesModal from "./components/Rules";

const MainScreen = () => {
  let navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handlePlayClick = () => {
    navigate("/bet");
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <div className="mainScreenStyle">
      <h1>Welcome to Quick21</h1>
      <button onClick={handlePlayClick} className="buttonStyle">
        Play
      </button>
      <button onClick={toggleRules} className="buttonStyle">
        Rules
      </button>

      {showRules && (
        <div className="overlayStyle" onClick={() => setShowRules(false)}>
          <RulesModal onClose={() => setShowRules(false)} />
        </div>
      )}
    </div>
  );
};

export default MainScreen;
