// Types the footer colophon out when it scrolls into view, with a caret at the
// edge — the same idea as the hero line, but it runs once.
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

  el.textContent = "";
  var i = 0;

  function tick() {
    el.textContent = full.slice(0, ++i);
    if (i < full.length) return setTimeout(tick, 34);
    line.classList.remove("is-typing");
    line.classList.add("is-done");
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      line.classList.add("is-typing");
      setTimeout(tick, 220);
    });
  }, { threshold: 0.9 });

  io.observe(line);
})();
