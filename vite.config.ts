// Build config. The shared preset already wires TanStack Start, React, Tailwind,
// tsconfig paths, nitro (cloudflare target), VITE_* env injection and the "@" alias.
// Do not add those plugins again or the build will break with duplicates.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
