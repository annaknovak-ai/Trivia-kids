// Inline SVG icon set — 24px grid, 1.9 stroke, rounded caps & joins (see DESIGN.md 2.3)
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Outline({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
    </Outline>
  );
}

export function HomeFilledIcon(props: IconProps) {
  return (
    <Outline {...props} fill="currentColor">
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
    </Outline>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="0.6" fill="currentColor" />
      <circle cx="4.5" cy="12" r="0.6" fill="currentColor" />
      <circle cx="4.5" cy="18" r="0.6" fill="currentColor" />
    </Outline>
  );
}

export function ListFilledIcon(props: IconProps) {
  return (
    <Outline {...props} strokeWidth={2.4}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" />
    </Outline>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.75" r="0.4" fill="currentColor" />
    </Outline>
  );
}

export function InfoFilledIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 11v5.5" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.3" fill="#fff" />
    </svg>
  );
}

export function StarFilledIcon(props: IconProps) {
  return (
    <Outline {...props} fill="currentColor" strokeWidth={1.4}>
      <path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
    </Outline>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </Outline>
  );
}

export function RetryIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M20 12a8 8 0 1 1-2.35-5.66" />
      <path d="M20 4v4.5h-4.5" />
    </Outline>
  );
}

export function BrainIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M12 5.5a3 3 0 0 0-5.6-1.2A3 3 0 0 0 4 8.5a3.2 3.2 0 0 0-.3 5.6A3.2 3.2 0 0 0 7 19.5a3 3 0 0 0 5-1.2z" />
      <path d="M12 5.5a3 3 0 0 1 5.6-1.2A3 3 0 0 1 20 8.5a3.2 3.2 0 0 1 .3 5.6 3.2 3.2 0 0 1-3.3 5.4 3 3 0 0 1-5-1.2z" />
      <path d="M12 5.5v12.8M8 9.5h1.5M14.5 9.5H16M8 14h2M14 14h2" />
    </Outline>
  );
}
