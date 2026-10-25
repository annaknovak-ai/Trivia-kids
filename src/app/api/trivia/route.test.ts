import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openai/adapter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/openai/adapter")>();
  return { ...actual, requestQuestion: vi.fn() };
});

import { ProviderError, requestQuestion } from "@/lib/openai/adapter";
import { POST } from "./route";

const mockedRequest = vi.mocked(requestQuestion);

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
  vi.spyOn(console, "error").mockImplementation(() => {});
});

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
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).not.toContain("דינוזאורים");
  });
});
