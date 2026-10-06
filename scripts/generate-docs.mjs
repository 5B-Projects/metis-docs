import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const base = "/metis-docs/";
export const atlasFiles = [
  "README.md",
  "diagrams.json",
  "glossary.json",
  "glossary.md",
  "index.html",
  "inventory.json",
  "inventory.md",
  "tech-stack.html",
  "tech-stack.json",
  "tech-stack.md",
  "verification.md",
];
export const normalize = (text) => text.replace(/\r\n?|\n/g, "\n");
export const docUrl = (name) => `${base}docs/${name}/`;

export function rewriteLinks(text, commit) {
  return normalize(text).replace(
    /(\]\()([^\s)]+)(\))/g,
    (original, left, target, right) => {
      let next = target;
      const diagram = target.match(
        /^(?:README\.md|index\.html)?#(?:図-|diagram-)(\d{2})$/,
      );
      if (diagram) next = docUrl(`logic/${diagram[1]}`);
      else if (target.startsWith("../")) {
        const [file, anchor] = target.split("#");
        const normalized = path.posix.normalize(
          `docs/architecture/logic-atlas/${file}`,
        );
        if (normalized.startsWith("../"))
          throw new Error(`参照がリポジトリ外です: ${target}`);
        const kind = file.endsWith("/") ? "tree" : "blob";
        next = `https://github.com/5B-Projects/metis/${kind}/${commit}/${normalized.split("/").map(encodeURIComponent).join("/")}${anchor ? `#${anchor}` : ""}`;
      } else {
        const [file, anchor] = target.split("#");
        const routes = {
          "README.md": "overview",
          "glossary.md": "glossary",
          "tech-stack.md": "tech-stack",
          "tech-stack.html": "tech-stack",
          "inventory.md": "inventory",
          "verification.md": "verification",
        };
        if (routes[file])
          next = `${docUrl(routes[file])}${anchor ? `#${anchor}` : ""}`;
      else if (atlasFiles.includes(file))
        next = `pathname://${base}atlas/${file === "index.html" ? "" : file}${anchor ? `#${anchor}` : ""}`;
      }
      return `${left}${next}${right}`;
    },
  );
}

export function splitDiagrams(text) {
  const normalized = normalize(text);
  const sections = normalized.split(
    /(?:<a id="図-\d{2}"><\/a>\n)?## 図 (\d{2}): ([^\n]+)\n/g,
  );
  const result = [];
  for (let i = 1; i < sections.length; i += 3)
    result.push({
      id: sections[i],
      title: sections[i + 1],
      body: sections[i + 2].trim(),
    });
  return { overview: sections[0].trim(), diagrams: result };
}

export function validateAtlas(diagrams, glossary, inventory, tech, entries) {
  if (
    !/^[a-f0-9]{40}$/.test(inventory.commit) ||
    tech.commit !== inventory.commit
  )
    throw new Error("対象commitが一致しません");
  const ids = new Set(diagrams.map((d) => d.id));
  if (ids.size !== diagrams.length) throw new Error("図IDが重複しています");
  const names = new Set(glossary.map((g) => g.name));
  const rendered = new Map(
    entries.filter((e) => e.type === "diagram").map((e) => [e.data.id, e.data]),
  );
  for (const d of diagrams) {
    if (!rendered.get(d.id)?.svg?.includes("<svg"))
      throw new Error(`SVGがありません: ${d.id}`);
    if (
      JSON.stringify({ ...rendered.get(d.id), svg: undefined }) !==
      JSON.stringify(d)
    )
      throw new Error(`図データが一致しません: ${d.id}`);
    for (const term of d.terms)
      if (!names.has(term)) throw new Error(`用語がありません: ${term}`);
  }
  return rendered;
}

const fm = (id, title) =>
  `---\nid: ${JSON.stringify(id)}\ntitle: ${JSON.stringify(title)}\n---\n\n`;
const write = async (file, content) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
};
const j = (value) => JSON.stringify(value, null, 2) + "\n";

export async function generate(target = root) {
  const source = path.join(target, "content/logic-atlas");
  const read = async (name) =>
    normalize(await readFile(path.join(source, name), "utf8"));
  const [
    diagramText,
    glossaryText,
    inventoryText,
    techText,
    html,
    readme,
    technologyHtml,
  ] = await Promise.all(
    [
      "diagrams.json",
      "glossary.json",
      "inventory.json",
      "tech-stack.json",
      "index.html",
      "README.md",
      "tech-stack.html",
    ].map(read),
  );
  const diagrams = JSON.parse(diagramText),
    glossary = JSON.parse(glossaryText),
    inventory = JSON.parse(inventoryText),
    tech = JSON.parse(techText);
  const entries = JSON.parse(
    html.match(
      /<script id="atlas-data" type="application\/json">([\s\S]*?)<\/script>/,
    )?.[1] ?? "null",
  );
  if (!Array.isArray(entries))
    throw new Error("ビューアの図データを読み取れません");
  const rendered = validateAtlas(diagrams, glossary, inventory, tech, entries);
  const sections = splitDiagrams(readme);
  if (sections.diagrams.length !== diagrams.length)
    throw new Error("Markdownの図数が一致しません");
  for (const generated of [
    "docs",
    "static/atlas",
    "static/diagrams",
    "static/data",
    "src/data",
  ])
    await rm(path.join(target, generated), { recursive: true, force: true });
  for (const file of atlasFiles) {
    let content = await read(file);
    // 閲覧版のMarkdownは同じディレクトリで使う。元repo外への参照だけ固定リンク化する。
    if (file.endsWith(".md"))
      content = content.replace(
        /(\]\()(\.\.\/[^\s)]+)(\))/g,
        (all, left, link) => rewriteLinks(`${left}${link})`, inventory.commit),
      );
    if (file === "index.html") {
      const routes = {"README.md": "overview", "glossary.md": "glossary", "tech-stack.html": "tech-stack", "verification.md": "verification"};
      content = content.replace(/href="(README\.md|glossary\.md|tech-stack\.html|verification\.md)"/g, (_, name) => `href="${docUrl(routes[name])}"`);
      const original = "show(initial>=0?initial:0);";
      if (!content.includes(original))
        throw new Error("ビューアの初期化契約が変わっています");
      content = content.replace(
        original,
        `const requested=new URLSearchParams(location.search).get('entry');\n const entry=requested===null?NaN:Number(requested);\n if(Number.isInteger(entry)&&entry>=0&&entry<data.length){$('category').value='すべて';show(entry)}else{${original}}`,
      );
    }
    await write(path.join(target, "static/atlas", file), content);
  }
  await write(path.join(target, "static/.nojekyll"), "");
  await write(
    path.join(target, "docs/overview.md"),
    fm("overview", "ロジック図解の読み方") +
      rewriteLinks(sections.overview.replace(/^# .+\n/, ""), inventory.commit) +
      "\n",
  );
  for (const section of sections.diagrams) {
    const d = diagrams.find((d) => d.id === section.id);
    if (!d || d.title !== section.title)
      throw new Error(`図タイトルが一致しません: ${section.id}`);
    await write(
      path.join(target, `static/diagrams/diagram-${d.id}.svg`),
      rendered.get(d.id).svg,
    );
    const body = section.body.replace(
      /```mermaid\n([\s\S]*?)```/,
      (_, mermaid) =>
        `![図 ${d.id}: ${d.title}](pathname://${base}diagrams/diagram-${d.id}.svg)\n\n[図解ビューアで開く](pathname://${base}atlas/#diagram-${d.id})\n\n<details>\n<summary>編集用のMermaid定義</summary>\n\n\`\`\`text\n${mermaid}\`\`\`\n\n</details>`,
    );
    await write(
      path.join(target, `docs/logic/${d.id}.md`),
      fm(d.id, `図 ${d.id} · ${d.title}`) +
        rewriteLinks(body, inventory.commit) +
        "\n",
    );
  }
  const technologySvg = technologyHtml.match(/<svg\b[\s\S]*?<\/svg>/)?.[0];
  if (!technologySvg) throw new Error("技術構成図がありません");
  await write(
    path.join(target, "static/diagrams/technology.svg"),
    technologySvg,
  );
  for (const [name, title] of [
    ["tech-stack", "技術スタック"],
    ["glossary", "用語集"],
    ["inventory", "API・SQL索引"],
    ["verification", "develop照合記録"],
  ]) {
    let text = (await read(`${name}.md`)).replace(/^# .+\n/, "");
    if (name === "glossary")
      text =
        `対象commit: \`${inventory.commit}\` / ${inventory.date}。一般的な意味とMetisでの役割を分けて説明します。\n\n` +
        glossary
          .map(
            (g, i) =>
              `<a id="term-${i + 1}"></a>\n\n## ${g.name}\n\n**一般的な意味:** ${g.meaning}\n\n**Metisでの役割・注意点:** ${g.role}\n\n**図中の表記:** ${g.aliases.join(" / ")}`,
          )
          .join("\n\n");
    if (name === "tech-stack")
      text = text.replace(
        /```mermaid\n([\s\S]*?)```/,
        (_, definition) =>
          `![Metisの技術構成](pathname://${base}diagrams/technology.svg)\n\n<details>\n<summary>編集用のMermaid定義</summary>\n\n\`\`\`text\n${definition}\`\`\`\n\n</details>`,
      );
    await write(
      path.join(target, `docs/${name}.md`),
      fm(name, title) + rewriteLinks(text, inventory.commit) + "\n",
    );
  }
  const groups = [...new Set(diagrams.map((d) => d.group))];
  await write(
    path.join(target, "sidebars.generated.json"),
    j({
      docs: [
        "overview",
        ...groups.map((group) => ({
          type: "category",
          label: group,
          collapsed: group !== "全体",
          items: diagrams
            .filter((d) => d.group === group)
            .map((d) => `logic/${d.id}`),
        })),
        "tech-stack",
        "glossary",
        "inventory",
        "verification",
      ],
    }),
  );
  const stats = {
    commit: inventory.commit,
    date: inventory.date,
    diagrams: diagrams.length,
    terms: glossary.length,
    technologies: tech.technologies.length,
    endpoints: inventory.endpoints.length,
    functions: inventory.functions.length + inventory.desktop_functions.length,
    entries: entries.length,
  };
  await write(
    path.join(target, "src/data/site.json"),
    j({
      ...stats,
      groups,
      diagramList: diagrams.map(({ id, title, group, text }) => ({
        id,
        title,
        group,
        text,
      })),
    }),
  );
  const search = diagrams.map((d) => ({
    type: "ロジック図",
    title: `図 ${d.id} · ${d.title}`,
    description: d.text,
    text: JSON.stringify(d),
    url: docUrl(`logic/${d.id}`),
  }));
  glossary.forEach((g, i) =>
    search.push({
      type: "用語",
      title: g.name,
      description: g.meaning,
      text: JSON.stringify(g),
      url: `${docUrl("glossary")}#term-${i + 1}`,
    }),
  );
  tech.technologies.forEach((t) =>
    search.push({
      type: "技術",
      title: t.name,
      description: t.role,
      text: JSON.stringify(t),
      url: `${docUrl("tech-stack")}#${t.id}`,
    }),
  );
  entries.forEach((e, i) => {
    if (!["diagram", "term"].includes(e.type))
      search.push({
        type: e.group,
        title: e.title,
        description: e.data.file || e.data.path || "静的抽出の参照情報",
        text: JSON.stringify({ ...e.data, svg: undefined }),
        url: `${base}atlas/?entry=${i}`,
      });
  });
  await write(path.join(target, "static/data/search.json"), j(search));
  await write(path.join(target, "static/data/snapshot.json"), j(stats));
  console.log(
    `生成完了: ${stats.diagrams}図 / ${stats.terms}用語 / ${stats.technologies}技術 / ${search.length}検索項目`,
  );
  return stats;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await generate();
