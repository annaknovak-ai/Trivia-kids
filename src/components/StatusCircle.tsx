import type { ReactNode } from "react";
import styles from "./StatusCircle.module.css";

// Colored status circle with a white mark (DESIGN.md 2.3): ✓ Mint, ✕ Coral, ! Tangerine
export default function StatusCircle({
  variant,
  children,
}: {
  variant: "tangerine" | "mint" | "coral";
  children: ReactNode;
}) {
  return (
    <div className={`${styles.circle} ${styles[variant]}`} aria-hidden="true">
      {children}
    </div>
  );
}
