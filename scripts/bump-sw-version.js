import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = resolve(__dirname, "../public/sw.js");

const version = `pablo-pistola-${Date.now()}`;
const content = readFileSync(swPath, "utf8").replace(
  /const CACHE_NAME = "pablo-pistola-[^"]+"/,
  `const CACHE_NAME = "${version}"`,
);

writeFileSync(swPath, content);
console.log(`[sw] Cache version bumped to ${version}`);
