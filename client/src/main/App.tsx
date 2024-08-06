import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LobbyScreen from "../pages/lobby/LobbyScreen";
import GameScreen from "../pages/game/GameScreen";
import LandingPage from "../pages/landing/LandingPage";
import { SocketProvider } from "../SocketContext";

const App: React.FC = () => {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lobby" element={<LobbyScreen />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
