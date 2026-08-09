# Handoff

Personal portfolio for Jasmine Xiong. Static HTML/CSS/JS, no build step, no
dependencies. Deploy is `git push`.

---

## The one thing that isn't done

**DNS has never been switched.** The site builds and deploys fine, but
`www.jasminexiong.com` does not resolve yet.

- Domain is registered at **GoDaddy** (renewed through **29 Aug 2027**).
- Its nameservers still point at **Squarespace** (`dns1–4.p07.nsone.net`) from
  an old, now-expired Squarespace site.
- GitHub Pages is live and already redirects `jasminejyxiong.github.io` →
  `www.jasminexiong.com`, so until DNS moves, that redirect lands nowhere.

To finish: in GoDaddy, switch to GoDaddy's default nameservers, wait for
propagation, then add `CNAME www → jasminejyxiong.github.io` plus the four
Pages A records (`185.199.108–111.153`) on `@`. Then tick **Enforce HTTPS** in
the repo's Pages settings.

---

## Where it lives

| | |
|---|---|
| Local | `~/jasminexiong.com` |
| Repo | `jasminejyxiong/jasminejyxiong.github.io` (public) |
| Remote | `git@github-personal:jasminejyxiong/jasminejyxiong.github.io.git` |
| Live | https://jasminejyxiong.github.io (redirects to the custom domain) |

**Two GitHub accounts exist and they are easy to mix up.** `jasminejyxiong`
owns this repo. `jazzymonster` holds an SSO-configured **Lumos work** key.
The `github-personal` SSH host alias needs `IdentitiesOnly yes` in
`~/.ssh/config` — without it, SSH also offers the work key from the agent,
authenticates as `jazzymonster`, and the repo appears not to exist.

## Running it

```bash
cd ~/jasminexiong.com && python3 -m http.server 8765
```

Then open <http://localhost:8765/>. **Not** `file://` — asset paths are
root-absolute and only resolve over HTTP.

**Hard-refresh after CSS changes (Cmd+Shift+R).** The browser caches
`site.css` aggressively; several changes during development looked like they
hadn't applied when they had.

---

## Structure

```
index.html                     hero + work grid
about/                         about, mini manifesto, reading, listening, contact
play/                          placeholder for a game, not built
work/<slug>/                   one directory per case study
404.html
assets/css/site.css            all styling; design tokens at the top
assets/js/                     theme.js, type.js, eyes.js, doodles.js, reveal.js
assets/fonts/                  Playfair Display + Source Serif 4, all SIL OFL
assets/img/                    cheek.png, jx-logo.png, doodle-portrait.svg
assets/face-snippet.html       generated — see "The face" below
tools/                         build-face.py, inject-face.py
```

Case studies, in the order they appear:

1. `agentic-appstore` — agent-driven, visual
2. `employee-lifecycle-mover` — 0→1, domain complexity
3. `condition-builder` — platform systems
4. `integration-sync-observability` — technical
5. `koho-cover` — consumer UI craft

Every page is hand-written HTML with the header and footer **duplicated**, not
injected by JS. That's deliberate: JS injection breaks no-JS and SEO, and it
breaks cross-document view transitions, because the transition snapshot is
taken before injected markup exists. Change one header, change them all —
`grep -rl site-header .`

---

## Conventions that will bite you

- **Trailing slashes on internal links** (`/work/koho-cover/`). Without one,
  Pages 301s, which also interrupts the page transition.
- **Root-absolute asset paths** (`/assets/...`). Safe because this is a user
  site at the domain root.
- **All-lowercase, kebab-case filenames.** macOS is case-insensitive, Pages is
  not — `Hero.PNG` will work locally and 404 in production.
- Don't commit design-tool originals or uncompressed exports; git history is
  permanent.

---

## Type

Two families only. A third was removed deliberately — labels and buttons get
their character from uppercase and letter-spacing instead.

- `--font-display` — **Playfair Display** (400/700): nameplate, headings, case
  study and tile titles, metric figures, wordmark, the hero typing line.
- `--font-body` — **Source Serif 4** (400/italic/600): everything else. This
  stands in for **Ivar Text**, which The Browser Company uses and which is
  commercially licensed, so it can't be self-hosted.
- `--font-sans` — system stack, used only for incidental marks.

### The nameplate is metric-dependent

`index.html` draws JASMINE as SVG `<text>` with `textLength="1000"`. The
font-size is set so the name's *natural* width is already ~1000 units, which
leaves `textLength` nothing to distort. **If the display font changes, this
must be re-measured**, or the letters stretch or squash. Measure in the
browser:

```js
var t = document.querySelector('.nameplate text');
var c = t.cloneNode(true); c.removeAttribute('textLength'); c.removeAttribute('lengthAdjust');
t.parentNode.appendChild(c);
var natural = c.getComputedTextLength(), box = c.getBBox(); c.remove();
// new font-size    = current * 1000 / natural
// caps above baseline = (baselineY - box.y) * (1000 / natural)
// descender below     = (box.y + box.height - baselineY) * (1000 / natural)
```

Then set `viewBox="0 0 1000 H"`, the baseline `y`, and update
`.hero { min-height: calc(100svh - 8rem + Xvw) }` — that `Xvw` is what pushes
the bottom quarter of the name past the fold so scrolling reveals the rest.
It's derived from the nameplate's aspect ratio; get it wrong and the name is
either fully visible or guillotined.

---

## The face

Source artwork lives in **`~/Desktop/Face`** (outside the repo): `Left-eye`,
`Right-eye`, `Left-close`, `right-close`, `nose`, `smile`, `bubble-full`,
`bubble-pop` as SVG, plus `cheek2.png` and `jxlogo.png`.

```bash
python3 tools/build-face.py && python3 tools/inject-face.py
```

`build-face.py` reads those exports, rounds their auto-traced coordinates to
2dp (they ship with 6+, which cost ~25% of the file size), assembles one SVG,
and writes `assets/face-snippet.html`. `inject-face.py` then replaces the
`<svg class="face">` block in `index.html`, `404.html` and `play/index.html`.

Things that are load-bearing:

- **`Right-eye.svg` exports its sclera path twice, `Left-eye.svg` once.**
  Repeated layers are collapsed before unpacking, or the two eyes end up with
  mismatched roles.
- **Blinking is a cel swap, not a transform.** The open eye and its lash line
  cross-fade out while Jasmine's drawn closed curve fades in. Squashing the
  open eye looked rubbery; real lids change shape.
- **The closed eyes are on a 92×33 canvas, the open eyes on 98×53**, so the
  closed curve is positioned by offset (`CLOSE_X`, `CLOSE_Y`), not assumed to
  align.
- **The snore bubble anchors via nesting, not `transform-origin`.** Each
  scaled group sits at local `(0,0)` with the artwork offset behind it, so it
  grows out of the nostril. `transform-box: fill-box` did not hold on a `<g>`
  and the bubble scaled from its own corner instead.
- **Cheeks are a PNG** because the SVG exports were 167 KB each — the pencil
  texture had been traced into tens of thousands of points.
- Eye whites use their own `--eye-white` token. They used to use `--paper`,
  which meant they picked up whatever tint the palette had.

### Dark mode = asleep

Lights off puts the face to sleep: eyes stay shut, blinking stops, and the
snore bubble inflates from the nostril and pops on a loop. Driven by
`:root[data-theme="dark"]` plus a `prefers-color-scheme` fallback for when no
explicit choice has been stored.

---

## Other moving parts

- **`type.js`** — the rotating hero line. Phrases live in the `data-type`
  attribute on `index.html` as a JSON array. The animated span is
  `aria-hidden` with a visually-hidden static sentence beside it, so screen
  readers get one phrase rather than every keystroke.
- **`reveal.js`** — the footer colophon types, holds, erases, and loops. Only
  starts when scrolled into view.
- **`eyes.js`** — pupils track the cursor. Skipped on coarse pointers and
  under reduced motion. Travel distance comes from `data-travel` in the
  markup, not hard-coded, because the face and the small face differ.
- **`theme.js`** — one bulb button. A pointer click drops focus so the ring
  doesn't linger; keyboard activation keeps it.
- **View transitions** — cross-document, pure CSS. The wordmark holds still
  across navigations, which is what makes the site feel like one document.
  Unsupported browsers degrade to a normal navigation.
- All motion is gated behind `prefers-reduced-motion`, and doodles default to
  their *drawn* state so they never vanish without JS.

---

## Still to do

- **Switch DNS** (above) — the only thing between this and being live.
- **Real content.** Every page is placeholder. `grep -rn "TODO(jasmine)" .`
- **Hero images** for the five case studies; the tiles have a 16:9 slot
  waiting. Export recipe is in `README.md`.
- **Per-project doodles.** All five tiles currently share
  `doodle-portrait.svg` as a placeholder; each is meant to be thematic. They
  live as one `<symbol>` at the bottom of `index.html` and are referenced by
  `<use>` — add siblings and point each tile at its own.
- **The game** at `/play/` — the URL exists, nothing behind it.
- **Contact** on About is LinkedIn + email. Dribbble was considered and
  dropped.

## Two environment quirks worth knowing

- The in-app browser preview reports `document.hidden: true`, which suppresses
  `IntersectionObserver` callbacks. Anything scroll-triggered (the colophon,
  the doodle draw-on) will look broken there but works in a real browser.
- Screenshots of that preview go blank after a scripted scroll. Measure with
  JS instead of trusting a blank capture.
