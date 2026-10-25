// The only module that talks to OpenAI and reads its env vars (server-side only)
import OpenAI from "openai";

const TIMEOUT_MS = 15_000;
const MAX_OUTPUT_TOKENS = 500;

// Structured Outputs schema; the server still validates the result (see validation.ts)
const QUESTION_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    correctOptionIndex: { type: "integer" },
  },
  required: ["question", "options", "correctOptionIndex"],
  additionalProperties: false,
} as const;

export type ProviderErrorKind = "config" | "timeout" | "provider" | "refusal" | "invalid_output";

export class ProviderError extends Error {
  constructor(public kind: ProviderErrorKind, detail?: string) {
    super(detail ? `${kind}: ${detail}` : kind);
  }
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ProviderError("config", "OPENAI_API_KEY is missing");
  client ??= new OpenAI({ apiKey, timeout: TIMEOUT_MS, maxRetries: 0 });
  return client;
}

// Asks the model for one question and returns the parsed (not yet validated) JSON
export async function requestQuestion(instructions: string, input: string): Promise<unknown> {
  const model = process.env.OPENAI_MODEL;
  if (!model) throw new ProviderError("config", "OPENAI_MODEL is missing");

  let response;
  try {
    response = await getClient().responses.create({
      model,
      instructions,
      input,
      reasoning: { effort: "none" },
      max_output_tokens: MAX_OUTPUT_TOKENS,
      store: false,
      text: {
        format: { type: "json_schema", name: "trivia_question", strict: true, schema: QUESTION_SCHEMA },
      },
    });
  } catch (err) {
    if (err instanceof OpenAI.APIConnectionTimeoutError) throw new ProviderError("timeout");
    const status = err instanceof OpenAI.APIError ? String(err.status ?? "") : "";
    throw new ProviderError("provider", status);
  }

  if (response.status !== "completed") throw new ProviderError("invalid_output", response.status ?? "");

  const refused = response.output.some(
    (item) => item.type === "message" && item.content.some((c) => c.type === "refusal"),
  );
  if (refused) throw new ProviderError("refusal");

  try {
    return JSON.parse(response.output_text);
  } catch {
    throw new ProviderError("invalid_output", "not JSON");
  }
}
