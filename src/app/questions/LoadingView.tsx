import { BrainIcon } from "@/components/icons";
import styles from "./LoadingView.module.css";

// "Creating a question" state (DESIGN.md 1.2)
export default function LoadingView() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.halo} aria-hidden="true">
        <div className={styles.circle}>
          <BrainIcon size={36} />
        </div>
      </div>
      <h2 className={`t-h2 ${styles.title}`}>מכינים לכם שאלה...</h2>
      <p className={`t-caption ${styles.subtitle}`}>זה ייקח רק כמה שניות</p>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} />
      </div>
      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
