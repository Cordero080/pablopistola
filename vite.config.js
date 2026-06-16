import { defineConfig } from "vite";
import { resolve } from "path";
import { globSync } from "glob";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import react from "@vitejs/plugin-react";

// Find all HTML files at root and in projects/ (including subdirs)
const rootHtmlFiles = globSync("*.html");
const projectHtmlFiles = globSync("projects/**/*.html");
const allHtmlFiles = [...rootHtmlFiles, ...projectHtmlFiles];

// Plugin to copy src/js (including subdirectories) to dist/src/js
// Also substitutes __VITE_*__ placeholders with actual env vars at build time.
function copyJsPlugin() {
  return {
    name: "copy-js",
    closeBundle() {
      const srcDir = resolve(__dirname, "src/js");
      const destDir = resolve(__dirname, "dist/src/js");
      const mcpUrl = process.env.VITE_MCP_URL || "http://localhost:8000";
      // Recursively copy all .js files preserving directory structure
      const jsFiles = globSync("**/*.js", { cwd: srcDir });
      jsFiles.forEach((file) => {
        const src = resolve(srcDir, file);
        const dest = resolve(destDir, file);
        mkdirSync(resolve(dest, ".."), { recursive: true });
        let contents = readFileSync(src, "utf8");
        contents = contents.replace(/__VITE_MCP_URL__/g, mcpUrl);
        writeFileSync(dest, contents, "utf8");
      });
      console.log(
        `Copied ${jsFiles.length} files from src/js to dist/src/js (MCP_URL: ${mcpUrl})`,
      );
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [react(), copyJsPlugin()],

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
    proxy: {
      "/models/xenotchi": {
        target: "https://transcendence-3-d-v2.vercel.app",
        changeOrigin: true,
        rewrite: (path) => path.replace("/models/xenotchi", "/models"),
      },
    },
  },

  resolve: {
    alias: {
      "@ml": resolve(__dirname, "src/manifold-lab"),
      "@": resolve(__dirname, "src"),
      "@styles": resolve(__dirname, "src/styles"),
      "@js": resolve(__dirname, "src/js"),
    },
  },
});
