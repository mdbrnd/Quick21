import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainScreen from "./MainScreen";
import BettingScreen from "./BettingScreen";
import GameScreen from "./GameScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/bet" element={<BettingScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/" element={<MainScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
