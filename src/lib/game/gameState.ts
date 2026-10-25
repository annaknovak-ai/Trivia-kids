// In-memory game state (ARCHITECTURE.md 3.3) as a pure reducer — no React, never persisted
import type { ApiErrorCode, TriviaQuestion } from "@/lib/trivia/types";
import { MAX_RECENT_QUESTIONS } from "@/lib/trivia/validation";

// "reveal" is the short (~1s) correct/wrong marking on the question screen before the feedback screen
export type AnswerPhase = "choosing" | "reveal" | "feedback";

export type View =
  | { kind: "loading" }
  | { kind: "question"; question: TriviaQuestion; selected: number | null; phase: AnswerPhase }
  | { kind: "error" }
  // The topic was rejected as unsuitable for kids (DESIGN.md 1.6א)
  | { kind: "notAllowed" };

export type GameData = {
  // True once the first question was requested (via "התחילו" or the questions tab)
  started: boolean;
  currentTopic: string;
  // Increases on every new request (start / next question / retry); results for older keys are ignored
  requestKey: number;
  view: View;
  score: number;
  recentQuestions: string[];
  // Increases when the Home topic box should be cleared ("בחרו נושא אחר")
  topicResetKey: number;
};

export type GameAction =
  | { type: "start"; topic: string }
  | { type: "next" }
  | { type: "retry" }
  | { type: "receiveQuestion"; key: number; question: TriviaQuestion }
  | { type: "receiveError"; key: number; code: ApiErrorCode }
  | { type: "select"; index: number }
  | { type: "showFeedback" }
  | { type: "chooseOtherTopic" };

export const initialGame: GameData = {
  started: false,
  currentTopic: "",
  requestKey: 0,
  view: { kind: "loading" },
  score: 0,
  recentQuestions: [],
  topicResetKey: 0,
};

export function addRecentQuestion(list: string[], question: string): string[] {
  return [...list.filter((q) => q !== question), question].slice(-MAX_RECENT_QUESTIONS);
}

export function isCorrectAnswer(question: TriviaQuestion, index: number): boolean {
  return index === question.correctOptionIndex;
}

// A new request for the current topic (score and recent questions are kept)
function newRequest(state: GameData, topic: string): GameData {
  return { ...state, started: true, currentTopic: topic, requestKey: state.requestKey + 1, view: { kind: "loading" } };
}

export function gameReducer(state: GameData, action: GameAction): GameData {
  switch (action.type) {
    case "start":
      return newRequest(state, action.topic);

    case "next":
    case "retry":
      return newRequest(state, state.currentTopic);

    case "receiveQuestion":
      if (action.key !== state.requestKey || state.view.kind !== "loading") return state;
      return {
        ...state,
        view: { kind: "question", question: action.question, selected: null, phase: "choosing" },
        recentQuestions: addRecentQuestion(state.recentQuestions, action.question.question),
      };

    case "receiveError":
      if (action.key !== state.requestKey || state.view.kind !== "loading") return state;
      return { ...state, view: { kind: action.code === "TOPIC_NOT_ALLOWED" ? "notAllowed" : "error" } };

    case "select": {
      const view = state.view;
      // Only the first choice counts; the score changes at most once per question
      if (view.kind !== "question" || view.phase !== "choosing") return state;
      if (action.index < 0 || action.index >= view.question.options.length) return state;
      return {
        ...state,
        view: { ...view, selected: action.index, phase: "reveal" },
        score: state.score + (isCorrectAnswer(view.question, action.index) ? 1 : 0),
      };
    }

    case "showFeedback":
      if (state.view.kind !== "question" || state.view.phase !== "reveal") return state;
      return { ...state, view: { ...state.view, phase: "feedback" } };

    case "chooseOtherTopic":
      return { ...state, topicResetKey: state.topicResetKey + 1 };
  }
}
