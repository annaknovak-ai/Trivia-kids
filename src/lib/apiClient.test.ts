import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchQuestion } from "./apiClient";

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchQuestion error mapping", () => {
  it("maps a rate-limited response (429) to the friendly error", async () => {
    mockFetch(async () => new Response("Too Many Requests", { status: 429 }));
    expect(await fetchQuestion({ topic: "חלל" })).toEqual({ ok: false, code: "QUESTION_UNAVAILABLE" });
  });

  it("maps a network failure (offline) to the friendly error", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await fetchQuestion({ topic: "חלל" })).toEqual({ ok: false, code: "QUESTION_UNAVAILABLE" });
  });

  it("keeps TOPIC_NOT_ALLOWED for 422", async () => {
    mockFetch(async () =>
      Response.json({ error: { code: "TOPIC_NOT_ALLOWED", message: "" } }, { status: 422 }),
    );
    expect(await fetchQuestion({ topic: "x" })).toEqual({ ok: false, code: "TOPIC_NOT_ALLOWED" });
  });

  it("returns a valid question on 200", async () => {
    const question = { question: "שאלה?", options: ["א", "ב", "ג", "ד"], correctOptionIndex: 2 };
    mockFetch(async () => Response.json(question));
    expect(await fetchQuestion({ topic: "" })).toEqual({ ok: true, question });
  });
});
