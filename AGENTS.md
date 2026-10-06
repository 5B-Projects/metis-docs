# Metis Docsの作業方針

- 回答、説明文、コメント、コミット、PRは日本語にする。
- `content/logic-atlas/`はMetis本体の照合済みドキュメントsnapshot。対象commitと確認範囲を維持する。
- 業務仕様を修正する場合はMetis本体の実装で根拠を確認し、図・用語・技術説明・照合記録を同時に更新する。
- 本体ソース、`.env`、シークレット、利用者データをコピーしない。公開対象は`atlasFiles`の許可一覧だけにする。
- Pythonで継続的なツールを作る場合はuvのvenvを使う。サイト生成はNode.jsで行う。
- 作業ブランチは`develop`から`codex/`で作り、PRのbaseを`develop`にする。公開はPRの統合後に行う。
- 最終確認は`pnpm dev:ptest`。このrepoでは生成テスト、Docusaurus本番build、公開物のリンク検査を実行する。
- テキスト解析はLF・CRLF・CRを正規化し、合成fixtureで確かめる。
- 初回検証と公開CIはLinux、ローカルの画面確認はmacOS。Windowsで実行したと推測しない。
