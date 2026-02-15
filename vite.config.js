import { defineConfig } from "vite";
import { resolve } from "path";
import { globSync } from "glob";

// Find all HTML files at root and in projects/
const rootHtmlFiles = globSync("*.html");
const projectHtmlFiles = globSync("projects/*.html");
const allHtmlFiles = [...rootHtmlFiles, ...projectHtmlFiles];

export default defineConfig({
  root: ".",
  publicDir: "public",

  build: {
    outDir: "dist",
    rollupOptions: {
      input: Object.fromEntries(
        allHtmlFiles.map((file) => [
          file.replace(".html", "").replace("projects/", "projects/"),
          resolve(__dirname, file),
        ]),
      ),
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@styles": resolve(__dirname, "src/styles"),
      "@js": resolve(__dirname, "src/js"),
    },
  },
});
