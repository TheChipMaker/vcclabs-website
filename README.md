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

---

## 3. Naming

| Term | Meaning |
| --- | --- |
| **Volt** | One self-contained interactive lesson. The unit of product. |
| **Calculator** | A standalone free tool, usually SEO-driven. |
| **Pro pass** | The paid tier that unlocks the full volt library. |

The word "deck" is retired. Routes are `/volts/<slug>/`, the layout is `_includes/volt.njk`, and the frontmatter key linking a calculator to its lesson is `volt`.

---

## 4. Volt format

Locked:

- Roughly 15–20 slides per volt, consumable in 30 minutes or less.
- Plain rectangular slides. No rounded corners, no decorative frames, no glowing borders.
- Thumbnails carry honest, specific durations using odd numbers — "9 minute volt", not "5 min read". The label says *volt*, never *read*.
- Every slide carries a dark/light toggle.

### Production pipeline

Volt #1 is hand-built, but written as a **JSON file from day one**. The point is to produce the artifact and discover the schema at the same time.

1. Hand-build the first few volts to find the repeatable slide types.
2. Encode those types as a JSON/YAML schema consumed by reusable Nunjucks/JS slide templates and parameterized interactive widgets.
3. From then on, new volts are new JSON files against the established schema — not bespoke interactives built from scratch each time.

---

## 5. Device targets

Locked:

- **Tablet and desktop/laptop first.** Breakpoints start at 768px and up.
- Touch-first interactions from day one: swipe to advance, finger-sized tap targets, diagrams that scale without pinch-zoom.
- Below 768px, visitors get a "best viewed on tablet or larger" notice. Phone support is deferred, not promised.

---

## 6. Brand

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#FDFAF5` | `#0C1B2E` |
| Surface | `#FFFDFA` | `#152C45` |
| Ink | `#0A1E38` | `#F2EDE4` |
| Muted | `#6B6558` | `#9CA9B4` |
| Line | `#DCD3C6` | `#2A4767` |
| Accent | `#E85D0C` | `#FF6A13` |
| Accent soft | `rgba(232,93,12,0.09)` | `rgba(255,106,19,0.14)` |

Deep navy, safety orange, warm paper. The accent shifts between the two modes so contrast stays legible in both — do not use one hex for both themes.

**The neutrals are warm on purpose.** Pure white backgrounds with blue-grey muted text read clinical and lifeless. Light mode uses warm paper (`#FDFAF5`) with sand-toned muted and line colours; the navy stays cold but sits on something warm. Do not "clean this up" back to `#FFFFFF` / grey — that was the original palette and it was the problem.

`--accent-soft` is the tint used for hover fills on cards. Use it rather than lowering opacity on the accent itself.

**Typography:** IBM Plex Sans for body and headings, IBM Plex Mono for labels, durations, numeric values, and the wordmark. Currently loaded from Google Fonts.

> **Open item:** Google Fonts is blocked in China. Self-hosting Plex in `src/assets/fonts/` is the fix if that ever matters.

**Theme toggle:** a single delegated handler in `src/assets/js/theme.js` drives every element carrying `data-theme-toggle`. Preference persists in `localStorage` under `vcc-theme`; an inline script in `<head>` applies it before first paint to avoid a flash. Falls back to `prefers-color-scheme` when nothing is stored.

Anything animated must respect `prefers-reduced-motion`.

---

## 7. Architecture

```
src/
  _data/        site.json, volts.json
  _includes/    base.njk, volt.njk, tool.njk
  assets/
    css/site.css
    js/theme.js
  index.njk
dist/           build output, gitignored
.eleventy.js
```

- **Generator:** Eleventy, input `src/`, output `dist/`.
- **Hosting:** Netlify free tier, Cloudflare in front for caching and traffic absorption.
- **Auth:** Clerk. The Pro flag lives in Clerk user metadata. **No database at launch.**
  - Supabase was evaluated and rejected: the free tier pauses after 7 days of inactivity.
  - A database gets added only when per-user annotations require real storage.
- **Payments:** existing gateway, webhook verified server-side in a Netlify Function.

### Hard rule on gated content

**Gated volts must never be static files in `dist/`.** URLs are guessable. Pro content is served through a Netlify Function that checks the user's Pro flag on every request. There is no exception to this.

---

## 8. Monetization

**Current stage:** a single minimal "buy me a coffee"-style link in the footer. Flat copy. No donate button, no paywall, no emotional or guilt-based framing. Guilt copy damages credibility with this audience and converts badly anyway.

**Pro pass, when it launches:** $39/year, annual only, promoted as "$3.25/month, billed annually at $39." The $39 figure must stay visible — never in fine print.

Reasoning behind the decisions:

- **Annual only.** VccLabs is occasional-use reference material, not daily-use entertainment. Monthly plans invite subscribe-use-cancel behaviour and bleed more to gateway fees.
- **Don't announce "free forever."** Keep the Pro architecture in the background. Revisit paid tiers when there is real traffic data — roughly 15 published volts is the threshold to start looking.
- **Students convert poorly on subscriptions.** Freemium conversion runs 1–5% of registered users, and student audiences sit at the low end. Traffic is the binding constraint, not the auth bill; Clerk's free tier covers a large user base.
- **Institutional buyers are the parallel path.** Universities and EVSE/power-electronics teams onboarding engineers offer far higher value per transaction. Worth keeping in view.

> **Open item:** platform choice between Buy Me a Coffee and Ko-fi is unresolved pending payout support validation. Do not commit a URL until that is confirmed.

---

## 9. Internationalization

English ships and gets verified first. Spanish is next. The structure goes in from day one so retrofitting is never needed:

- Path prefixes `/en/` and `/es/`.
- All UI strings live in `_data/`. Nothing user-facing is hardcoded in templates.
- **No text baked into images.** Ever. Diagrams carry labels as markup or SVG text.
- A native-speaking EE student reviews the first 2–3 Spanish volts before scaling. Machine translation mangles domain terminology.

> **Open item:** $39/yr is steep for Latin America. Regional pricing is likely needed before promoting Spanish volts.

**China is a separate venture, not a language folder.** Google is blocked, Baidu requires China hosting plus an ICP license plus local payment rails. None of that is compatible with the Netlify architecture. Do not treat it as a `/zh/` directory.

---

## 10. Local development

```bash
npm install
npm run dev     # eleventy --serve, http://localhost:8080
npm run build   # eleventy, outputs to dist/
```

Working directories vary by machine — the project syncs between a home and a work computer via Google Drive:

- `C:\Users\USER\Gdrive\Projects\Vcc_Labs\Website`
- `C:\Users\anabi\My Drive\Projects\Vcc_Labs\Website`

> **Known risk:** Google Drive sync can corrupt `node_modules`. It is gitignored, so if the build starts behaving strangely, delete `node_modules` and run `npm install` again before debugging anything else.

---

## 11. Roadmap

**Next**

- [ ] Scaffold volt #1 and its paired calculator to prove the `/volts/` and `/tools/` routes end to end
- [ ] Write volt #1 as JSON and extract the schema from it
- [ ] Resolve the support-link platform, then wire the footer URL
- [ ] Build out `/volts/` and `/tools/` index pages

**Later**

- [ ] Clerk integration and the Pro flag
- [ ] Netlify Function for gated content
- [ ] Spanish translation, reviewed by a native-speaking EE student
- [ ] Regional pricing for Latin America
- [ ] Per-slide, per-user annotation layer: freehand drawing, typed notes, saved to account, global show/hide toggle. Deliberately deferred — it is what forces a real database.
