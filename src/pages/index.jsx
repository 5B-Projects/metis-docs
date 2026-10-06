import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import site from "../data/site.json";

export default function Home() {
  const searchUrl = useBaseUrl("/search/");
  return (
    <Layout
      title="ロジック図解・技術スタック・用語集"
      description="Metisの業務ロジックと技術構成を、コードの根拠が付いた図解で理解するためのドキュメントサイト。"
    >
      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow">METIS / ARCHITECTURE NOTES</p>
            <h1>
              Metisの仕組みを、
              <br />
              図から読む。
            </h1>
            <p className="hero-description">
              ゴール設定からガイド生成、学習、教材の再利用まで。
              <br className="desktop-break" />
              処理の流れと判断の理由を、コードの根拠とともにたどります。
            </p>
            <div className="hero-actions">
              <Link
                className="button button--primary button--lg"
                to="/docs/logic/01/"
              >
                全体の流れを見る <span>→</span>
              </Link>
              <Link
                className="button button--outline button--secondary button--lg"
                to="/docs/tech-stack/"
              >
                技術スタックを読む
              </Link>
            </div>
            <div className="hero-stats">
              <span>
                <strong>{site.diagrams}</strong>ロジック図
              </span>
              <span>
                <strong>{site.terms}</strong>用語の説明
              </span>
              <span>
                <strong>{site.technologies}</strong>技術の役割
              </span>
            </div>
          </div>
          <div className="hero-map" aria-label="Metisの主要な学習の循環">
            <div className="map-caption">LEARNING LOOP</div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>ゴールを設定する</strong>
                  <small>作りたいもの・学習の前提</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>ガイドを生成する</strong>
                  <small>要件確認・構成案の承認</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>実装しながら学ぶ</strong>
                  <small>Dev Container・AI相談・進捗</small>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>教材として再利用する</strong>
                  <small>完了評価・教材化・検索</small>
                </div>
              </li>
            </ol>
            <p>認証・利用権・ジョブ・監査が、この循環を支える。</p>
          </div>
        </section>
        <section className="home-content">
          <div className="snapshot-note">
            <span className="snapshot-dot" />
            {site.date} のdevelopを照合済み ·{" "}
            <code>{site.commit.slice(0, 8)}</code>
            <Link to="/docs/verification/">確認した範囲を読む ↗</Link>
          </div>
          <form className="home-search" action={searchUrl} method="get">
            <label htmlFor="home-q">知りたい処理や用語から探す</label>
            <div>
              <input
                id="home-q"
                name="q"
                type="search"
                placeholder="例: ガードレール、JWT、教材化、quota"
              />
              <button className="button button--primary" type="submit">
                検索する
              </button>
            </div>
            <small>
              図・用語・技術説明に加え、APIと関数の静的索引も検索できます。
            </small>
          </form>
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE THE LOGIC</p>
              <h2>分野から読み進める</h2>
            </div>
            <Link to="/docs/overview/">図解の読み方 →</Link>
          </div>
          <TopicCards />
          <div className="reference-grid">
            <Link to="/docs/glossary/">
              <span>GLOSSARY</span>
              <h3>用語を文脈で理解する →</h3>
              <p>一般的な意味と、Metisの処理での役割を並べて説明します。</p>
            </Link>
            <Link to="/docs/tech-stack/">
              <span>TECHNOLOGY</span>
              <h3>技術のつながりを知る →</h3>
              <p>動く場所、採用目的、版と設定を構成図からたどります。</p>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function TopicCards() {
  return (
    <div className="topic-grid">
      {site.groups.map((group, i) => {
        const diagrams = site.diagramList.filter((d) => d.group === group);
        return (
          <Link
            key={group}
            className="topic-card"
            to={`/docs/logic/${diagrams[0].id}/`}
          >
            <span className="topic-number">
              {String(i + 1).padStart(2, "0")} / {diagrams.length}図
            </span>
            <h3>
              {group}
              <span>↗</span>
            </h3>
            <p>
              {diagrams
                .slice(0, 3)
                .map((d) => d.title)
                .join("・")}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
