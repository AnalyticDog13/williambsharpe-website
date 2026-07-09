import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" makes the built site work from any subpath (e.g. GitHub Pages
// project sites) as well as from a root domain. Leave as-is for most deploys.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
