# developとロジック図解の照合記録

確認日: 2026-10-06（日本時間）。[図解閲覧版](index.html) · [技術スタック説明](tech-stack.html) · [図解文書](README.md)。

`git fetch origin develop`後の対象は [`efb532f74c383cd35c055d85d3f989ba643c3611`](https://github.com/5B-Projects/metis/commit/efb532f74c383cd35c055d85d3f989ba643c3611)（2026-10-06 09:38 JST、Linux CIを一時的にGitHub-hostedへ変更）。既存図解の基準は作業ブランチの`f8dd93b25d282e713750eaf7dcd1ea5622faf283`だった。今回の差分は時間経過による更新と、作業ブランチだけにある未統合実装の差の両方を含む。

## 確認方法と範囲

- 既存53図の根拠を対象commitのソースツリーで照合し、両commit間の60ファイルの差分を業務・AI・画面・認証設定・CI・開発運用・依存更新に分類した。
- `git archive origin/develop`の作業用snapshotからBackend AST、Desktop TypeScript AST、SQL履歴を再抽出した。手元の別branchのファイルを最新developとして読まない。
- 主要図の変更箇所は関連する実装、呼出元、DTO/契約、ADR、設計、READMEまで追跡した。未変更の図は既存の照合結果を基礎に、根拠ファイルの存在と今回の差分による影響を確認した。
- ソースリンクを対象commitの固定リンクへ変更した。API・関数・SQLの索引は定義行へのリンクを持つ。
- アプリの実装コードは本作業の変更対象にせず、確認した動作を図解・用語・技術説明へ反映した。

## 図解の修正と追加

| 対象 | 確認した実装と図解側の対応 |
| --- | --- |
| 図02・51: ガードレール | developにはJev専用Decisions APIがない。`GuardrailDecision`の構造化応答でallowed/categories/reason等を検証する。20,000文字chunk、2,000文字overlap、0.75閾値の説明を置換。専用gatewayのDEBUG省略と共通workflow、形式補正とtransport retryを区別した。 |
| 図13: 構成案の承認状態 | Desktopは構成案が読める/進捗40%以上だけでは通常経路の承認画面へ進まず、`waiting_for_user`を待つ。表示後の追加監視、statusが取得できない互換経路、RPCの本人・版・状態の再検証を説明した。 |
| 図13: 構造化出力の補正 | developの構成案出力枠は4,000〜20,000 tokensの件数式。LengthFinishReasonError等への汎用補正はあるが、作業ブランチの`outline_output_truncated`専用コードは含まれない。 |
| 図26・追加図54: 教材タグ | Jevのslug/確率による分類を、`MaterialTagSelectionOutput`の1〜5候補、NFKC/trim/casefold、priority順、未知名/重複除外、既存IDへの解決に置換した。入力は各step本文先頭1,200文字等の抜粋。既存sampleとtagsが揃う再利用条件、候補0件の省略、解決0件の失敗も説明した。 |
| 図26: 完成イメージ | 新規教材化は未実装の完成イメージを`image_status=failed`と記録してもjobは成功する。図29の別jobによるサムネイル生成とは区別した。 |
| 図04: OAuth設定 | GitHub/Google設定の欠落とGoogle client ID形式を診断する。authorization-code flowのnonce検査を維持する。設定値をログへ出さない。 |
| 図43・50: Docker | 製品runtimeの手動起動案内と、dev/CIの起動補助を区別。起動確認はLinux Engine応答に加えて`docker ps`の成功を必要とする。 |
| 追加図55: CI | Linux jobの一時的な`ubuntu-latest`配置、Windows/macOS self-hosted、runtime smoke前のDocker preflightと診断、集約gateを図示した。renderer E2Eとruntime smokeのOS範囲を分けた。 |
| 追加図56: Discord日次通知 | open IssueとProject予定の権限分離、一意照合、分類/並び順、メンバーごとのタイトルリンク、dry-run、日付/通知先hashによる再送抑止、送信後の履歴記録を図示した。 |
| 用語・技術スタック | Jev用語を構造化応答へ置換し、LangGraphの実際の利用箇所とvisibility timeoutの文脈を修正。新用語を含む129項目と、42項目/9分野の技術説明を同期した。 |

## 実装状態として維持した注記

`code_evaluation` handlerの`NotImplementedError`、組織招待一覧の空一覧、個別環境再生成/作者売上・払出serviceの`FeatureUnavailableError`、Windows 11 variant作成・検証結果提出と通常workerの区別は、developでも根拠を維持する。R09D本番activationと実Storage/Authのdeploy先受入の未完了は、対象commitのBackend READMEの記載であり、今回の稼働調査結果ではない。

## 再抽出した規模

| 項目 | 旧図解 | develop照合後 |
| --- | ---: | ---: |
| 主要図 | 53 | 56 |
| 用語 | 127 | 129 |
| API宣言（OpenAPI / 非掲載） | 124 / 8 | 124 / 8 |
| Backend関数・メソッド宣言 | 2,757 | 2,751 |
| Desktop関数・メソッド・callback | 2,391 | 2,394 |
| Desktop TS/TSXファイル | 239 | 239 |
| SQL CREATE TABLEの名前 | 109 | 109 |
| CREATE FUNCTION / POLICY / TRIGGER定義イベント | 318 / 245 / 105 | 318 / 245 / 105 |

関数の数は宣言・内部関数・callback・portを含み、業務機能の数ではない。SQLは履歴の字句索引であり、後続DROP/ALTERやoverloadを解決した現行スキーマ一覧ではない。

## 検証と限界

対象commitのFastAPI定義からOpenAPIを生成し、抽出した124件のmethod/pathとの完全一致を確認した。56図のnode/edge/根拠、129用語と各図の参照、42技術の根拠、索引のファイル/行、JSON/HTMLデータの一致、埋込JavaScript構文、Markdownリンクを検査した。lockfileの字句抽出はLF/CRLF/CRの入力で同じ結果を確認した。OpenAPI生成は既存uv環境を利用したschema生成のみで、server起動・lifespan・実DB/API呼出は行っていない。

閲覧版と技術スタック説明ページをローカルChromiumで確認した。56図/132 API/129用語と42技術の表示、冪等用語の検索、LangGraphの検索、AI分野への切替、用語と根拠欄の展開、図51/54への直接リンク、前後移動、commit/定義行リンク、図の拡大・全体表示が正常に動作した。1280pxと390pxの画面幅で表示を確認し、documentの横はみ出しなし、console error/warningは0件だった。

静的照合は全ての動的経路や外部依存の正しさを証明しない。本体アプリ/実DB/外部AI/Stripe/Discord、GitHub Actionsの再実行、本番activationはこの作業で実行・確認していない。ブラウザー確認はmacOS上のローカルChromiumであり、Windows/Linuxでの本体検証結果を意味しない。

## 参照した資料

共通入口のAGENTS.md、CODEBASE_MAP.md、README.md、docs/AGENTS.md、docs/README.md、docs/project/README.md、docs/adr/README.mdを確認した。具体的な変更の根拠は以下と各図の固定リンクを参照する。CODEBASE_MAPのAPI-client説明も、Orvalのfetch設定に合わせてDTO/request関数とDesktop側hookの分担へ同期した。

- [Module契約](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/architecture/module-contracts.md)、[全面ハーネス設計](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/project/guide-generation-full-harness-design.md)、[Backend README](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/apps/backend/README.md)、[Desktop README](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/apps/desktop/README.md)、[API-client README](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/apps/api-client/README.md)。
- [ADR-001](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/adr/ADR-001-social-login-only.md)、[ADR-006](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/adr/ADR-006-local-devcontainer-runtime.md)、[ADR-033](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/adr/ADR-033-guide-outline-confirmation-before-body-generation.md)、[ADR-043](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/adr/ADR-043-clickstack-unified-observability.md)、[ADR-049](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/adr/ADR-049-docker-compatible-local-linux-engine.md)、[ADR-050](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/adr/ADR-050-guide-generation-dedicated-full-harness.md)。
- [PROJECT_MANAGEMENT](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/docs/PROJECT_MANAGEMENT.md)、[Grounded Docs README](https://github.com/5B-Projects/metis/blob/efb532f74c383cd35c055d85d3f989ba643c3611/grounded-docs/README.md)、[manifest/lockfileと実装の対応](tech-stack.md)。
