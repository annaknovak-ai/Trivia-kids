import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openai/adapter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/openai/adapter")>();
  return { ...actual, requestQuestion: vi.fn(), classifyTopic: vi.fn(), moderate: vi.fn() };
});

import { classifyTopic, moderate, ProviderError, requestQuestion } from "@/lib/openai/adapter";
import { POST } from "./route";

const mockedRequest = vi.mocked(requestQuestion);
const mockedClassify = vi.mocked(classifyTopic);
const mockedModerate = vi.mocked(moderate);

const VALID = {
  question: "איזה כוכב לכת מכונה הכוכב האדום?",
  options: ["נוגה", "מאדים", "צדק", "שבתאי"],
  correctOptionIndex: 1,
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

async function expectUnavailable(res: Response) {
  expect(res.status).toBe(503);
  const body = await res.json();
  expect(body).toEqual({
    error: { code: "QUESTION_UNAVAILABLE", message: "לא הצלחנו ליצור שאלה כרגע. נסו שוב." },
  });
}

beforeEach(() => {
  mockedRequest.mockReset();
  mockedClassify.mockReset();
  mockedModerate.mockReset();
  mockedClassify.mockResolvedValue({ allowed: true });
  mockedModerate.mockResolvedValue(false);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

function allLogs() {
  return [...vi.mocked(console.error).mock.calls, ...vi.mocked(console.info).mock.calls].flat().join(" ");
}

describe("POST /api/trivia", () => {
  it("returns 200 with a question for a valid topic", async () => {
    mockedRequest.mockResolvedValue(VALID);
    const res = await post({ topic: "חלל" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["correctOptionIndex", "options", "question"]);
    expect(body.options).toHaveLength(4);
    expect(body.options[body.correctOptionIndex]).toBe("מאדים");
  });

  it("returns 200 for an empty topic (general question)", async () => {
    mockedRequest.mockResolvedValue(VALID);
    const res = await post({ topic: "" });
    expect(res.status).toBe(200);
    expect(mockedRequest.mock.calls[0][1]).toContain("general-knowledge");
  });

  it("returns 503 when the provider fails", async () => {
    mockedRequest.mockRejectedValue(new ProviderError("provider", "500"));
    await expectUnavailable(await post({ topic: "חלל" }));
  });

  it("returns 503 on timeout", async () => {
    mockedRequest.mockRejectedValue(new ProviderError("timeout"));
    await expectUnavailable(await post({ topic: "חלל" }));
  });

  it("returns 503 on invalid model output", async () => {
    mockedRequest.mockResolvedValue({ ...VALID, correctOptionIndex: 7 });
    await expectUnavailable(await post({ topic: "חלל" }));
  });

  it("returns 503 on a JSON body that cannot be parsed", async () => {
    await expectUnavailable(await post("{not json"));
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it("returns 503 for a topic over 40 characters without calling the model", async () => {
    await expectUnavailable(await post({ topic: "א".repeat(41) }));
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it("does not leak internal details in the error body", async () => {
    mockedRequest.mockRejectedValue(new Error("secret internal stack sk-test"));
    const res = await post({ topic: "חלל" });
    const text = await res.text();
    expect(text).not.toContain("sk-");
    expect(text).not.toContain("internal");
  });

  it("never logs the topic", async () => {
    mockedRequest.mockRejectedValue(new ProviderError("provider"));
    await post({ topic: "דינוזאורים" });
    expect(allLogs()).not.toContain("דינוזאורים");
  });
});

describe("topic safety", () => {
  it("returns 422 TOPIC_NOT_ALLOWED for an unsuitable topic without generating a question", async () => {
    mockedClassify.mockResolvedValue({ allowed: false });
    const res = await post({ topic: "סמים" });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: { code: "TOPIC_NOT_ALLOWED", message: "הנושא הזה לא מתאים לחידון. נסו לבחור נושא אחר." },
    });
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it("returns 422 when moderation flags the topic", async () => {
    mockedModerate.mockResolvedValue(true);
    const res = await post({ topic: "משהו לא מתאים" });
    expect(res.status).toBe(422);
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it("returns 503 and hides the question when generated content fails moderation", async () => {
    mockedRequest.mockResolvedValue(VALID);
    // Topic passes, generated content is flagged
    mockedModerate.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const res = await post({ topic: "חלל" });
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain("מאדים");
  });

  it("fails closed with 503 when moderation is unavailable", async () => {
    mockedModerate.mockRejectedValue(new ProviderError("provider", "500"));
    await expectUnavailable(await post({ topic: "חלל" }));
    expect(mockedRequest).not.toHaveBeenCalled();
  });
});

describe("logs", () => {
  it("logs id, status and duration only — never the topic or the question", async () => {
    mockedRequest.mockResolvedValue(VALID);
    await post({ topic: "דינוזאורים" });
    mockedClassify.mockResolvedValue({ allowed: false });
    await post({ topic: "סמים" });

    const logged = allLogs();
    expect(logged).toMatch(/id=[0-9a-f-]{36} status=200 reason=ok durationMs=\d+/);
    expect(logged).toMatch(/status=422 reason=topic_not_allowed/);
    for (const text of ["דינוזאורים", "סמים", VALID.question, ...VALID.options]) {
      expect(logged).not.toContain(text);
    }
  });
});
