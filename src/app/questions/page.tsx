import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "שאלות · חידונצ'יק",
};

// Placeholder route: question content arrives in Milestone 2
export default function QuestionsPage() {
  return (
    <>
      <TopBar title="חידונצ'יק" />
      <main className={styles.main} />
    </>
  );
}
