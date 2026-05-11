import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://hantu-raya.github.io",
  base: process.env.GITHUB_PAGES ? "/color-blind-web-builder/" : undefined,
  integrations: [react()]
});
