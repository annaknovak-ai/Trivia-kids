// App icons for the manifest and <head>: /icon/192, /icon/512, /icon/maskable
import { renderAppIcon } from "@/lib/pwa/appIcon";

export const contentType = "image/png";

const ICONS = {
  "192": { size: 192, glyphRatio: 0.62, radiusRatio: 0.22 },
  "512": { size: 512, glyphRatio: 0.62, radiusRatio: 0.22 },
  // Android adaptive icon: full bleed, glyph kept inside the central 80% safe zone
  maskable: { size: 512, glyphRatio: 0.5, radiusRatio: 0 },
} as const;

type IconId = keyof typeof ICONS;

export function generateImageMetadata() {
  return (Object.keys(ICONS) as IconId[]).map((id) => ({
    id,
    contentType,
    size: { width: ICONS[id].size, height: ICONS[id].size },
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const key = String(await id) as IconId;
  return renderAppIcon(ICONS[key] ?? ICONS["512"]);
}
