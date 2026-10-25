"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import BottomTabBar from "@/components/BottomTabBar";
import Button from "@/components/Button";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import TopicIllustrations from "@/components/TopicIllustrations";
import { InfoIcon } from "@/components/icons";
import styles from "./page.module.css";

const MAX_TOPIC_LENGTH = 40;

export default function HomePage() {
  const router = useRouter();
  // Topic is kept locally for now; sending it to the API comes in Milestone 2
  const [topic, setTopic] = useState("");

  function start(e: FormEvent) {
    e.preventDefault();
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
            <Button type="submit">התחילו</Button>
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
