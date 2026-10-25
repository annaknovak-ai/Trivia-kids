// Shared renderer for the PWA app icons: white brain on a Grape square (approved 25.10.2026)
import { ImageResponse } from "next/og";
import { BrainIcon } from "@/components/icons";

const GRAPE = "#6c4cf5";

type AppIconOptions = {
  size: number;
  // Brain glyph size as a fraction of the icon (maskable icons need a smaller glyph to stay in the safe zone)
  glyphRatio: number;
  // Corner radius as a fraction of the icon; 0 = full-bleed square (maskable / iOS round the corners themselves)
  radiusRatio: number;
};

export function renderAppIcon({ size, glyphRatio, radiusRatio }: AppIconOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: GRAPE,
          borderRadius: size * radiusRatio,
        }}
      >
        <BrainIcon size={Math.round(size * glyphRatio)} stroke="#ffffff" />
      </div>
    ),
    { width: size, height: size },
  );
}
