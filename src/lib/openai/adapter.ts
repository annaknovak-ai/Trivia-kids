// The only module that talks to OpenAI and reads its env vars (server-side only)
import OpenAI from "openai";

const TIMEOUT_MS = 15_000;
const MAX_OUTPUT_TOKENS = 500;
const MAX_CLASSIFY_TOKENS = 50;
const MODERATION_MODEL = "omni-moderation-latest";

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

const TOPIC_CHECK_SCHEMA = {
  type: "object",
  properties: { allowed: { type: "boolean" } },
  required: ["allowed"],
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

function toProviderError(err: unknown): ProviderError {
  if (err instanceof OpenAI.APIConnectionTimeoutError) return new ProviderError("timeout");
  const status = err instanceof OpenAI.APIError ? String(err.status ?? "") : "";
  return new ProviderError("provider", status);
}

// One structured (JSON Schema) call to the configured model; returns the parsed, not yet validated, JSON
async function requestStructured(
  instructions: string,
  input: string,
  name: string,
  schema: Record<string, unknown>,
  maxOutputTokens: number,
): Promise<unknown> {
  const model = process.env.OPENAI_MODEL;
  if (!model) throw new ProviderError("config", "OPENAI_MODEL is missing");

  let response;
  try {
    response = await getClient().responses.create({
      model,
      instructions,
      input,
      reasoning: { effort: "none" },
      max_output_tokens: maxOutputTokens,
      store: false,
      text: { format: { type: "json_schema", name, strict: true, schema } },
    });
  } catch (err) {
    throw toProviderError(err);
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

// Asks the model for one question
export function requestQuestion(instructions: string, input: string): Promise<unknown> {
  return requestStructured(instructions, input, "trivia_question", QUESTION_SCHEMA, MAX_OUTPUT_TOKENS);
}

// Asks the model whether a topic suits the kids' quiz; expected shape: { allowed: boolean }
export function classifyTopic(instructions: string, input: string): Promise<unknown> {
  return requestStructured(instructions, input, "topic_check", TOPIC_CHECK_SCHEMA, MAX_CLASSIFY_TOKENS);
}

// OpenAI Moderation API: true if any of the texts is flagged
export async function moderate(texts: string[]): Promise<boolean> {
  let response;
  try {
    response = await getClient().moderations.create({ model: MODERATION_MODEL, input: texts });
  } catch (err) {
    throw toProviderError(err);
  }
  if (response.results.length !== texts.length) throw new ProviderError("invalid_output", "moderation");
  return response.results.some((r) => r.flagged);
}
