// Theme toggle: light / dark.
//
// With no stored choice the site follows the system, and the toggle shows
// whichever theme is currently in effect. Clicking either button makes that
// choice explicit and sticky. The initial read happens in a blocking inline
// script in <head>; this only wires up the buttons.
(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll("[data-theme-set]");
  if (!buttons.length) return;

  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function effective() {
    return root.dataset.theme || (media.matches ? "dark" : "light");
  }

  function sync() {
    var current = effective();
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.themeSet === current));
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      root.dataset.theme = b.dataset.themeSet;
      try { localStorage.setItem("theme", b.dataset.themeSet); } catch (e) {}
      sync();
    });
  });

  // Keep the indicator honest if the system flips while we're following it.
  media.addEventListener("change", sync);

  sync();
})();
