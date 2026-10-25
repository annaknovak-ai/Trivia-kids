// iOS home-screen icon: full-bleed square (iOS rounds the corners itself)
import { renderAppIcon } from "@/lib/pwa/appIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderAppIcon({ size: 180, glyphRatio: 0.62, radiusRatio: 0 });
}
