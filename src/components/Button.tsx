import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
} & (
  | { href: string; onClick?: never; type?: never; disabled?: never }
  | { href?: undefined; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }
);

export default function Button({ variant = "primary", icon, children, ...rest }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;
  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={rest.type ?? "button"}
      onClick={rest.onClick}
      disabled={rest.disabled}
      className={className}
    >
      {content}
    </button>
  );
}
