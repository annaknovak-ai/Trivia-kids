"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import { gameReducer, initialGame, type GameAction, type GameData } from "@/lib/game/gameState";

// In-memory game state shared across screens (never persisted; a reload starts over)
type GameContextValue = GameData & {
  dispatch: (action: GameAction) => void;
  startGame: (topic: string) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export default function GameProvider({ children }: { children: ReactNode }) {
  const [game, dispatch] = useReducer(gameReducer, initialGame);

  function startGame(topic: string) {
    dispatch({ type: "start", topic });
  }

  return <GameContext.Provider value={{ ...game, dispatch, startGame }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside <GameProvider>");
  return game;
}
