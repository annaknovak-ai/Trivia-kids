"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { fetchQuestion } from "@/lib/apiClient";
import type { TriviaQuestion } from "@/lib/trivia/types";
import ErrorView from "./ErrorView";
import LoadingView from "./LoadingView";
import QuestionView from "./QuestionView";
import styles from "./page.module.css";

// Each result is tagged with the request it answers; any other request shows the loading state
type Result = { key: string } & ({ status: "question"; question: TriviaQuestion } | { status: "error" });

export default function QuestionsScreen() {
  const { currentTopic, requestId } = useGame();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  // "Try again" repeats the same request (same topic) as a new attempt
  const key = `${requestId}:${attempt}`;
  const done = result?.key === key;

  useEffect(() => {
    // Screen re-shown (Next.js keeps visited routes alive) and the result is already here
    if (done) return;
    const controller = new AbortController();
    // Deferred start: React Strict Mode's mount/unmount/mount in dev clears the first timer,
    // so only one request is ever sent per attempt
    const timer = setTimeout(async () => {
      try {
        const res = await fetchQuestion({ topic: currentTopic }, controller.signal);
        setResult(res.ok ? { key, status: "question", question: res.question } : { key, status: "error" });
      } catch {
        // Aborted because the screen was left — nothing to show
      }
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, done, currentTopic]);

  const view = done ? result : null;

  return (
    <main className={`${styles.main} ${view ? "" : styles.centered}`}>
      {!view && <LoadingView />}
      {view?.status === "question" && <QuestionView question={view.question} />}
      {view?.status === "error" && <ErrorView onRetry={() => setAttempt((n) => n + 1)} />}
    </main>
  );
}
