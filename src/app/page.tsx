"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import BottomTabBar from "@/components/BottomTabBar";
import { useGame } from "@/components/GameProvider";
import Button from "@/components/Button";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import TopicIllustrations from "@/components/TopicIllustrations";
import { InfoIcon } from "@/components/icons";
import { MAX_TOPIC_LENGTH } from "@/lib/trivia/validation";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const { startGame } = useGame();
  const [topic, setTopic] = useState("");
  // Disables "התחילו" after the first click to prevent double requests
  const [starting, setStarting] = useState(false);

  // Next.js keeps this page alive (hidden) after navigating away; re-enable the button
  // when the page is hidden so it works again when the user comes back
  useEffect(() => () => setStarting(false), []);

  function start(e: FormEvent) {
    e.preventDefault();
    if (starting) return;
    setStarting(true);
    // Topic travels through in-memory game state, never through the URL
    startGame(topic);
    router.push("/questions");
  }

  return (
    <>
      <main className={styles.main}>
        <header className={styles.hero}>
          <h1 className={`t-display ${styles.appName}`}>חידונצ&apos;יק</h1>
          <p className={`t-body ${styles.subtitle}`}>שאלות טריוויה מותאמות במיוחד בשבילכם</p>
        </header>

        <TopicIllustrations />

        <form className={styles.form} onSubmit={start}>
          <Card>
            <label htmlFor="topic" className={`t-h3 ${styles.cardTitle}`}>
              איזה נושא מעניין אתכם?
            </label>
            <TextInput
              id="topic"
              value={topic}
              onChange={setTopic}
              placeholder="לדוגמה: חיות, חלל, מדע ועוד..."
              maxLength={MAX_TOPIC_LENGTH}
            />
          </Card>

          <div className={styles.actions}>
            <Button type="submit" disabled={starting}>
              התחילו
            </Button>
            <Button href="/about" variant="secondary" icon={<InfoIcon size={20} />}>
              אודות
            </Button>
          </div>
        </form>
      </main>
      <BottomTabBar />
    </>
  );
}
