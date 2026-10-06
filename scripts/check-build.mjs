import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { root, base } from "./generate-docs.mjs";

const build = path.join(root, "build");
async function files(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const filename = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...(await files(filename)));
    else if (item.name.endsWith(".html")) result.push(filename);
  }
  return result;
}
const failures = [],
  htmlFiles = await files(build),
  cache = new Map();
const get = async (file) => {
  if (!cache.has(file)) cache.set(file, await readFile(file, "utf8"));
  return cache.get(file);
};
let links = 0;
for (const file of htmlFiles) {
  const html = await get(file);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replace(/&amp;/g, "&");
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) continue;
    const relative = path.relative(build, file).split(path.sep).join("/");
    const current = new URL(base + relative, "https://5b-projects.github.io");
    const url = new URL(raw, current);
    if (!url.pathname.startsWith(base)) {
      failures.push(`${relative}: baseUrl外 ${raw}`);
      continue;
    }
    const target = decodeURIComponent(url.pathname.slice(base.length));
    let filename = path.join(build, target);
    if (!(filename === build || filename.startsWith(build + path.sep))) {
      failures.push(`${relative}: 公開ディレクトリ外 ${raw}`);
      continue;
    }
    try {
      if ((await stat(filename)).isDirectory())
        filename = path.join(filename, "index.html");
      await stat(filename);
      if (url.hash && filename.endsWith(".html")) {
        const id = decodeURIComponent(url.hash.slice(1));
        const destination = await get(filename);
        if (
          id &&
          !destination.includes(`id="${id}"`) &&
          !target.startsWith("atlas/")
        )
          failures.push(`${relative}: アンカーなし ${raw}`);
      }
      links++;
    } catch {
      failures.push(`${relative}: 参照先なし ${raw}`);
    }
  }
}
for (const name of [
  "index.html",
  "search/index.html",
  "docs/tech-stack/index.html",
  "docs/glossary/index.html",
  "docs/logic/56/index.html",
  "atlas/index.html",
  "data/search.json",
  ".nojekyll",
]) {
  try {
    await stat(path.join(build, name));
  } catch {
    failures.push(`公開入口なし: ${name}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `公開物検証: ${htmlFiles.length} HTML / ${links} 内部リンク・画像 / 全て正常`,
  );
