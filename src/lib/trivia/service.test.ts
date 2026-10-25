import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openai/adapter", () => ({ requestQuestion: vi.fn() }));

import { requestQuestion } from "@/lib/openai/adapter";
import { buildInput, generateQuestion, InvalidOutputError } from "./service";

const mockedRequest = vi.mocked(requestQuestion);

const VALID = {
  question: "איזה כוכב לכת מכונה הכוכב האדום?",
  options: ["נוגה", "מאדים", "צדק", "שבתאי"],
  correctOptionIndex: 1,
};

beforeEach(() => mockedRequest.mockReset());

describe("generateQuestion", () => {
  it("returns a valid question with the correct answer preserved after shuffling", async () => {
    mockedRequest.mockResolvedValue(VALID);
    const q = await generateQuestion({ topic: "חלל", recentQuestions: [] });
    expect(q.question).toBe(VALID.question);
    expect(q.options).toHaveLength(4);
    expect(q.options[q.correctOptionIndex]).toBe("מאדים");
  });

  it("throws on invalid output", async () => {
    mockedRequest.mockResolvedValue({ ...VALID, options: ["א", "ב"] });
    await expect(generateQuestion({ topic: "חלל", recentQuestions: [] })).rejects.toBeInstanceOf(
      InvalidOutputError,
    );
  });

  it("passes the topic as delimited data", async () => {
    mockedRequest.mockResolvedValue(VALID);
    await generateQuestion({ topic: "חלל", recentQuestions: ["שאלה קודמת?"] });
    const input = mockedRequest.mock.calls[0][1];
    expect(input).toContain("<<<חלל>>>");
    expect(input).toContain("- שאלה קודמת?");
  });
});

describe("buildInput", () => {
  it("asks for a general question when there is no topic", () => {
    const input = buildInput({ topic: null, recentQuestions: [] });
    expect(input).toContain("general-knowledge");
    expect(input).not.toContain("<<<");
  });
});
