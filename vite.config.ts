import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/dice",
  plugins: [
    // Don't add Vike's Vite plugin when running Vitest.
    !process.env.VITEST ? vike() : null,
    react({}),
  ],
  build: {
    target: "es2022",
  },
});
