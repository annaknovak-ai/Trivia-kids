import type { TriviaQuestion } from "@/lib/trivia/types";
import styles from "./QuestionView.module.css";

const LETTERS = ["א", "ב", "ג", "ד"];

// Question card + four answer options in the Default state (DESIGN.md 1.3).
// Choosing an answer, locking and feedback arrive in Milestone 3.
export default function QuestionView({ question }: { question: TriviaQuestion }) {
  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <p className={styles.label}>שאלה</p>
        <h2 className={`t-h2 ${styles.text}`}>{question.question}</h2>
      </section>

      <ul className={styles.options}>
        {question.options.map((option, i) => (
          <li key={i}>
            <button type="button" className={styles.option}>
              <span className={styles.letter} aria-hidden="true">
                {LETTERS[i]}
              </span>
              <span className={styles.optionText}>{option}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
