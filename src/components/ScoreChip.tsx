import Chip from "./Chip";
import { StarFilledIcon } from "./icons";

// "ניקוד: N" with a filled star (DESIGN.md 2.3); the number is isolated so it keeps its direction
export default function ScoreChip({ score }: { score: number }) {
  return (
    <Chip variant="sunny" icon={<StarFilledIcon size={16} />}>
      <span aria-live="polite">
        ניקוד: <bdi>{score}</bdi>
      </span>
    </Chip>
  );
}
