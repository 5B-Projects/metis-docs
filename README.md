# Metis Docs

Metisのロジック図解、用語集、技術スタックを公開するDocusaurusサイトです。

- 公開サイト: https://5b-projects.github.io/metis-docs/
- 対象: Metis `develop`の`efb532f74c383cd35c055d85d3f989ba643c3611`（2026-10-06照合）
- 内容: 56の主要図、129の用語、42の技術説明、API・関数・SQLの静的索引。

本体の稼働結果ではなく、指定commitの静的調査を説明します。本体は非公開リポジトリのため、ソースへの固定リンクの閲覧には本体へのアクセス権が必要です。

## ローカルで読む

Node.js 26.5.0、pnpm 11.25.0を使用します。

```bash
pnpm install --frozen-lockfile
pnpm start
```

本番用の確認は`pnpm dev:ptest`、buildをローカルで配信する場合は`pnpm serve`です。

## 内容を更新する

1. Metis本体で最新の`develop`を取得し、実装と図解を照合します。
2. 対象commitを含めて`docs/architecture/logic-atlas/`を更新します。
3. このrepoで`node scripts/import-atlas.mjs /path/to/metis/docs/architecture/logic-atlas`を実行します。
4. `pnpm dev:ptest`で生成、全体のbuild、公開物のリンクを検証します。
5. `develop`へPRを作り、統合します。GitHub Actionsが検証後にGitHub Pagesへ公開します。

importは11ファイルの許可一覧のみを受け取り、本体のソースや環境設定を取り込みません。自動生成した`docs/`、`static/atlas/`、図・索引はbuild時に再作成するためGitには含めません。

## サイトの構成

- `content/logic-atlas/`: 照合済みの入力文書とJSON、既存の図解ビューア。
- `scripts/generate-docs.mjs`: 図を分野別に分割し、用語・技術・索引・SVG・検索データを生成。
- `src/`: トップページ、横断検索、図の拡大操作、デザイン。
- `.github/workflows/pages.yml`: PR時の検証、`develop`統合後の公開。

公開先の`url`と`baseUrl`は`docusaurus.config.js`で指定します。build済みの公開物だけをPages artifactに含めます。外部AIや本体APIを呼ぶ処理はありません。

## 参照した文書

移行元はMetisの`AGENTS.md`、`CODEBASE_MAP.md`、`README.md`、`docs/AGENTS.md`、`docs/project/README.md`、`docs/adr/README.md`と`docs/architecture/logic-atlas/`の図解・用語・技術スタック・照合記録です。公開方法は[Docusaurus公式](https://docusaurus.io/docs/deployment)、[GitHub Pages公式](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically)を参照しました。
