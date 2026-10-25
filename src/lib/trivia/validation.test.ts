import { describe, expect, it } from "vitest";
import { normalizeTopic, parseTriviaRequest, shuffleOptions, validateQuestion } from "./validation";

const VALID = {
  question: "איזה כוכב לכת מכונה הכוכב האדום?",
  options: ["נוגה", "מאדים", "צדק", "שבתאי"],
  correctOptionIndex: 1,
};

describe("topic validation", () => {
  it("accepts a normal topic", () => {
    expect(parseTriviaRequest({ topic: "חלל" })).toEqual({ topic: "חלל", recentQuestions: [] });
  });

  it("accepts exactly 40 characters and rejects 41", () => {
    expect(parseTriviaRequest({ topic: "א".repeat(40) })).not.toBeNull();
    expect(parseTriviaRequest({ topic: "א".repeat(41) })).toBeNull();
  });

  it("rejects a topic that is not a string", () => {
    expect(parseTriviaRequest({ topic: 5 })).toBeNull();
    expect(parseTriviaRequest({ topic: ["חלל"] })).toBeNull();
    expect(parseTriviaRequest({ topic: { a: 1 } })).toBeNull();
  });

  it("rejects a body that is not an object", () => {
    expect(parseTriviaRequest(null)).toBeNull();
    expect(parseTriviaRequest("חלל")).toBeNull();
    expect(parseTriviaRequest([])).toBeNull();
  });

  it("validates recentQuestions", () => {
    expect(parseTriviaRequest({ topic: "חלל", recentQuestions: ["שאלה?"] })?.recentQuestions).toEqual(["שאלה?"]);
    expect(parseTriviaRequest({ topic: "חלל", recentQuestions: Array(11).fill("ש") })).toBeNull();
    expect(parseTriviaRequest({ topic: "חלל", recentQuestions: "שאלה" })).toBeNull();
    expect(parseTriviaRequest({ topic: "חלל", recentQuestions: [1] })).toBeNull();
    expect(parseTriviaRequest({ topic: "חלל", recentQuestions: ["ש".repeat(201)] })).toBeNull();
  });
});

describe("mapping to a general question", () => {
  it.each([[""], ["   "], [undefined], [null]])("treats %j as a general question", (topic) => {
    expect(normalizeTopic(topic)).toBeNull();
    expect(parseTriviaRequest(topic === undefined ? {} : { topic })?.topic).toBeNull();
  });

  it("trims spaces around a topic", () => {
    expect(normalizeTopic("  חלל  ")).toBe("חלל");
  });
});

describe("question structure", () => {
  it("accepts a valid question", () => {
    expect(validateQuestion(VALID)).toEqual(VALID);
  });

  it.each([
    ["3 options", { ...VALID, options: ["א", "ב", "ג"] }],
    ["5 options", { ...VALID, options: ["א", "ב", "ג", "ד", "ה"] }],
    ["an empty option", { ...VALID, options: ["נוגה", " ", "צדק", "שבתאי"] }],
    ["a non-string option", { ...VALID, options: ["נוגה", 2, "צדק", "שבתאי"] }],
    ["duplicate options", { ...VALID, options: ["נוגה", "נוגה", "צדק", "שבתאי"] }],
    ["index 4", { ...VALID, correctOptionIndex: 4 }],
    ["index -1", { ...VALID, correctOptionIndex: -1 }],
    ["index 1.5", { ...VALID, correctOptionIndex: 1.5 }],
    ["string index", { ...VALID, correctOptionIndex: "1" }],
    ["empty question", { ...VALID, question: "  " }],
    ["missing question", { options: VALID.options, correctOptionIndex: 1 }],
    ["missing index", { question: VALID.question, options: VALID.options }],
    ["null", null],
  ])("rejects %s", (_name, raw) => {
    expect(validateQuestion(raw)).toBeNull();
  });
});

describe("shuffling options", () => {
  it("keeps the same correct answer text", () => {
    for (let i = 0; i < 50; i++) {
      const shuffled = shuffleOptions(VALID);
      expect(shuffled.options[shuffled.correctOptionIndex]).toBe("מאדים");
      expect([...shuffled.options].sort()).toEqual([...VALID.options].sort());
    }
  });

  it("moves the correct answer with a fixed random source", () => {
    // random() = 0 always swaps with index 0 → order [1, 2, 3, 0]
    const shuffled = shuffleOptions(VALID, () => 0);
    expect(shuffled.options).toEqual(["מאדים", "צדק", "שבתאי", "נוגה"]);
    expect(shuffled.correctOptionIndex).toBe(0);
  });
});
