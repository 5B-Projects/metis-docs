module.exports = {
  title: "Metis Docs",
  tagline: "ゴールから学習へ。その仕組みを、図から理解する。",
  favicon: "img/favicon.svg",
  url: "https://5b-projects.github.io",
  baseUrl: "/metis-docs/",
  organizationName: "5B-Projects",
  projectName: "metis-docs",
  trailingSlash: true,
  onBrokenLinks: "throw",
  i18n: { defaultLocale: "ja", locales: ["ja"] },
  markdown: {
    format: "detect",
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: "throw" },
  },
  themes: ["@docusaurus/theme-mermaid"],
  presets: [
    [
      "classic",
      {
        docs: { sidebarPath: "./sidebars.js", routeBasePath: "docs" },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
  themeConfig: {
    colorMode: { defaultMode: "light", respectPrefersColorScheme: true },
    navbar: {
      title: "Metis Docs",
      logo: { alt: "Metis", src: "img/favicon.svg" },
      items: [
        { to: "/docs/overview", label: "ロジック図解", position: "left" },
        { to: "/docs/tech-stack", label: "技術スタック", position: "left" },
        { to: "/docs/glossary", label: "用語集", position: "left" },
        { to: "/search", label: "検索", position: "right" },
        {
          href: "https://github.com/5B-Projects/metis-docs",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "仕組みを知る",
          items: [
            { label: "全体の循環", to: "/docs/logic/01" },
            { label: "技術スタック", to: "/docs/tech-stack" },
            { label: "用語集", to: "/docs/glossary" },
          ],
        },
        {
          title: "根拠をたどる",
          items: [
            { label: "API・SQL索引", to: "/docs/inventory" },
            { label: "develop照合記録", to: "/docs/verification" },
            {
              label: "図解ビューア",
            href: "pathname:///metis-docs/atlas/",
            },
          ],
        },
      ],
      copyright: "Metis / 5B-Projects · Built with Docusaurus",
    },
    mermaid: { theme: { light: "neutral", dark: "dark" } },
    prism: { additionalLanguages: ["python", "sql", "bash", "json"] },
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
  },
};
