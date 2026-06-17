import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function collectJsFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
      continue;
    }
    if (fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = collectJsFiles(join(process.cwd(), "src"));

if (files.length === 0) {
  console.error("No .js files found in backend/src for syntax validation.");
  process.exit(1);
}

for (const filePath of files) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Backend syntax validation passed for ${files.length} file(s).`);
