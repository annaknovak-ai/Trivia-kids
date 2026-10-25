"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGame } from "@/components/GameProvider";
import ScoreChip from "@/components/ScoreChip";
import TopBar from "@/components/TopBar";
import { fetchQuestion } from "@/lib/apiClient";
import ErrorView from "./ErrorView";
import FeedbackView from "./FeedbackView";
import LoadingView from "./LoadingView";
import NotAllowedView from "./NotAllowedView";
import QuestionView from "./QuestionView";
import styles from "./page.module.css";

// How long the correct/wrong marking stays on the question screen before the feedback screen
export const REVEAL_MS = 1000;

export default function QuestionsScreen() {
  const router = useRouter();
  const { started, currentTopic, requestKey, recentQuestions, view, score, dispatch } = useGame();

  // Questions tab before playing: ask for a general question
  useEffect(() => {
    if (!started) dispatch({ type: "start", topic: "" });
  }, [started, dispatch]);

  const loading = started && view.kind === "loading";

  useEffect(() => {
    if (!loading) return;
    const controller = new AbortController();
    // Deferred start: React Strict Mode's mount/unmount/mount in dev clears the first timer,
    // so only one request is ever sent per request key
    const timer = setTimeout(async () => {
      try {
        const res = await fetchQuestion({ topic: currentTopic, recentQuestions }, controller.signal);
        dispatch(
          res.ok
            ? { type: "receiveQuestion", key: requestKey, question: res.question }
            : { type: "receiveError", key: requestKey, code: res.code },
        );
      } catch {
        // Aborted because the screen was left — the request is sent again on return
      }
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // recentQuestions is read for the current request only and must not trigger a new one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, requestKey, currentTopic, dispatch]);

  const revealing = view.kind === "question" && view.phase === "reveal";

  useEffect(() => {
    if (!revealing) return;
    const timer = setTimeout(() => dispatch({ type: "showFeedback" }), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [revealing, dispatch]);

  const showingFeedback = view.kind === "question" && view.phase === "feedback";

  // Back to Home with an empty topic box (DESIGN.md 1.6א)
  function chooseOtherTopic() {
    dispatch({ type: "chooseOtherTopic" });
    router.push("/");
  }

  const onBack = showingFeedback
    ? // From the feedback screens, "back" goes Home like "החליפו נושא" (DESIGN.md 1.4)
      () => router.push("/")
    : view.kind === "notAllowed"
      ? chooseOtherTopic
      : undefined;

  return (
    <>
      <TopBar title="חידונצ'יק" onBack={onBack} />
      <main className={`${styles.main} ${view.kind === "question" ? "" : styles.centered}`}>
        {view.kind === "loading" && <LoadingView />}
        {view.kind === "error" && <ErrorView onRetry={() => dispatch({ type: "retry" })} />}
        {view.kind === "notAllowed" && <NotAllowedView onChooseOther={chooseOtherTopic} />}
        {view.kind === "question" && (
          <>
            <div className={styles.scoreRow}>
              <ScoreChip score={score} />
            </div>
            {view.phase === "feedback" && view.selected !== null ? (
              <FeedbackView
                question={view.question}
                selected={view.selected}
                onNext={() => dispatch({ type: "next" })}
              />
            ) : (
              <QuestionView
                question={view.question}
                selected={view.selected}
                onSelect={(index) => dispatch({ type: "select", index })}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
