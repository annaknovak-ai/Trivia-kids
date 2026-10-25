import type { Metadata } from "next";
import QuestionsScreen from "./QuestionsScreen";

export const metadata: Metadata = {
  title: "שאלות · חידונצ'יק",
};

export default function QuestionsPage() {
  return <QuestionsScreen />;
}
