// The footer colophon types itself out, holds, erases, and starts again —
// a loop rather than a one-shot, with the caret sitting at the edge.
(function () {
  var el = document.querySelector("[data-reveal]");
  if (!el) return;

  var full = el.textContent;
  var line = el.closest(".colophon") || el.parentElement;

  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches ||
      !("IntersectionObserver" in window)) {
    line.classList.add("is-done");
    return;
  }

  var TYPE = 46, ERASE = 26, HOLD_FULL = 2600, HOLD_EMPTY = 700;
  var i = 0, erasing = false, running = false;

  el.textContent = "";

  function tick() {
    if (erasing) {
      el.textContent = full.slice(0, --i);
      if (i <= 0) {
        erasing = false;
        return setTimeout(tick, HOLD_EMPTY);
      }
      return setTimeout(tick, ERASE);
    }

    el.textContent = full.slice(0, ++i);
    if (i >= full.length) {
      erasing = true;
      return setTimeout(tick, HOLD_FULL);
    }
    setTimeout(tick, TYPE);
  }

  // Only run while it's actually on screen — no invisible loop burning frames.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || running) return;
      running = true;
      line.classList.add("is-typing");
      setTimeout(tick, 260);
    });
  }, { threshold: 0.6 });

  io.observe(line);
})();
