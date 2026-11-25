# Maths Lesson Tools

Static English-language classroom tools for Hong Kong secondary mathematics:

- **S1: Geometry Lab** — existing prisms, cross-sections, sketch, volume and surface area activities.
- **S5: Variation** — existing variation question generator.
- **S5: Brawl Math** — permutation, combination and probability lab at `brawl-math/`.

## Brawl Math

Five modules share 12 configurable Brawler placeholders, with original inline SVG portraits and simplified classroom categories. No official game graphics, remote fonts, APIs, accounts or database are used.

- **Team Builder:** choose 3, rearrange, save unique teams and detect duplicates. Defaults to 6 available Brawlers.
- **Duel Arena:** ordered slots, click selection, mouse drag swaps and keyboard/touch swap buttons. Explore the six orders of one team.
- **Comparison:** `brawl-math/#compare` uses one shared selection in side-by-side (or stacked) team and battle-order panels. Discover `P(n,3) = C(n,3) × 3!`. Results stay hidden until revealed.
- **Ranked Draft:** banned, compulsory, incompatible, category and first/last-position restrictions; selection validation, exact enumeration, direct and complementary solutions. Adjust category quotas, individual bans, team size and named Brawlers. These are separate classroom restriction presets, not official Ranked rules.
- **Showdown:** unbiased Fisher–Yates rankings using rejection-sampled Web Crypto random integers. Ten equally likely players, elimination sequence, complete ranking and podium. Four selectable probability events, cumulative trials, successes, exact experimental fractions, differences and convergence graph.
- **Knockout:** adjustable round probability, accessible interactive probability tree, six terminal paths, exact path fractions and best-of-three simulation. Stops when either team reaches two wins.

Each module offers Explore, Challenge and Teacher modes. Challenges accept equivalent decimal, fraction and percentage answers, with feedback, hints, worked solutions and new questions. Teacher controls include formulas, answers, difficulty, applicable Brawler pool size, reduced animation and full-screen presentation. Activity state is kept in memory and resets on page reload. Formula rendering uses native MathML plus large readable text, matching the dependency-free approach of the existing Variation tool.

### Files

- `brawl-math/index.html` — shared page shell; module navigation uses URL hashes for GitHub Pages compatibility.
- `brawl-math/style.css` — responsive lobby, modules, accessible controls and reduced-motion styles.
- `brawl-math/app.mjs` — activities, questions, teacher controls and simulations.
- `brawl-math/brawlers.mjs` — classroom categories, character data and original SVG placeholders.
- `brawl-math/math.mjs` — BigInt counting, reduced fractions, restrictions, sampling and probability functions.
- `tests/brawl-math.test.mjs` — automated mathematical verification.

## Run locally

From the repository root:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/`. Serve over HTTP; loading ES modules directly from `file://` is not supported. No build or install step is needed. A modern browser with JavaScript, BigInt, native MathML and Web Crypto is required. Full-screen availability depends on browser/device policy.

## Tests

Node.js 20.19+ (mathematics-only tests also work with Node.js 18+):

```sh
npm ci
npm test
node --check brawl-math/app.mjs
```

The only development dependency, happy-dom, runs DOM interaction checks; there are no runtime dependencies. DOM checks cover all modules, mode switches, duplicate combination detection, six displayed permutations, draft controls, challenge feedback, tree selection and 10,000-match experiments.

Mathematical tests cover exact integer arithmetic, invalid parameters, impossible events, duplicate teams versus ordered arrangements, restriction counts across pool/team sizes, equivalent numerical answers, unbiased shuffle branch enumeration, exact Showdown probabilities, terminal Knockout paths and seeded large-trial convergence. Statistical tests are deterministic; real experiments naturally fluctuate and do not guarantee monotonic convergence.

## GitHub Pages deployment

Keep the existing Pages source/branch configuration. Merge the Brawl Math changes into the branch already published by GitHub Pages. There is no build output or new deployment workflow. All runtime paths are relative; the added landing-page link resolves to `./brawl-math/`. Geometry and Variation source files are unchanged.

Before classroom use, verify desktop/mobile rendering in your target browsers, exercise the module links, and run a 10,000-match experiment. Browser rendering checks could not be completed in the implementation environment because Chromium launch and preview access were restricted. DOM checks do not replace real visual, touch, drag/drop or fullscreen testing.

## Teaching limits

This resource is a simplified mathematical model, not a prediction of actual player performance or a reproduction of official game rules. Ranked restrictions are explored one preset at a time. Category quotas use Tank, Support and Damage Dealer (Controllers are excluded from this preset). Ordered draft teams are capped at five members to keep exact enumeration responsive. Teacher controls are classroom conveniences, not access controls. No progress is persisted.
