import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LobbyScreen from "../pages/lobby/LobbyScreen";
import GameScreen from "../pages/game/GameScreen";
import LandingPage from "../pages/landing/LandingPage";
import { SocketProvider, useSocket } from "../SocketContext";

const App: React.FC = () => {
  const socket = useSocket();

  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lobby" element={<LobbyScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
