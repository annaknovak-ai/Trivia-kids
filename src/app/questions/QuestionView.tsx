import { CheckIcon, CloseIcon } from "@/components/icons";
import type { TriviaQuestion } from "@/lib/trivia/types";
import styles from "./QuestionView.module.css";

const LETTERS = ["א", "ב", "ג", "ד"];

type OptionState = "default" | "correct" | "wrong" | "locked";

// After a choice: the chosen option is Correct/Wrong, the right answer is always Correct,
// and the rest are Locked (DESIGN.md 1.3)
function optionState(question: TriviaQuestion, selected: number | null, index: number): OptionState {
  if (selected === null) return "default";
  if (index === question.correctOptionIndex) return "correct";
  if (index === selected) return "wrong";
  return "locked";
}

type Props = {
  question: TriviaQuestion;
  selected: number | null;
  onSelect: (index: number) => void;
};

// Question card + four answer options (DESIGN.md 1.3)
export default function QuestionView({ question, selected, onSelect }: Props) {
  const answered = selected !== null;

  return (
    <div className={styles.wrap}>
      <section className={styles.card}>
        <p className={styles.label}>שאלה</p>
        <h2 className={`t-h2 ${styles.text}`}>{question.question}</h2>
      </section>

      <ul className={styles.options}>
        {question.options.map((option, i) => {
          const state = optionState(question, selected, i);
          return (
            <li key={i}>
              <button
                type="button"
                className={`${styles.option} ${styles[state]}`}
                onClick={() => onSelect(i)}
                disabled={answered}
                aria-pressed={selected === i}
              >
                <span className={styles.letter} aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <span className={styles.optionText}>{option}</span>
                {state === "correct" && (
                  <span className={styles.mark}>
                    <CheckIcon size={20} strokeWidth={2.6} />
                    <span className={styles.srOnly}>תשובה נכונה</span>
                  </span>
                )}
                {state === "wrong" && (
                  <span className={styles.mark}>
                    <CloseIcon size={20} strokeWidth={2.6} />
                    <span className={styles.srOnly}>תשובה שגויה</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
