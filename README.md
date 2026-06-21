# pullbook.app

Landing page for [PullBook](https://pullbook.app), the espresso dial-in companion for iPhone and iPad. Served by GitHub Pages.

## Editing & building

Pages are assembled from shared chrome so the nav, footer, fonts, and colours live in one place.

- **Shared chrome** — `partials/base.css` (vars, reset, nav, footer), `partials/doc.css` (document-page typography), and the head/nav/footer markup in `build.mjs`.
- **Per-page content** — `src/<page>.html` holds only that page's unique `<style>`, body, and any `<script>`.
- **Build** — `node build.mjs` regenerates the `*.html` files at the repo root (which GitHub Pages serves). Commit the built HTML.

To add a page: create `src/<name>.html`, register it in the `pages` array in `build.mjs`, then run `node build.mjs`.

The changelog is generated from `releases.json`. The release Action in `richsharples/pullbook` runs `generate-changelog.mjs` (a thin wrapper around `build.mjs`) to refresh `changelog.html` after each release.

`encode-video.sh` converts raw screen recordings into the web-optimised MP4s used on the home page.
