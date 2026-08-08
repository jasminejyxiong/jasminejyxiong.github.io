# jasminexiong.com

Personal site. Static HTML and CSS, no build step. Deploy is `git push`.

Served by GitHub Pages from `main` at the repo root, via the `CNAME` file.

## Preview locally

```bash
python3 -m http.server 4000
```

Then open <http://localhost:4000/>.

**Do not open the files with `file://`.** Asset paths are root-absolute
(`/assets/css/site.css`), so they only resolve over HTTP. A local server also
reproduces the directory-URL behaviour that GitHub Pages uses.

## Conventions

- **Trailing slashes on internal links** — `/work/koho-save/`, never
  `/work/koho-save`. Without the slash, Pages issues a redirect that also
  interrupts the page transition.
- **Filenames all lowercase, kebab-case.** macOS is case-insensitive and
  GitHub Pages is not, so `Hero.PNG` will work locally and 404 in production.
- **The header and footer are duplicated** in every page rather than injected
  by JavaScript (which would break the view transitions). If you change one,
  change all — `grep -rl site-header .`
- `/work/lumos-lifecycle/index.html` is the canonical case study. Copy it to
  start a new one.

## Adding images to a case study

Images live inside the case study folder, so each one is self-contained.

Export at 2× from Figma, then:

```bash
cwebp -q 82 -resize 1600 0 in.png -o work/<slug>/img/03-flow-1600.webp
cwebp -q 82 -resize 800 0 in.png -o work/<slug>/img/03-flow-800.webp
```

No `cwebp`? [squoosh.app](https://squoosh.app) does the same thing in a browser.

Then replace the `<div class="sheet sheet--empty">` placeholder with:

```html
<img src="/work/<slug>/img/03-flow-1600.webp"
     srcset="/work/<slug>/img/03-flow-800.webp 800w,
             /work/<slug>/img/03-flow-1600.webp 1600w"
     sizes="(min-width: 900px) 860px, 92vw"
     width="1600" height="1000" loading="lazy" decoding="async"
     alt="Describe what the screen shows, not that it is a screenshot.">
```

Keep `width`/`height` — they prevent layout shift. Drop `loading="lazy"` on the
hero image and add `fetchpriority="high"` instead.

For motion, use a muted looping MP4, never a GIF:

```html
<video autoplay muted loop playsinline preload="metadata" poster="…"></video>
```

**Don't commit Figma files or full-size exports.** Git history is permanent.

## Where things are

| Path | What |
|---|---|
| `assets/css/site.css` | All styling. Tokens at the top. |
| `assets/js/theme.js` | Light/dark/auto toggle |
| `assets/js/doodles.js` | Draw-on animation for inline SVG |
| `assets/js/eyes.js` | Cursor-following eyes |
| `assets/fonts/` | iA Writer Quattro + Mono, SIL OFL 1.1 |

Search for `TODO(jasmine)` to find the copy still waiting to be written.
