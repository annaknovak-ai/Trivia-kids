import { ProviderError } from "@/lib/openai/adapter";
import { generateQuestion, InvalidOutputError, TopicNotAllowedError, UnsafeContentError } from "@/lib/trivia/service";
import type { ApiErrorBody } from "@/lib/trivia/types";
import { parseTriviaRequest } from "@/lib/trivia/validation";

const UNAVAILABLE: ApiErrorBody = {
  error: { code: "QUESTION_UNAVAILABLE", message: "לא הצלחנו ליצור שאלה כרגע. נסו שוב." },
};

const NOT_ALLOWED: ApiErrorBody = {
  error: { code: "TOPIC_NOT_ALLOWED", message: "הנושא הזה לא מתאים לחידון. נסו לבחור נושא אחר." },
};

// Minimal log: request id, status, internal reason and duration — never the topic or generated content
function logResult(id: string, status: number, reason: string, startedAt: number) {
  const line = `[api/trivia] id=${id} status=${status} reason=${reason} durationMs=${Date.now() - startedAt}`;
  if (status === 200) console.info(line);
  else console.error(line);
}

function failureReason(err: unknown): string {
  if (err instanceof ProviderError) return err.message;
  if (err instanceof InvalidOutputError) return "invalid_output";
  if (err instanceof UnsafeContentError) return "unsafe_content";
  return "unknown";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const id = crypto.randomUUID();

  function unavailable(reason: string) {
    logResult(id, 503, reason, startedAt);
    return Response.json(UNAVAILABLE, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return unavailable("invalid_json");
  }

  const triviaRequest = parseTriviaRequest(body);
  if (!triviaRequest) return unavailable("invalid_input");

  try {
    const question = await generateQuestion(triviaRequest);
    logResult(id, 200, "ok", startedAt);
    return Response.json(question);
  } catch (err) {
    if (err instanceof TopicNotAllowedError) {
      logResult(id, 422, "topic_not_allowed", startedAt);
      return Response.json(NOT_ALLOWED, { status: 422 });
    }
    return unavailable(failureReason(err));
  }
}
