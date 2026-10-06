import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  atlasFiles,
  root,
  normalize,
  splitDiagrams,
  validateAtlas,
} from "./generate-docs.mjs";

const source = process.argv[2];
if (!source)
  throw new Error(
    "使い方: node scripts/import-atlas.mjs /path/to/metis/docs/architecture/logic-atlas",
  );
const contents = new Map();
for (const file of atlasFiles)
  contents.set(
    file,
    normalize(await readFile(path.resolve(source, file), "utf8")),
  );
const entries = JSON.parse(
  contents
    .get("index.html")
    .match(
      /<script id="atlas-data" type="application\/json">([\s\S]*?)<\/script>/,
    )?.[1] || "null",
);
if (!Array.isArray(entries)) throw new Error("ビューアの図データがありません");
const diagrams = JSON.parse(contents.get("diagrams.json"));
const inventory = JSON.parse(contents.get("inventory.json"));
validateAtlas(
  diagrams,
  JSON.parse(contents.get("glossary.json")),
  inventory,
  JSON.parse(contents.get("tech-stack.json")),
  entries,
);
if (
  splitDiagrams(contents.get("README.md")).diagrams.length !== diagrams.length
)
  throw new Error("Markdownの図数が一致しません");
await mkdir(path.join(root, "content/logic-atlas"), { recursive: true });
for (const [file, text] of contents)
  await writeFile(path.join(root, "content/logic-atlas", file), text);
console.log(
  `取り込み完了: ${atlasFiles.length}ファイル / commit ${inventory.commit}`,
);
