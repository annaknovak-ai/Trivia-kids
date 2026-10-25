import { ProviderError } from "@/lib/openai/adapter";
import { generateQuestion, InvalidOutputError } from "@/lib/trivia/service";
import type { ApiErrorBody } from "@/lib/trivia/types";
import { parseTriviaRequest } from "@/lib/trivia/validation";

const UNAVAILABLE: ApiErrorBody = {
  error: { code: "QUESTION_UNAVAILABLE", message: "לא הצלחנו ליצור שאלה כרגע. נסו שוב." },
};

// Minimal log: internal reason + duration only — never the topic or generated content
function logFailure(reason: string, startedAt: number) {
  console.error(`[api/trivia] failed reason=${reason} durationMs=${Date.now() - startedAt}`);
}

function unavailable() {
  return Response.json(UNAVAILABLE, { status: 503 });
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logFailure("invalid_json", startedAt);
    return unavailable();
  }

  const triviaRequest = parseTriviaRequest(body);
  if (!triviaRequest) {
    logFailure("invalid_input", startedAt);
    return unavailable();
  }

  try {
    const question = await generateQuestion(triviaRequest);
    return Response.json(question);
  } catch (err) {
    const reason =
      err instanceof ProviderError ? err.message : err instanceof InvalidOutputError ? "invalid_output" : "unknown";
    logFailure(reason, startedAt);
    return unavailable();
  }
}
