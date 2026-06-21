// Regenerates changelog.html from releases.json using the shared layout in
// build.mjs. Run by the changelog GitHub Action in richsharples/pullbook after
// each release; can also be run locally:
//   node generate-changelog.mjs
//
// To rebuild every page (not just the changelog), run `node build.mjs`.
import { buildChangelog } from "./build.mjs";

buildChangelog();
