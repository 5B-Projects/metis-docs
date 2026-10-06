import React, { useEffect, useMemo, useState } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Search() {
  const url = useBaseUrl("/data/search.json");
  const [rows, setRows] = useState(null),
    [query, setQuery] = useState(""),
    [type, setType] = useState("全て"),
    [limit, setLimit] = useState(30),
    [error, setError] = useState(false);
  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") || "");
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("検索索引");
        return r.json();
      })
      .then(setRows)
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [url]);
  const types = useMemo(
    () => ["全て", ...new Set(rows?.map((r) => r.type) || [])],
    [rows],
  );
  const hits = useMemo(() => {
    const terms = query
      .normalize("NFKC")
      .toLocaleLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (rows || []).filter(
      (r) =>
        (type === "全て" || r.type === type) &&
        terms.every((term) =>
          (r.title + " " + r.text)
            .normalize("NFKC")
            .toLocaleLowerCase()
            .includes(term),
        ),
    );
  }, [rows, query, type]);
  const changeQuery = (value) => {
    setQuery(value);
    setLimit(30);
    const next = new URL(window.location.href);
    if (value) next.searchParams.set("q", value);
    else next.searchParams.delete("q");
    window.history.replaceState(null, "", next);
  };
  return (
    <Layout
      title="ドキュメント検索"
      description="ロジック図・用語・技術スタック・API・関数の索引を横断して検索します。"
    >
      <main className="container search-page">
        <p className="eyebrow">SEARCH THE DOCUMENTATION</p>
        <h1>知りたい仕組みを探す</h1>
        <p>
          日本語・関数名・APIパスで横断検索できます。複数の言葉はスペースで区切ってください。
        </p>
        <div className="search-controls">
          <label htmlFor="search-q">
            検索キーワード
            <input
              id="search-q"
              type="search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="例: waiting_for_user、教材、RLS"
            />
          </label>
          <label htmlFor="search-type">
            対象
            <select
              id="search-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setLimit(30);
              }}
            >
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        {error ? (
          <p role="alert">
            検索データを読み込めませんでした。ページを再読み込みしてください。
          </p>
        ) : rows === null ? (
          <p role="status">検索索引を読み込んでいます…</p>
        ) : (
          <>
            <p className="search-count" role="status">
              {hits.length.toLocaleString("ja-JP")}件
              {hits.length > limit && ` · ${limit}件を表示`}
            </p>
            <div className="search-results">
              {hits.slice(0, limit).map((r, i) => (
                <article key={`${r.url}-${i}`}>
                  <span className="result-type">{r.type}</span>
                  <h2>
                    {r.url.includes("/atlas/") ? (
                      <a href={r.url}>{r.title}</a>
                    ) : (
                      <Link to={r.url}>{r.title}</Link>
                    )}
                  </h2>
                  <p>{r.description}</p>
                </article>
              ))}
            </div>
            {hits.length === 0 && (
              <p>
                一致する項目がありません。言葉を短くするか、対象を「全て」にしてください。
              </p>
            )}
            {hits.length > limit && (
              <button
                className="button button--secondary"
                onClick={() => setLimit(limit + 30)}
              >
                さらに30件表示
              </button>
            )}
          </>
        )}
      </main>
    </Layout>
  );
}
