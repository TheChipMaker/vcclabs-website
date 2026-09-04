# VccLabs

Interactive volts and calculators for electrical engineering students.

**This README is the source of truth for the project.** Decisions recorded here supersede anything said in chat, notes, or older drafts. If a decision changes, change it here in the same commit.

---

## 1. What this is

VccLabs teaches the subjects every electrical engineering student on the planet has to take. Instead of a textbook chapter or an hour-long lecture, you get a nine-minute interactive **volt** that takes you from confused to competent on power electronics, Fourier transforms, calculus.

**Audience:** undergraduate electrical engineering students. Fundamentals are the product, not something to skip past.

**Positioning, short form:** "VccLabs teaches the subjects every electrical engineering student on the planet has to take, in under ten minutes each. Power electronics, Fourier transforms, calculus, all interactive, no fluff."

Two phrases carry the pitch and should stay consistent across the site and any marketing: **"confused to competent"** and **"every EE student on the planet."**

### Volts vs. calculators

- **Volts are the product.** They are what people come back for and what a Pro pass eventually unlocks.
- **Calculators are the front door.** They exist to earn search traffic and get a first visit. They are not the value proposition.

Do not conflate the two in copy, navigation, or pricing pages.

---

## 2. Curriculum roadmap

Order is deliberate — power electronics first because it is where the existing domain depth is.

1. Power electronics
2. Signals and systems
3. Electromagnetics
4. Calculus
5. Physics

Later, once the format is proven: computer engineering, mechatronics, mechanical engineering.

> **Open item:** volts 01 and 02 are LLC resonant conversion, a senior-elective-to-practitioner topic rather than undergraduate material. Built first because that is where the domain depth is, and they serve working engineers well — which also makes them the right pair to show an institutional buyer. Both are labelled **advanced**. Neither can carry the "confused to competent" undergraduate pitch on its own; a buck converter volt is still needed for that.

---

## 3. Naming

| Term           | Meaning                                                     |
| -------------- | ----------------------------------------------------------- |
| **Volt**       | One self-contained interactive lesson. The unit of product. |
| **Calculator** | A standalone free tool, usually SEO-driven.                 |
| **Widget**     | An interactive figure embedded in a volt slide.             |
| **Pro pass**   | The paid tier that unlocks the full volt library.           |

The word "deck" is retired as a product term. Routes are `/volts/<slug>/`, content lives in `src/_data/voltdata/`, widgets at `/widgets/<name>/`.

---

## 4. Volt format

A volt is a **full-viewport slide deck**, not a scrolling page. It renders on a fixed 1280×720 stage scaled to fit the viewport, so layout is deterministic — a slide looks identical everywhere and never reflows.

- Roughly 15–20 slides, consumable in 30 minutes or less.
- Thumbnails carry honest, specific durations using odd numbers — "9 minute volt", not "5 min read". The label says *volt*, never *read*.
- Every slide carries a dark/light toggle in its header.
- Slides are numbered with a stable ref (`V01-S07`) shown in the footer, so a slide can be cited in support or errata.

**Superseded:** the earlier "plain rectangular slides, no rounded corners, no decorative frame" rule is **no longer in force**. The brand system specifies `--radius: 16px` / `--radius-sm: 10px` and the slide components use them. Do not reintroduce the square-corner rule without changing this section.

### Slide types

Set by the `type` key in the volt JSON. Adding a type means adding a branch in `src/volts/volt.njk` — do that reluctantly, because every type is a thing that must be maintained forever.

| Type        | Shape                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| `cover`     | Title slide with the series label and glow.                               |
| `parallel`  | Two labelled columns, usually a benefit/cost or cause/effect pair.        |
| `split`     | Figure or widget on one side, numbered points and a callout on the other. |
| `equations` | Two formula blocks side by side, each with a note, plus optional points.  |

Shared optional keys on every type: `eyebrow`, `title` (accepts HTML, use `<span class="hl">` for the accent), `titleSize`, `lead`, `points`, `callout`, `ref`, `surface`.

`"surface": "invert"` flips a single slide against the current theme — dark slide in light mode, light slide in dark mode. **Currently unused.** It was tried as a visual beat between widget-heavy slides and read as a bug rather than a rhythm, so no slide sets it. Keep this in mind before reaching for it again.

Point tones: `ready` (green), `fault` (red), default (brand green). Column tones: `gain` and `cost`.

### Production pipeline

Volt 01 was hand-built and written as JSON from day one, which is how the schema above was discovered. That worked and should be repeated once more, not indefinitely.

1. Hand-build the first few volts to find the repeatable slide types.
2. Encode those types as a schema consumed by the Nunjucks template and parameterized widgets.
3. From then on, new volts are new JSON files against the established schema — not bespoke interactives built from scratch each time.

We are between steps 2 and 3. The four slide types are stable; the widgets are still bespoke.

---

## 5. Widgets

Interactive figures are **standalone HTML pages served at `/widgets/<name>/`, embedded in a slide via an iframe**. They are not inline `srcdoc`, and they are not part of the slide's DOM.

Why: a widget is a self-contained app with its own CSS and script, and iframing it means a broken widget cannot break the deck. The cost is that widgets do not inherit the page theme — each carries its own dark palette.

**Widgets are cloned into the index panel.** Opening the slide index renders live copies of every slide, iframes included, so a widget loads twice per session. `loading="lazy"` and `pointer-events: none` keep this cheap at five widgets. It will not stay cheap — a volt with a dozen widgets will make the index slow to open, and the fix at that point is snapshotting widgets to static images at build time rather than embedding them live.

**Widgets and figures are namespaced by volt slug.** A volt's assets live in `src/widgets/<volt-slug>/` and `src/_includes/figures/<volt-slug>/`, so volts never collide and filenames stay short.

To add a widget: create `src/widgets/<volt-slug>/<name>.njk` — no front matter needed, the permalink is derived from the file path by `src/widgets/widgets.11tydata.js`. Then set `"widget": "<name>"` on a `split` slide.

**Resolution rule:** a bare name (`"gain-curve"`) resolves inside the current volt's folder. A name containing a slash (`"shared/fourier-scrubber"`) is taken as a literal path, which is how genuinely reusable widgets are shared across volts. Put something in `shared/` only once a second volt actually needs it — premature sharing is how you end up with a widget that fits neither caller.

### Widget rules

- **Label the model honestly.** If the numbers are illustrative rather than solved, the readouts must say so. Students will quote these figures back in exams.
- **Respect `prefers-reduced-motion`.** Animated widgets hide their play control entirely when it is set, and the static view must still be complete and readable.
- **Sliders, not text inputs.** Volts are for exploring a relationship. Precise numeric entry belongs in the paired calculator.
- **Semantic colours only.** Green ready, blue interactive, red fault, amber caution. Never decorative.

### Current widgets

All under `src/widgets/llc-resonant-converter/`.

| Name            | Model                                                                                                      | Used on                      |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `zvs-explorer`  | Illustrative — constant-current Coss discharge                                                             | S02                          |
| `gain-curve`    | **Real** — FHA gain equation                                                                               | S07, S08, S09                |
| `regions`       | **Real** — same equation, capacitive boundary computed as the peak-gain locus, load slider, animated sweep | S10                          |
| `waveforms`     | Illustrative — qualitative shapes, normalised "pu" values                                                  | S12, S13                     |
| `tank-designer` | **Real** — full FHA design equations, stresses, ZVS ceiling                                                | V01 S16, V02 S04/S06/S07/S11 |

**Validated.** Checked against MPS's published 8-step worked design (400 V / 48 V / 600 W / 100 kHz, L_N = 9, Q_E = 0.35). R_ac, C_r, L_r, L_m and secondary rms current all agree to within rounding. Two deliberate divergences:

- **Magnetising rms** uses `I_pk/√3` (triangular, as taught in V01-S12), not the `I_pk/√2` that FHA-sinusoidal references use. Reads ~2% low on `I_Lr` rms. Kept for internal consistency.
- **V_Cr** includes the `V_in/2` blocking level and uses peak current. Several app notes publish the AC swing alone, which is not a component rating. Ours is the conservative and correct figure; the widget says so on screen.

The ZVS ceiling is evaluated at the start-up corner (~3× f_r), not f_r, because that is where the frequency is highest and ZVS hardest.

Conventions: half-bridge, `M = nV_out/(V_in/2)`, `m = (L_r+L_m)/L_r`. Both `m` conventions appear in the literature and differ by 1 — both volts use this one. Nominal bus is now a slider, not hardcoded.

---

## 6. Device targets

- **Tablet and desktop/laptop first.** Breakpoints start at 768px and up.
- Touch-first interactions: swipe to advance, finger-sized tap targets, diagrams that scale without pinch-zoom.
- Below 768px the marketing site shows a "best viewed on tablet or larger" notice. Phone support is deferred, not promised.

> **Open item:** the deck stage scales to fit any viewport, so volts technically render on a phone — but the 1280×720 layout becomes unreadably small and the widget sliders are hard to hit. The deck currently has no small-screen guard of its own. Decide whether to add one or to build a phone layout.

### Deck controls

Arrow keys or space to advance, `O` for the slide index, `F` for full screen, `Esc` to close the index, Home/End to jump, swipe on touch. Slide IDs are written to the URL hash, so any slide is directly linkable.

The stage reserves ~96px for the nav bar when windowed and reclaims it in full screen, where the nav auto-hides and returns on mouse movement. Entering full screen shows a brief "press Esc to exit" toast. Note that `requestFullscreen` needs a user gesture — a volt cannot open full screen on page load, only from a click or key press.

**The slide index shows live thumbnails**, built by cloning each slide node and scaling it. They are constructed lazily on first open, not at page load.

---

## 7. Brand

Derived from an existing house system and kept deliberately compatible with it.

### Colour

**Green is both the signature and the "ready" semantic** — one token, two jobs, never split. Green means ready, correct, or safe. It is never decoration and never a category colour. When something is *clickable* — a different idea from *good* — it uses Signal blue, so interactivity never competes with the go-signal.

| Token                 | Value     | Meaning                               |
| --------------------- | --------- | ------------------------------------- |
| `--ready` / `--brand` | `#15B86A` | Ready, correct, success, brand        |
| `--ready-bright`      | `#2BD27D` | The same, on dark surfaces            |
| `--ready-deep`        | `#0C7A48` | Legible green text on light           |
| `--signal`            | `#2C66EA` | Interactive, clickable, informational |
| `--fault`             | `#EF4444` | Fault, danger, stop, destructive      |
| `--warn`              | `#F5C542` | Caution, derate, waiting              |

Neutrals: Ink `#0E1116`, Ink-2 `#161A20`, Ink-3 `#1F242C`, line-dark `#242A32`; Paper `#FFFFFF`, off `#F6F7F9`, line `#E7E9ED`; Slate `#59626E`, slate-dark `#8A94A1`, body `#374151`.

The marketing site and the deck share one set of neutrals, so moving between the homepage and a volt does not shift colour temperature. An earlier warm-paper palette (`#FDFAF5` and sand-toned greys) was tried and rejected — light mode is pure white.

Dark sections use Ink `#0E1116`, never pure black.

### Typography

| Role          | Font           | Weight / size                  |
| ------------- | -------------- | ------------------------------ |
| Hero / H1     | Sora           | 800, clamp 36–60px, 1.02       |
| Slide title   | Sora           | 800, 38–46px, 1.08             |
| H2            | Sora           | 700, 30px                      |
| Body          | Inter          | 400, 16px, 1.55                |
| Eyebrow / tag | JetBrains Mono | 500, 11–13px, uppercase, .12em |
| Data / specs  | JetBrains Mono | 400–500, 13–22px               |

**Every measured value, formula, device ID and slide ref is set in JetBrains Mono.** This is not decorative — it is the signal that a number is exact.

> **Open item:** Google Fonts is blocked in China. Self-hosting the three families in `src/assets/fonts/` is the fix if that matters.

### Voice

Like a competent engineer who respects the reader's time. Precise where it is safety-critical, plain everywhere else. Numbers are exact; instructions are verbs. When something is wrong, say what happened and the one next action — no alarm, no blame.

### Theme

Light and dark are both first-class. Preference persists in `localStorage` under `vcc-theme`; an inline script in `<head>` applies it before first paint. Falls back to `prefers-color-scheme`.

`theme.js` uses one delegated handler for every `[data-theme-toggle]` element, so adding a toggle anywhere requires no JS. `volt.js` watches the `data-theme` attribute and re-marks slide surfaces live.

---

## 8. Architecture

```
src/
  _data/
    site.json           site-wide strings
    volts.json          volt index for the homepage
    voltdata/           one JSON file per volt -> generates its route
  _includes/
    base.njk            marketing site layout
    tool.njk            calculator layout (not yet used)
    figures/<volt-slug>/   inline SVG figures, themed via CSS vars
  volts/volt.njk        paginated deck template, layout: null
  widgets/
    widgets.11tydata.js    derives every widget permalink from its file path
    <volt-slug>/           standalone widget pages
  assets/
    css/site.css        marketing site
    css/volt.css        deck engine + theme
    js/theme.js         theme toggle
    js/volt.js          deck engine
  index.njk
dist/                   build output, gitignored
```

- **Generator:** Eleventy, input `src/`, output `dist/`.
- **Hosting:** Netlify free tier, Cloudflare in front for caching and traffic absorption.
- **Auth:** Clerk. The Pro flag lives in Clerk user metadata. **No database at launch.** Supabase was rejected — its free tier pauses after 7 days of inactivity.
- **Payments:** existing gateway, webhook verified server-side in a Netlify Function.

Figures are Nunjucks includes rather than `<img>` so they inherit theme variables and redraw correctly in both modes. The `svg-*` classes in `volt.css` are the contract; a new figure must use them.

### Hard rule on gated content

**Gated volts must never be static files in `dist/`.** URLs are guessable. Pro content is served through a Netlify Function that checks the user's Pro flag on every request. There is no exception to this.

---

## 9. Monetization

**Current stage:** a single minimal "buy me a coffee"-style link in the footer. Flat copy. No donate button, no paywall, no emotional or guilt-based framing.

**Pro pass, when it launches:** $39/year, annual only, promoted as "$3.25/month, billed annually at $39." The $39 figure must stay visible — never in fine print.

- **Annual only.** Occasional-use reference material invites subscribe-use-cancel behaviour on monthly plans, and monthly bleeds more to gateway fees.
- **Don't announce "free forever."** Keep the Pro architecture in the background. Revisit around 15 published volts with real traffic data.
- **Students convert poorly.** Freemium conversion runs 1–5% of registered users, students at the low end. Traffic is the binding constraint, not the auth bill.
- **Institutional buyers are the parallel path.** Universities and EVSE/power-electronics onboarding teams offer far higher value per transaction. The LLC volt in particular is aimed at working engineers, which suits this.

> **Open item:** Buy Me a Coffee vs. Ko-fi is unresolved pending payout support validation. Do not commit a URL until confirmed.

---

## 10. Internationalization

English ships and gets verified first. Spanish is next. The structure goes in from day one so retrofitting is never needed:

- Path prefixes `/en/` and `/es/`.
- All UI strings live in `_data/`. Nothing user-facing is hardcoded in templates.
- **No text baked into images.** Diagrams carry labels as SVG text.
- A native-speaking EE student reviews the first 2–3 Spanish volts before scaling.

> **Open item:** widget UI strings are currently hardcoded in each widget's HTML. This breaks the i18n rule and must be fixed before Spanish, either by templating the widgets or by passing strings through the permalink.

> **Open item:** $39/yr is steep for Latin America. Regional pricing is likely needed before promoting Spanish volts.

**China is a separate venture, not a language folder.** Google is blocked, Baidu requires China hosting plus an ICP license plus local payment rails. Incompatible with the Netlify architecture. Do not treat it as a `/zh/` directory.

---

## 11. Local development

```bash
npm install
npm run dev     # eleventy --serve, http://localhost:8080
npm run build   # eleventy, outputs to dist/
```

Working directories vary by machine — the project syncs between a home and a work computer via Google Drive:

- `C:\Users\USER\Gdrive\Projects\Vcc_Labs\Website`
- `C:\Users\anabi\My Drive\Projects\Vcc_Labs\Website`

> **Known risk:** Google Drive sync can corrupt `node_modules`. It is gitignored, so if the build behaves strangely, delete `node_modules` and reinstall before debugging anything else.

---

## 12. Status

**Built**

- Homepage with volt index
- Volt 01: The LLC Resonant Converter — 19 slides, 5 interactive widgets
- Volt 02: Designing an LLC Converter — 14 slides, reusing `tank-designer` across the volt boundary via the `<volt-slug>/<name>` path form
- Deck engine: scaled stage, keyboard/swipe nav, full screen, thumbnail slide index, per-slide theme toggle
- Brand system applied across site and deck

**Known dead files**

- `src/_includes/tool.njk` — calculator layout, no calculator yet. Wire it up with the first calculator.

**Next**

- [ ] `/volts/` and `/tools/` index pages — the header links to both and neither exists, so they are 404s
- [ ] Second reviewer on the volt 02 stress equations before the calculator goes public
- [ ] Promote it to a real calculator at `/tools/llc-tank-designer/` with numeric inputs and SEO copy
- [ ] Decide the small-screen policy for the deck
- [ ] A buck converter volt to carry the undergraduate pitch
- [ ] Resolve the support-link platform, then wire the footer URL

**Later**

- [ ] Clerk integration and the Pro flag
- [ ] Netlify Function for gated content
- [ ] Widget i18n before Spanish translation
- [ ] Regional pricing for Latin America
- [ ] Per-slide, per-user annotation layer: freehand drawing, typed notes, saved to account, global show/hide toggle. Deferred — it is what forces a real database.
