import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { precachePlugin } from "./scripts/precache.mjs";
export default defineConfig({ plugins: [react(), precachePlugin()], base: "./" });
