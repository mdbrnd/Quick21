import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LobbyScreen from "../pages/lobby/LobbyScreen";
import GameScreen from "../pages/game/GameScreen";
import LandingPage from "../pages/landing/LandingPage";
import { SocketProvider } from "../SocketContext";
import AdminPage from "../pages/admin/AdminPage";

const App: React.FC = () => {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lobby" element={<LobbyScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;
