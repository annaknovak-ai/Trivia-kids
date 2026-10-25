import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import QuestionsScreen from "./QuestionsScreen";

export const metadata: Metadata = {
  title: "שאלות · חידונצ'יק",
};

export default function QuestionsPage() {
  return (
    <>
      <TopBar title="חידונצ'יק" />
      <QuestionsScreen />
    </>
  );
}
