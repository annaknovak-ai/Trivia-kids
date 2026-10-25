import type { Metadata } from "next";
import BottomTabBar from "@/components/BottomTabBar";
import Card from "@/components/Card";
import Chip from "@/components/Chip";
import TopBar from "@/components/TopBar";
import { InfoIcon } from "@/components/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "אודות · חידונצ'יק",
};

export default function AboutPage() {
  return (
    <>
      <TopBar title="אודות" />
      <main className={styles.main}>
        <header className={styles.hero}>
          <h1 className={`t-display ${styles.appName}`}>חידונצ&apos;יק</h1>
          <p className={`t-body ${styles.subtitle}`}>שאלות טריוויה מותאמות במיוחד בשבילכם</p>
        </header>

        <hr className={styles.divider} />

        <Card>
          <p className={`t-body ${styles.centered}`}>
            אפליקציית טריוויה חכמה לילדים בגילאי <bdi dir="ltr">9–12</bdi>, עם שאלות מעניינות
            בנושאים מגוונים, המותאמות בדיוק לגיל ולתחומי העניין שלכם.
          </p>
        </Card>

        <Card>
          <h2 className={`t-h3 ${styles.howTitle}`}>איך משחקים?</h2>
          <ul className={styles.howList}>
            <li className="t-body">כותבים נושא שמעניין אתכם, או משאירים ריק לשאלה כללית.</li>
            <li className="t-body">בוחרים אחת מארבע התשובות.</li>
            <li className="t-body">על כל תשובה נכונה מקבלים נקודה!</li>
          </ul>
        </Card>

        <div className={styles.notes}>
          <p className="t-caption">השאלות נוצרות על ידי בינה מלאכותית, ולפעמים היא עלולה לטעות.</p>
          <p className="t-caption">אנחנו לא שומרים שום מידע עליכם.</p>
        </div>

        <div className={styles.version}>
          <Chip icon={<InfoIcon size={16} />}>
            גרסה <bdi dir="ltr">1.0</bdi>
          </Chip>
        </div>
      </main>
      <BottomTabBar />
    </>
  );
}
