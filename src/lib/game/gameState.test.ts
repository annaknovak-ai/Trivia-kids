import { describe, expect, it } from "vitest";
import { addRecentQuestion, gameReducer, initialGame, type GameData } from "./gameState";

const QUESTION = {
  question: "איזה כוכב לכת מכונה הכוכב האדום?",
  options: ["נוגה", "מאדים", "צדק", "שבתאי"],
  correctOptionIndex: 1,
};

// A game that started on "חלל" and received QUESTION
function withQuestion(state: GameData = initialGame): GameData {
  const started = gameReducer(state, { type: "start", topic: "חלל" });
  return gameReducer(started, { type: "receiveQuestion", key: started.requestKey, question: QUESTION });
}

describe("score", () => {
  it("adds one point for a correct answer", () => {
    const s = gameReducer(withQuestion(), { type: "select", index: 1 });
    expect(s.score).toBe(1);
    expect(s.view).toMatchObject({ kind: "question", selected: 1, phase: "reveal" });
  });

  it("does not change the score for a wrong answer", () => {
    const s = gameReducer(withQuestion(), { type: "select", index: 0 });
    expect(s.score).toBe(0);
    expect(s.view).toMatchObject({ selected: 0, phase: "reveal" });
  });

  it("counts only the first choice", () => {
    let s = gameReducer(withQuestion(), { type: "select", index: 1 });
    s = gameReducer(s, { type: "select", index: 1 });
    s = gameReducer(s, { type: "select", index: 2 });
    expect(s.score).toBe(1);
    expect(s.view).toMatchObject({ selected: 1 });
  });

  it("ignores choices after the feedback is shown", () => {
    let s = gameReducer(withQuestion(), { type: "select", index: 0 });
    s = gameReducer(s, { type: "showFeedback" });
    s = gameReducer(s, { type: "select", index: 1 });
    expect(s.score).toBe(0);
    expect(s.view).toMatchObject({ selected: 0, phase: "feedback" });
  });

  it("ignores choices while loading or on error", () => {
    const loading = gameReducer(initialGame, { type: "start", topic: "" });
    expect(gameReducer(loading, { type: "select", index: 0 })).toBe(loading);
    const error = gameReducer(loading, { type: "receiveError", key: loading.requestKey, code: "QUESTION_UNAVAILABLE" });
    expect(gameReducer(error, { type: "select", index: 0 })).toBe(error);
  });

  it("accumulates across questions and keeps the score when the topic changes", () => {
    let s = gameReducer(withQuestion(), { type: "select", index: 1 });
    s = gameReducer(s, { type: "showFeedback" });
    s = withQuestion(gameReducer(s, { type: "start", topic: "חיות" }));
    s = gameReducer(s, { type: "select", index: 1 });
    expect(s.score).toBe(2);
  });
});

describe("requests", () => {
  it("next question keeps the topic and starts a new request", () => {
    const s = gameReducer(withQuestion(), { type: "next" });
    expect(s.currentTopic).toBe("חלל");
    expect(s.view).toEqual({ kind: "loading" });
  });

  it("ignores results for an older request", () => {
    const first = gameReducer(initialGame, { type: "start", topic: "חלל" });
    const second = gameReducer(first, { type: "retry" });
    expect(gameReducer(second, { type: "receiveQuestion", key: first.requestKey, question: QUESTION })).toBe(second);
    expect(
      gameReducer(second, { type: "receiveError", key: first.requestKey, code: "QUESTION_UNAVAILABLE" }),
    ).toBe(second);
  });

  it("remembers received questions for the next request", () => {
    expect(withQuestion().recentQuestions).toEqual([QUESTION.question]);
  });
});

describe("unsuitable topic", () => {
  it("shows the not-allowed view for TOPIC_NOT_ALLOWED and the error view otherwise", () => {
    const loading = gameReducer(initialGame, { type: "start", topic: "סמים" });
    const key = loading.requestKey;
    expect(gameReducer(loading, { type: "receiveError", key, code: "TOPIC_NOT_ALLOWED" }).view).toEqual({
      kind: "notAllowed",
    });
    expect(gameReducer(loading, { type: "receiveError", key, code: "QUESTION_UNAVAILABLE" }).view).toEqual({
      kind: "error",
    });
  });

  it("choosing another topic asks Home to clear the topic box and keeps the score", () => {
    let s = gameReducer(withQuestion(), { type: "select", index: 1 });
    s = gameReducer(s, { type: "start", topic: "סמים" });
    s = gameReducer(s, { type: "receiveError", key: s.requestKey, code: "TOPIC_NOT_ALLOWED" });
    const after = gameReducer(s, { type: "chooseOtherTopic" });
    expect(after.topicResetKey).toBe(s.topicResetKey + 1);
    expect(after.score).toBe(1);
  });
});

describe("addRecentQuestion", () => {
  it("keeps only the last 10 questions", () => {
    let list: string[] = [];
    for (let i = 1; i <= 12; i++) list = addRecentQuestion(list, `שאלה ${i}`);
    expect(list).toHaveLength(10);
    expect(list[0]).toBe("שאלה 3");
    expect(list[9]).toBe("שאלה 12");
  });

  it("does not store duplicates", () => {
    expect(addRecentQuestion(["א", "ב"], "א")).toEqual(["ב", "א"]);
  });
});
