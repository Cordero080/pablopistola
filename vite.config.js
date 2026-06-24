import { defineConfig } from "vite";
import { resolve } from "path";
import { globSync } from "glob";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import react from "@vitejs/plugin-react";

// Find all HTML files: root (index.html + misc), src/pages/**, and projects/**
const rootHtmlFiles = globSync("*.html");
const pageHtmlFiles = globSync("src/pages/**/*.html");
const projectHtmlFiles = globSync("projects/**/*.html");
const allHtmlFiles = [...rootHtmlFiles, ...pageHtmlFiles, ...projectHtmlFiles];

// Plugin to copy src/js, src/shared, and src/pages JS to dist/, preserving directory structure.
// Also substitutes __VITE_*__ placeholders with actual env vars at build time.
function copyJsPlugin() {
  return {
    name: "copy-js",
    closeBundle() {
      const mcpUrl = process.env.VITE_MCP_URL || "http://localhost:8000";

      const copyDir = (srcDir, destDir) => {
        const files = globSync("**/*.js", { cwd: srcDir });
        files.forEach((file) => {
          const src = resolve(srcDir, file);
          const dest = resolve(destDir, file);
          mkdirSync(resolve(dest, ".."), { recursive: true });
          let contents = readFileSync(src, "utf8");
          contents = contents.replace(/__VITE_MCP_URL__/g, mcpUrl);
          writeFileSync(dest, contents, "utf8");
        });
        return files.length;
      };

      const jsCount = copyDir(
        resolve(__dirname, "src/js"),
        resolve(__dirname, "dist/src/js"),
      );
      const sharedCount = copyDir(
        resolve(__dirname, "src/shared"),
        resolve(__dirname, "dist/src/shared"),
      );
      const pagesCount = copyDir(
        resolve(__dirname, "src/pages"),
        resolve(__dirname, "dist/src/pages"),
      );

      console.log(
        `Copied ${jsCount} from src/js, ${sharedCount} from src/shared, ${pagesCount} from src/pages (MCP_URL: ${mcpUrl})`,
      );
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [
    react(),
    copyJsPlugin(),
    {
      name: "landing-dev-rewrite",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === "/" || req.url === "/index.html") {
            req.url = "/src/pages/landing/index.html";
          }
          next();
        });
      },
    },
  ],

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
