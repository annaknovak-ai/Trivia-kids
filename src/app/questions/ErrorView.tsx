import Button from "@/components/Button";
import Card from "@/components/Card";
import StatusCircle from "@/components/StatusCircle";
import { HomeIcon, RetryIcon } from "@/components/icons";
import styles from "./ErrorView.module.css";

// Friendly error + retry (DESIGN.md 1.6)
export default function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.wrap} role="alert">
      <Card className={styles.card}>
        <StatusCircle variant="tangerine">!</StatusCircle>
        <h1 className={`t-h1 ${styles.title}`}>אופס!</h1>
        <p className={`t-body ${styles.text}`}>אירעה תקלה בהכנת השאלה. נסו שוב.</p>
      </Card>

      <div className={styles.actions}>
        <Button onClick={onRetry} icon={<RetryIcon size={20} />}>
          נסו שוב
        </Button>
        <Button href="/" variant="secondary" icon={<HomeIcon size={20} />}>
          חזרה לבית
        </Button>
      </div>
    </div>
  );
}
