import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type ChipProps = {
  variant?: "grape" | "sunny";
  icon?: ReactNode;
  children: ReactNode;
};

export default function Chip({ variant = "grape", icon, children }: ChipProps) {
  return (
    <span className={`${styles.chip} ${styles[variant]}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
