import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RulesModal from "./Rules";

const MainScreen = () => {
  let navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handlePlayClick = () => {
    navigate("/bet");
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  const mainScreenStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh", // full height of the viewport
    backgroundColor: "#282c34", // dark background
    color: "white", // white text color
    textAlign: "center",
  };

  const buttonStyle = {
    backgroundColor: "#61dafb", // a light blue background color
    color: "#282c34", // dark text color for contrast
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "20px",
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1000,
  };

  return (
    <div style={mainScreenStyle}>
      <h1>Welcome to Blackjack</h1>
      <button onClick={handlePlayClick} style={buttonStyle}>
        Play
      </button>
      <button onClick={toggleRules} style={buttonStyle}>
        Rules
      </button>

      {showRules && (
        <div style={overlayStyle} onClick={() => setShowRules(false)}>
          <RulesModal onClose={() => setShowRules(false)} />
        </div>
      )}
    </div>
  );
};

export default MainScreen;
