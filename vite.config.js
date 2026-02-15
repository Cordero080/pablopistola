import { defineConfig } from "vite";
import { resolve } from "path";
import { globSync } from "glob";
import { copyFileSync, mkdirSync, readdirSync } from "fs";

// Find all HTML files at root and in projects/
const rootHtmlFiles = globSync("*.html");
const projectHtmlFiles = globSync("projects/*.html");
const allHtmlFiles = [...rootHtmlFiles, ...projectHtmlFiles];

// Plugin to copy src/js to dist/src/js
function copyJsPlugin() {
  return {
    name: "copy-js",
    closeBundle() {
      const srcDir = resolve(__dirname, "src/js");
      const destDir = resolve(__dirname, "dist/src/js");
      mkdirSync(destDir, { recursive: true });
      readdirSync(srcDir).forEach((file) => {
        if (file.endsWith(".js")) {
          copyFileSync(resolve(srcDir, file), resolve(destDir, file));
        }
      });
      console.log("Copied src/js to dist/src/js");
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [copyJsPlugin()],

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
