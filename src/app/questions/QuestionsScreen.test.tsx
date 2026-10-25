// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back: vi.fn() }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/apiClient", () => ({ fetchQuestion: vi.fn() }));

import GameProvider from "@/components/GameProvider";
import { fetchQuestion } from "@/lib/apiClient";
import QuestionsScreen from "./QuestionsScreen";

const mockedFetch = vi.mocked(fetchQuestion);

const QUESTION = {
  question: "מהו היצור החי הגדול ביותר בעולם?",
  options: ["פיל", "לווייתן כחול", "ג'ירפה", "דוב קוטב"],
  correctOptionIndex: 1,
};

const FEEDBACK_TIMEOUT = { timeout: 3000 };

function renderScreen() {
  render(
    <GameProvider>
      <QuestionsScreen />
    </GameProvider>,
  );
}

async function findOption(text: string) {
  return screen.findByRole("button", { name: new RegExp(text) });
}

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue({ ok: true, question: QUESTION });
  push.mockReset();
});

afterEach(cleanup);

describe("answering a question", () => {
  it("counts only the first choice and locks all options", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(await findOption("פיל"));
    await user.click(await findOption("לווייתן כחול"));
    await user.click(await findOption("ג'ירפה"));

    for (const option of QUESTION.options) {
      expect(screen.getByRole("button", { name: new RegExp(option) })).toHaveProperty("disabled", true);
    }
    // The wrong choice and the right answer are both marked
    expect(screen.getByRole("button", { name: /פיל/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("תשובה שגויה")).toBeTruthy();
    expect(screen.getByText("תשובה נכונה")).toBeTruthy();

    expect(await screen.findByText("לא נכון", {}, FEEDBACK_TIMEOUT)).toBeTruthy();
    expect(screen.getByText(/ניקוד:/)).toHaveProperty("textContent", "ניקוד: 0");
  });

  it("shows success and adds one point for a correct answer", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(await findOption("לווייתן כחול"));
    // Short marking on the question screen first
    expect(screen.getByText("תשובה נכונה")).toBeTruthy();
    expect(screen.queryByText("כל הכבוד!")).toBeNull();

    expect(await screen.findByText("כל הכבוד!", {}, FEEDBACK_TIMEOUT)).toBeTruthy();
    expect(screen.getByText("התשובה נכונה")).toBeTruthy();
    expect(screen.getByText(/נקודה/)).toHaveProperty("textContent", "+1 נקודה");
    expect(screen.getByText(/ניקוד:/)).toHaveProperty("textContent", "ניקוד: 1");
  });

  it("reveals the correct answer after a wrong answer", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(await findOption("דוב קוטב"));

    expect(await screen.findByText("לא נכון", {}, FEEDBACK_TIMEOUT)).toBeTruthy();
    expect(screen.getByText("התשובה הנכונה היא:")).toBeTruthy();
    expect(screen.getByText("לווייתן כחול")).toBeTruthy();
  });
});

describe("after the feedback", () => {
  it("asks for the next question on the same topic without repeating recent ones", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(await findOption("לווייתן כחול"));
    await user.click(await screen.findByRole("button", { name: "שאלה הבאה" }, FEEDBACK_TIMEOUT));

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    expect(mockedFetch.mock.calls[1][0]).toEqual({ topic: "", recentQuestions: [QUESTION.question] });
    // The score carries over to the next question
    expect(await screen.findByText(/ניקוד:/)).toHaveProperty("textContent", "ניקוד: 1");
  });

  it("goes Home from the feedback screen's back button", async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(await findOption("פיל"));
    await screen.findByText("לא נכון", {}, FEEDBACK_TIMEOUT);
    await user.click(screen.getByRole("button", { name: "חזרה" }));

    expect(push).toHaveBeenCalledWith("/");
    expect(screen.getByRole("link", { name: /החליפו נושא/ }).getAttribute("href")).toBe("/");
  });
});

describe("unsuitable topic", () => {
  it("shows the friendly message and no question", async () => {
    mockedFetch.mockResolvedValue({ ok: false, code: "TOPIC_NOT_ALLOWED" });
    renderScreen();

    expect(await screen.findByText("בואו נבחר נושא אחר")).toBeTruthy();
    expect(screen.getByText("הנושא הזה לא מתאים לחידון. נסו לבחור נושא אחר.")).toBeTruthy();
    expect(screen.queryByText("שאלה")).toBeNull();
    expect(screen.queryByText(/ניקוד:/)).toBeNull();
    expect(screen.queryByText("אופס!")).toBeNull();
  });

  it("'בחרו נושא אחר' and the back button go Home", async () => {
    const user = userEvent.setup();
    mockedFetch.mockResolvedValue({ ok: false, code: "TOPIC_NOT_ALLOWED" });
    renderScreen();

    await user.click(await screen.findByRole("button", { name: /בחרו נושא אחר/ }));
    expect(push).toHaveBeenCalledWith("/");

    push.mockReset();
    await user.click(screen.getByRole("button", { name: "חזרה" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
