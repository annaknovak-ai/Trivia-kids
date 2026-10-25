import type { TriviaQuestion, TriviaRequest } from "./types";

export const MAX_TOPIC_LENGTH = 40;
export const MAX_RECENT_QUESTIONS = 10;
export const MAX_QUESTION_LENGTH = 200;
export const MAX_OPTION_LENGTH = 80;
export const OPTION_COUNT = 4;

// Empty or whitespace-only topic means "general trivia question"
export function normalizeTopic(topic: string | null | undefined): string | null {
  const trimmed = (topic ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

// Validates the raw JSON body of POST /api/trivia. Returns null if invalid.
export function parseTriviaRequest(body: unknown): TriviaRequest | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  const { topic, recentQuestions } = body as Record<string, unknown>;

  if (topic !== undefined && topic !== null && typeof topic !== "string") return null;
  const normalized = normalizeTopic(topic);
  if (normalized !== null && normalized.length > MAX_TOPIC_LENGTH) return null;

  let recent: string[] = [];
  if (recentQuestions !== undefined) {
    if (!Array.isArray(recentQuestions) || recentQuestions.length > MAX_RECENT_QUESTIONS) return null;
    if (!recentQuestions.every((q) => typeof q === "string" && q.length <= MAX_QUESTION_LENGTH)) {
      return null;
    }
    recent = recentQuestions as string[];
  }

  return { topic: normalized, recentQuestions: recent };
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim() !== "" && value.length <= maxLength;
}

// Checks a question's structure. Returns a clean (trimmed) copy, or null if invalid.
export function validateQuestion(raw: unknown): TriviaQuestion | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { question, options, correctOptionIndex } = raw as Record<string, unknown>;

  if (!isNonEmptyString(question, MAX_QUESTION_LENGTH)) return null;
  if (!Array.isArray(options) || options.length !== OPTION_COUNT) return null;
  if (!options.every((o) => isNonEmptyString(o, MAX_OPTION_LENGTH))) return null;

  const trimmedOptions = (options as string[]).map((o) => o.trim());
  if (new Set(trimmedOptions).size !== OPTION_COUNT) return null;

  if (
    typeof correctOptionIndex !== "number" ||
    !Number.isInteger(correctOptionIndex) ||
    correctOptionIndex < 0 ||
    correctOptionIndex >= OPTION_COUNT
  ) {
    return null;
  }

  return { question: question.trim(), options: trimmedOptions, correctOptionIndex };
}

// Fisher–Yates shuffle of the options, keeping correctOptionIndex pointing at the same answer
export function shuffleOptions(q: TriviaQuestion, random: () => number = Math.random): TriviaQuestion {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    question: q.question,
    options: order.map((i) => q.options[i]),
    correctOptionIndex: order.indexOf(q.correctOptionIndex),
  };
}
