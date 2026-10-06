import test from "node:test";
import assert from "node:assert/strict";
import {
  readFile,
  mkdtemp,
  mkdir,
  copyFile,
  readdir,
  rm,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  normalize,
  rewriteLinks,
  splitDiagrams,
  generate,
  root,
  atlasFiles,
} from "./generate-docs.mjs";

const commit = "efb532f74c383cd35c055d85d3f989ba643c3611";
for (const ending of ["\n", "\r\n", "\r"])
  test(`図の分割とリンク変換は${JSON.stringify(ending)}で一致する`, () => {
    const text = [
      "# 図解",
      "",
      '<a id="図-01"></a>',
      "## 図 01: 全体",
      "",
      "[次へ](#図-02)",
      "",
      '<a id="図-02"></a>',
      "## 図 02: 通信",
      "",
      "[根拠](../../../supabase/migrations/)",
    ].join(ending);
    const parsed = splitDiagrams(text);
    assert.equal(parsed.diagrams.length, 2);
    assert.equal(parsed.diagrams[0].body, "[次へ](#図-02)");
    assert.equal(
      rewriteLinks(parsed.diagrams[0].body, commit),
      "[次へ](/metis-docs/docs/logic/02/)",
    );
    assert.equal(
      rewriteLinks(parsed.diagrams[1].body, commit),
      `[根拠](https://github.com/5B-Projects/metis/tree/${commit}/supabase/migrations/)`,
    );
  });

test("外部リンク・コード根拠・技術アンカーを維持する", () => {
  const text =
    "[SDK](https://example.com/sdk#v1) [用語](glossary.md#term-1) [技術](tech-stack.md#node) [図](index.html#diagram-55)";
  assert.equal(
    rewriteLinks(text, commit),
    "[SDK](https://example.com/sdk#v1) [用語](/metis-docs/docs/glossary/#term-1) [技術](/metis-docs/docs/tech-stack/#node) [図](/metis-docs/docs/logic/55/)",
  );
  assert.equal(normalize("a\r\nb\rc\n"), "a\nb\nc\n");
});

test("公開物は許可したatlasだけを含み、全図・用語・検索を保持する", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "metis-docs-generate-"));
  try {
    const content = path.join(temp, "content/logic-atlas");
    await mkdir(content, { recursive: true });
    for (const file of atlasFiles)
      await copyFile(
        path.join(root, "content/logic-atlas", file),
        path.join(content, file),
      );
    await copyFile(path.join(root, "package.json"), path.join(content, ".env"));
    const stats = await generate(temp);
    assert.equal(stats.commit, commit);
    assert.equal(stats.diagrams, 56);
    assert.equal(stats.terms, 129);
    assert.equal(stats.technologies, 42);
    assert.deepEqual(
      (await readdir(path.join(temp, "static/atlas"))).sort(),
      atlasFiles.toSorted(),
    );
    assert.equal((await readdir(path.join(temp, "docs/logic"))).length, 56);
    const search = JSON.parse(
      await readFile(path.join(temp, "static/data/search.json"), "utf8"),
    );
    assert.equal(search.length, 6520);
    assert.equal(search.filter((r) => r.type === "用語").length, 129);
    assert.ok(
      search.some(
        (r) => r.title.includes("quota") && r.url.endsWith("#term-55"),
      ) || search.some((r) => r.title === "quota" && /#term-\d+$/.test(r.url)),
    );
    const viewer = await readFile(
      path.join(temp, "static/atlas/index.html"),
      "utf8",
    );
    assert.ok(
      viewer.includes("new URLSearchParams(location.search).get('entry')"),
    );
    const overview = await readFile(
      path.join(temp, "docs/overview.md"),
      "utf8",
    );
    assert.ok(!overview.includes("](../"));
    const glossary = await readFile(
      path.join(temp, "docs/glossary.md"),
      "utf8",
    );
    assert.equal((glossary.match(/<a id="term-/g) || []).length, 129);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
