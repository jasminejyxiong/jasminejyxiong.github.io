#!/usr/bin/env python3
"""Assemble the exported face parts into one themed, animatable SVG.

Reads the layered exports from ~/Desktop/Face and writes
assets/face-snippet.html. That snippet still has to be injected into the three
pages that show the face — see HANDOFF.md for the command that does it.

    python3 tools/build-face.py
"""
import re, pathlib

SRC = pathlib.Path.home() / "Desktop" / "Face"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "face-snippet.html"

PATH_RE = re.compile(r'<path\b([^>]*?)/>', re.S)
D_RE = re.compile(r'\sd="([^"]+)"', re.S)
NUM_RE = re.compile(r'-?\d+\.\d{3,}')


def shrink(d):
    """Round coordinates to 2dp — these are auto-traced and carry 6+ decimals."""
    return NUM_RE.sub(lambda m: f"{float(m.group()):.2f}".rstrip('0').rstrip('.'), d)


def paths(name):
    """Layers in export order, with repeats collapsed.

    Right-eye.svg ships its sclera twice; left doesn't. Without collapsing,
    the two eyes would unpack into different roles and mismatch.
    """
    svg = (SRC / name).read_text()
    ds = [shrink(D_RE.search(f"<path{a}/>").group(1)) for a in PATH_RE.findall(svg)]
    out = []
    for d in ds:
        if not out or out[-1] != d:
            out.append(d)
    return out


left = paths("Left-eye.svg")
right = paths("Right-eye.svg")
nose = paths("nose.svg")
smile = paths("smile.svg")
closed = {"l": paths("Left-close.svg")[0], "r": paths("right-close.svg")[0]}
bubble_full = paths("bubble-full.svg")[0]   # 41x24
bubble_pop = paths("bubble-pop.svg")[0]     # 36x36

CLOSE_X, CLOSE_Y = 3, 11   # centres the 92x33 lash curve on the 98x53 eye


def eye(p, side, dx, dy):
    """Exported layer order: sclera, iris, lid-shadow, sparkle, sparkle, lid-line.

    The lid line lives outside .fc-open so the blink can hide everything else
    and leave just that curve — a closed eye, rather than a squashed one.
    """
    sclera, iris, shade, sp1, sp2, lid = p
    cid = f"clip-{side}"
    return f'''    <g class="fc-eye" data-eye data-travel="7" transform="translate({dx} {dy})">
      <clipPath id="{cid}"><path d="{sclera}"/></clipPath>
      <g class="fc-open">
        <path class="fc-white" d="{sclera}"/>
        <g clip-path="url(#{cid})">
          <g data-pupil>
            <path class="fc-iris" d="{iris}"/>
            <path class="fc-spark" d="{sp1}"/>
            <path class="fc-spark" d="{sp2}"/>
          </g>
        </g>
        <path class="fc-shade" d="{shade}"/>
      </g>
      <path class="fc-lid" d="{lid}"/>
      <g class="fc-closed" transform="translate({CLOSE_X} {CLOSE_Y})">
        <path d="{closed[side]}"/>
      </g>
    </g>'''


def cheek(cx, cy, w, flip=False):
    """Jasmine's drawn cheek, placed as an image.

    Her SVG exports are 167KB each because the texture was traced; the PNG is
    6KB and keeps the real pencil character. It can't recolour with the theme,
    which is fine for a blush mark.
    """
    h = w * 427 / 477                    # native 477x427
    x, y = cx - w / 2, cy - h / 2
    t = f' transform="translate({2 * cx:.0f} 0) scale(-1 1)"' if flip else ""
    return (f'<image class="fc-cheek" href="/assets/img/cheek.png" '
            f'x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}"{t}/>')


# Layout — features pulled in tight, per Jasmine's reference. Eyes are 98x51.
EYE_Y, GAP = 6, 46
LX = 30
RX = LX + 98 + GAP
W = RX + 98 + LX
CENTRE = W / 2

parts = [
    f'<svg class="face" viewBox="0 0 {W} 104" aria-hidden="true" focusable="false">',
    '  <g class="fc-cheeks">',
    '    ' + cheek(26, 72, 50),
    '    ' + cheek(W - 26, 72, 50, flip=True),
    '  </g>',
    '  <g class="fc-blink">',
    eye(left, "l", LX, EYE_Y),
    eye(right, "r", RX, EYE_Y),
    '  </g>',
    f'  <g transform="translate({CENTRE - 4:.0f} 38)"><path class="fc-line" d="{nose[0]}"/></g>',
    f'  <g class="fc-smile" transform="translate({CENTRE - 10:.0f} 72)"><path class="fc-line" d="{smile[0]}"/></g>',
    # Sleeping cue — shown only while the lights are off.
    #
    # Each scaled group sits at local (0,0) with the artwork offset behind it,
    # so scaling grows it out of that anchor. Relying on transform-origin with
    # fill-box did not hold on a <g>, and the bubble shrank to its own corner
    # instead of into the nostril.
    '  <g class="fc-snore">',
    f'    <g transform="translate({CENTRE - 6:.0f} 62)">',
    f'      <g class="fc-bubble"><g transform="translate(-41 -12)"><path d="{bubble_full}"/></g></g>',
    '    </g>',
    f'    <g transform="translate({CENTRE - 27:.0f} 62)">',
    f'      <g class="fc-pop"><g transform="translate(-18 -18)"><path d="{bubble_pop}"/></g></g>',
    '    </g>',
    '  </g>',
    '</svg>',
]

OUT.write_text("\n".join(parts) + "\n")
print(f"wrote {OUT}  ({OUT.stat().st_size/1024:.1f} KB)  viewBox 0 0 {W} 104")
