// Flat geometric topic illustrations on soft tinted tiles (DESIGN.md 2.4)
import styles from "./TopicIllustrations.module.css";

function Planet() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30">
      <circle cx="16" cy="16" r="8" fill="#6C4CF5" />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="4.5"
        fill="none"
        stroke="#FFC83D"
        strokeWidth="2.6"
        transform="rotate(-20 16 16)"
      />
      <path d="M8.6 13.5a8 8 0 0 1 14.8 0" fill="#6C4CF5" />
    </svg>
  );
}

function Leaf() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30">
      <path d="M16 3c7 6 7 16 0 23-7-7-7-17 0-23z" fill="#22C55E" />
      <rect x="15" y="14" width="2" height="15" rx="1" fill="#15803D" />
    </svg>
  );
}

function Flask() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30">
      <path d="M12 4h8v8l7 13a2.5 2.5 0 0 1-2.2 3.7H7.2A2.5 2.5 0 0 1 5 25l7-13z" fill="#3DB5FF" />
      <path d="M8.5 19h15l3.5 6a2.5 2.5 0 0 1-2.2 3.7H7.2A2.5 2.5 0 0 1 5 25z" fill="#FF5C61" />
      <rect x="10.5" y="2.5" width="11" height="3" rx="1.5" fill="#3DB5FF" />
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30">
      <path
        d="m16 3.5 3.8 7.7 8.4 1.2-6.1 6 1.5 8.4L16 22.8l-7.6 4 1.5-8.4-6.1-6 8.4-1.2z"
        fill="#FFC83D"
        stroke="#FFC83D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// In RTL the first item appears on the right: planet, leaf, flask, star
const tiles = [
  { key: "planet", bg: "var(--grape-soft)", art: <Planet /> },
  { key: "leaf", bg: "var(--mint-soft)", art: <Leaf /> },
  { key: "flask", bg: "var(--sky-soft)", art: <Flask /> },
  { key: "star", bg: "var(--sunny-soft)", art: <Star /> },
];

export default function TopicIllustrations() {
  return (
    <div className={styles.row} aria-hidden="true">
      {tiles.map((t) => (
        <span key={t.key} className={styles.tile} style={{ background: t.bg }}>
          {t.art}
        </span>
      ))}
    </div>
  );
}
