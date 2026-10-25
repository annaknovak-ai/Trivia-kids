// Client-side wrapper for POST /api/trivia — maps every failure to an error code
import type { ApiErrorCode, TriviaQuestion } from "@/lib/trivia/types";
import { validateQuestion } from "@/lib/trivia/validation";

const CLIENT_TIMEOUT_MS = 20_000;

export type FetchQuestionResult = { ok: true; question: TriviaQuestion } | { ok: false; code: ApiErrorCode };

export async function fetchQuestion(
  params: { topic: string; recentQuestions?: string[] },
  signal?: AbortSignal,
): Promise<FetchQuestionResult> {
  const timeoutSignal = AbortSignal.timeout(CLIENT_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  try {
    const res = await fetch("/api/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: params.topic, recentQuestions: params.recentQuestions ?? [] }),
      signal: combined,
    });
    const body: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
      return { ok: false, code: code === "TOPIC_NOT_ALLOWED" ? code : "QUESTION_UNAVAILABLE" };
    }

    // Never show a question that fails the structure check
    const question = validateQuestion(body);
    return question ? { ok: true, question } : { ok: false, code: "QUESTION_UNAVAILABLE" };
  } catch (err) {
    // Re-throw caller aborts so the screen can ignore them; everything else is a friendly error
    if (signal?.aborted) throw err;
    return { ok: false, code: "QUESTION_UNAVAILABLE" };
  }
}
