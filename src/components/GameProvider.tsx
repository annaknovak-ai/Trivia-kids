"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// In-memory game state shared across screens (never persisted). Expanded in Milestone 3.
type GameState = {
  currentTopic: string;
  // Increases on every "start" so the questions screen knows a new question was requested
  requestId: number;
  startGame: (topic: string) => void;
};

const GameContext = createContext<GameState | null>(null);

export default function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState({ currentTopic: "", requestId: 0 });

  function startGame(topic: string) {
    setGame((g) => ({ currentTopic: topic, requestId: g.requestId + 1 }));
  }

  return <GameContext.Provider value={{ ...game, startGame }}>{children}</GameContext.Provider>;
}

export function useGame(): GameState {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside <GameProvider>");
  return game;
}
