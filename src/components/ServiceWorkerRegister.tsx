"use client";

// Registers the minimal service worker (public/sw.js) in production builds only,
// so the shell cache never interferes with `npm run dev`
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // A worker left over from a local production run would serve stale cached files in dev
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.unregister()))
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // The app works without a service worker — ignore registration failures
    });
  }, []);

  return null;
}
