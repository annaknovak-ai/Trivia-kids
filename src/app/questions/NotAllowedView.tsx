import Button from "@/components/Button";
import Card from "@/components/Card";
import StatusCircle from "@/components/StatusCircle";
import { HomeIcon } from "@/components/icons";
// Same layout as the error screen (DESIGN.md 1.6א)
import styles from "./ErrorView.module.css";

// Friendly "unsuitable topic" screen (DESIGN.md 1.6א)
export default function NotAllowedView({ onChooseOther }: { onChooseOther: () => void }) {
  return (
    <div className={styles.wrap} role="alert">
      <Card className={styles.card}>
        <StatusCircle variant="tangerine">!</StatusCircle>
        <h1 className={`t-h1 ${styles.title}`}>בואו נבחר נושא אחר</h1>
        <p className={`t-body ${styles.text}`}>הנושא הזה לא מתאים לחידון. נסו לבחור נושא אחר.</p>
      </Card>

      <div className={styles.actions}>
        <Button onClick={onChooseOther} icon={<HomeIcon size={20} />}>
          בחרו נושא אחר
        </Button>
      </div>
    </div>
  );
}
