"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  HomeFilledIcon,
  HomeIcon,
  InfoFilledIcon,
  InfoIcon,
  ListFilledIcon,
  ListIcon,
} from "./icons";
import styles from "./BottomTabBar.module.css";

type Tab = { href: string; label: string; icon: ReactNode; activeIcon: ReactNode };

// DOM order is right-to-left (RTL), so visually left-to-right it reads: אודות | בית | שאלות
const tabs: Tab[] = [
  { href: "/questions", label: "שאלות", icon: <ListIcon />, activeIcon: <ListFilledIcon /> },
  { href: "/", label: "בית", icon: <HomeIcon />, activeIcon: <HomeFilledIcon /> },
  { href: "/about", label: "אודות", icon: <InfoIcon />, activeIcon: <InfoFilledIcon /> },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.bar} aria-label="ניווט ראשי">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.pill}>{active ? tab.activeIcon : tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
