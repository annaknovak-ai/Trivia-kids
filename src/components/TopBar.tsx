"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./icons";
import styles from "./TopBar.module.css";

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();

  function goBack() {
    // Go back within the app if there is history, otherwise go Home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <header className={styles.bar}>
      <span className={`t-h3 ${styles.title}`}>{title}</span>
      <button type="button" className={styles.back} onClick={goBack} aria-label="חזרה">
        <ChevronLeftIcon size={22} />
      </button>
    </header>
  );
}
