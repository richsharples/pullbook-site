// Regenerates changelog.html from releases.json. Run by the changelog GitHub
// Action in richsharples/pullbook after each release; can also be run locally:
//   node generate-changelog.mjs
import { readFileSync, writeFileSync } from "node:fs";

const releases = JSON.parse(readFileSync(new URL("./releases.json", import.meta.url), "utf8"));

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const entries = releases
  .map(
    (r) => `
  <article class="release">
    <div class="release-head">
      <h2>${esc(r.version)}</h2>
      <span class="mono meta">BUILD ${r.build} · ${formatDate(r.date).toUpperCase()}</span>
    </div>
    <ul>
${r.notes.map((n) => `      <li>${esc(n)}</li>`).join("\n")}
    </ul>
  </article>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Changelog — PullBook</title>
  <meta name="description" content="What's new in each PullBook beta release.">
  <link rel="icon" type="image/svg+xml" href="./favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper: #F5F0EB; --card: #FBF8F4; --ink: #1F1814; --ink-2: #4A4039;
      --ink-3: #8A7C70; --line: #E3DAD0; --crema: #C8855A;
      --f-sans: "Geist", system-ui, -apple-system, sans-serif;
      --f-mono: "Geist Mono", ui-monospace, monospace;
      --f-serif: "Instrument Serif", Georgia, serif;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--f-sans); background: var(--paper); color: var(--ink); line-height: 1.5; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 640px; margin: 0 auto; padding: 0 24px 72px; }
    header { padding: 64px 0 40px; }
    .home { font-family: var(--f-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); text-decoration: none; }
    .home:hover { color: var(--crema); }
    h1 { font-size: clamp(34px, 6vw, 48px); font-weight: 500; letter-spacing: -0.02em; margin-top: 18px; }
    h1 .serif { font-family: var(--f-serif); font-style: italic; font-weight: 400; }
    .sub { color: var(--ink-3); font-size: 15px; margin-top: 8px; }
    .release { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 22px 24px; margin-bottom: 16px; }
    .release-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    h2 { font-size: 19px; font-weight: 500; letter-spacing: -0.01em; }
    .meta { font-size: 10px; letter-spacing: 0.12em; color: var(--ink-3); }
    .mono { font-family: var(--f-mono); }
    ul { padding-left: 18px; }
    li { font-size: 14px; color: var(--ink-2); margin-bottom: 7px; }
    li::marker { color: var(--crema); }
    footer { text-align: center; color: var(--ink-3); font-size: 13px; padding-top: 32px; }
    footer a { color: var(--ink-2); }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <a class="home" href="./">&#8249; pullbook.app</a>
      <h1>What's <span class="serif">new</span></h1>
      <p class="sub">Release notes for every PullBook beta, freshest first.</p>
    </header>
${entries}
    <footer>© ${new Date().getUTCFullYear()} Rich Sharples · <a href="./">pullbook.app</a></footer>
  </div>
</body>
</html>
`;

writeFileSync(new URL("./changelog.html", import.meta.url), html);
console.log(`changelog.html written — ${releases.length} releases`);
