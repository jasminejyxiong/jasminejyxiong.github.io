#!/usr/bin/env python3
"""Inject assets/face-snippet.html into every page that shows the face.

The header, footer and face are duplicated into each page rather than injected
by JavaScript at runtime — that keeps the markup real for search engines and
no-JS, and it's required for the cross-document view transitions to snapshot
correctly. The cost is that changing the face means rewriting several files,
which is what this script is for.

    python3 tools/build-face.py && python3 tools/inject-face.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNIPPET = (ROOT / "assets" / "face-snippet.html").read_text().strip()

# (path, class on the <svg>, indent)
TARGETS = [
    ("index.html", 'class="face"', 4),
    ("404.html", 'class="face face--sm"', 8),
    ("play/index.html", 'class="face face--sm"', 8),
]


def indent(text, n):
    return "\n".join(" " * n + line for line in text.splitlines()).lstrip()


for rel, cls, pad in TARGETS:
    path = ROOT / rel
    html = path.read_text()
    body = SNIPPET.replace('class="face"', cls, 1)
    html, count = re.subn(r'<svg class="face[^"]*".*?</svg>', indent(body, pad), html, flags=re.S)
    if count != 1:
        raise SystemExit(f"{rel}: expected exactly one face, replaced {count}")
    path.write_text(html)
    print(f"{rel}: ok")
