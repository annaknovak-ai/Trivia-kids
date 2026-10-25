import Button from "@/components/Button";
import StatusCircle from "@/components/StatusCircle";
import { CheckIcon, CloseIcon, HomeIcon, StarFilledIcon } from "@/components/icons";
import { isCorrectAnswer } from "@/lib/game/gameState";
import type { TriviaQuestion } from "@/lib/trivia/types";
import styles from "./FeedbackView.module.css";

type Props = {
  question: TriviaQuestion;
  selected: number;
  onNext: () => void;
};

// Correct / wrong answer screens (DESIGN.md 1.4–1.5)
export default function FeedbackView({ question, selected, onNext }: Props) {
  const correct = isCorrectAnswer(question, selected);

  return (
    <div className={styles.wrap}>
      <section className={`${styles.card} ${correct ? styles.correct : styles.wrong}`} role="status">
        {correct ? (
          <>
            <StatusCircle variant="mint">
              <CheckIcon size={32} strokeWidth={3} />
            </StatusCircle>
            <h1 className={`t-h1 ${styles.title}`}>כל הכבוד!</h1>
            <p className={`t-body ${styles.text}`}>התשובה נכונה</p>
            <span className={`t-micro ${styles.points}`}>
              <StarFilledIcon size={14} className={styles.star} />
              <span>
                <bdi dir="ltr">+1</bdi> נקודה
              </span>
            </span>
          </>
        ) : (
          <>
            <StatusCircle variant="coral">
              <CloseIcon size={32} strokeWidth={3} />
            </StatusCircle>
            <h1 className={`t-h1 ${styles.title}`}>לא נכון</h1>
            <p className={`t-body ${styles.text}`}>התשובה הנכונה היא:</p>
            <p className={styles.answer}>
              <CheckIcon size={20} strokeWidth={2.6} />
              <span>{question.options[question.correctOptionIndex]}</span>
            </p>
          </>
        )}
      </section>

      <div className={styles.actions}>
        <Button onClick={onNext}>שאלה הבאה</Button>
        <Button href="/" variant="secondary" icon={<HomeIcon size={20} />}>
          החליפו נושא
        </Button>
      </div>
    </div>
  );
}
