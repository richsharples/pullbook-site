// Static-site builder for pullbook.app.
//
// Each page in src/ holds only its unique parts: an optional <style> block,
// the body markup, and any <script> tags. This script wraps that fragment in
// the shared chrome (head, sticky nav, footer) and the shared CSS partials,
// then writes the finished page to the repo root, where GitHub Pages serves
// it. The changelog body is generated from releases.json.
//
//   node build.mjs            # build every page
//
// The release Action regenerates only the changelog via generate-changelog.mjs,
// which imports buildChangelog() from here.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const read = (rel) => readFileSync(new URL(rel, import.meta.url), "utf8");
const write = (rel, data) => writeFileSync(new URL(rel, import.meta.url), data);

const BASE_CSS = read("./partials/base.css").replace(/\s+$/, "");
const DOC_CSS = read("./partials/doc.css").replace(/\s+$/, "");

const FONTS =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap";

// --- shared chrome -------------------------------------------------------

const head = ({ title, description, headExtra = "" }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="icon" type="image/svg+xml" href="./favicon.svg">
${headExtra ? headExtra + "\n" : ""}  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">`;

const nav = (current) => {
  const cur = (key) => (current === key ? ' aria-current="page"' : "");
  return `  <div class="navbar">
    <nav class="topnav wrap">
      <a class="brand" href="./">PullBook</a>
      <div class="navlinks">
        <a href="./roadmap.html"${cur("roadmap")}>Roadmap</a>
        <a href="./changelog.html"${cur("changelog")}>Changelog</a>
        <a href="./feedback.html"${cur("feedback")}>Feedback</a>
        <a href="mailto:rich.sharples@softwhere.org">Contact</a>
      </div>
    </nav>
  </div>`;
};

const footer = () =>
  `  <footer class="wrap">
    © ${new Date().getUTCFullYear()} Rich Sharples · <a href="./roadmap.html">Roadmap</a> · <a href="./changelog.html">Changelog</a> · <a href="./feedback.html">Feedback</a> · <a href="mailto:rich.sharples@softwhere.org">Contact</a>
  </footer>`;

// --- changelog body ------------------------------------------------------

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const renderReleases = () => {
  const releases = JSON.parse(read("./releases.json"));
  // Newest release renders expanded; older ones collapse to version/build/date.
  return releases
    .map(
      (r, i) => `  <details class="release"${i === 0 ? " open" : ""}>
    <summary>
      <h2>${esc(r.version)}</h2>
      <span class="mono meta">BUILD ${r.build} · ${formatDate(r.date).toUpperCase()}</span>
      <span class="chev" aria-hidden="true"></span>
    </summary>
    <ul>
${r.notes.map((n) => `      <li>${esc(n)}</li>`).join("\n")}
    </ul>
  </details>`
    )
    .join("\n\n");
};

// --- page assembly -------------------------------------------------------

function renderPage(page) {
  const fragment = read(`./src/${page.out}`);

  // Pull the page-specific <style> out of the fragment.
  let pageCss = "";
  const styleMatch = fragment.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) pageCss = styleMatch[1].replace(/^\n+/, "").replace(/\s+$/, "");

  // Pull out any <script> tags (kept verbatim, re-attached after the footer).
  const scripts = [];
  let body = fragment
    .replace(/<style[^>]*>[\s\S]*?<\/style>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, (m) => {
      scripts.push(m);
      return "";
    })
    .trim();

  if (page.nav === "changelog") body = body.replace("{{RELEASES}}", renderReleases());

  const css = [BASE_CSS, page.doc ? DOC_CSS : "", pageCss]
    .filter(Boolean)
    .join("\n\n");
  const scriptBlock = scripts.length ? "\n\n" + scripts.join("\n") : "";

  return `${head(page)}
  <style>
${css}
  </style>
</head>
<body>

${nav(page.nav)}

${body}

${footer()}${scriptBlock}

</body>
</html>
`;
}

// --- page registry -------------------------------------------------------

const pages = [
  {
    out: "index.html",
    title: "PullBook — the espresso dial-in companion",
    description:
      "Track beans, log shots, assess taste, and get recipe adjustments as you work toward a dialled-in pull. For iPhone and iPad.",
    nav: "home",
    doc: false,
    headExtra: [
      '  <link rel="apple-touch-icon" href="./icon-1024.png">',
      '  <meta property="og:title" content="PullBook — the espresso dial-in companion">',
      '  <meta property="og:description" content="Track beans, log shots, assess taste, and get recipe adjustments as you work toward a dialled-in pull.">',
      '  <meta property="og:image" content="https://pullbook.app/icon-1024.png">',
      '  <meta property="og:url" content="https://pullbook.app">',
      '  <meta property="og:type" content="website">',
    ].join("\n"),
  },
  {
    out: "roadmap.html",
    title: "Roadmap — PullBook",
    description: "Where PullBook is headed — what we're building next.",
    nav: "roadmap",
    doc: true,
  },
  {
    out: "changelog.html",
    title: "Changelog — PullBook",
    description: "What's new in each PullBook beta release.",
    nav: "changelog",
    doc: true,
  },
  {
    out: "feedback.html",
    title: "Feedback — PullBook",
    description:
      "Tell us what's working, what's broken, and what you'd love to see in PullBook.",
    nav: "feedback",
    doc: true,
  },
];

export function buildChangelog() {
  const page = pages.find((p) => p.nav === "changelog");
  write(`./${page.out}`, renderPage(page));
  console.log("changelog.html written");
}

export function buildAll() {
  for (const page of pages) {
    write(`./${page.out}`, renderPage(page));
    console.log(`${page.out} written`);
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) buildAll();
