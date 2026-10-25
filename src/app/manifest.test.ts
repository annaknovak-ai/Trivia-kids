import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("web app manifest", () => {
  const m = manifest();

  it("has the app name, start url and standalone display", () => {
    expect(m.name).toBe("חידונצ'יק");
    expect(m.short_name).toBe("חידונצ'יק");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.lang).toBe("he");
    expect(m.dir).toBe("rtl");
  });

  it("includes 192 and 512 PNG icons plus a maskable icon", () => {
    const sizes = m.icons?.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(m.icons?.some((icon) => icon.purpose === "maskable")).toBe(true);
    expect(m.icons?.every((icon) => icon.type === "image/png")).toBe(true);
  });
});
