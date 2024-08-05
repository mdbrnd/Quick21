import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LobbyScreen from "../pages/lobby/LobbyScreen";
import GameScreen from "../pages/game/GameScreen";
import LandingPage from "../pages/landing/LandingPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
