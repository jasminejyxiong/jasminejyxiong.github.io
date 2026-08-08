// Theme toggle: light / dark / auto. The initial read happens in a blocking
// inline script in <head>; this only wires up the buttons.
(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll("[data-theme-set]");
  if (!buttons.length) return;

  function sync() {
    var current = root.dataset.theme || "auto";
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.themeSet === current));
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var value = b.dataset.themeSet;
      if (value === "auto") {
        delete root.dataset.theme;
        try { localStorage.removeItem("theme"); } catch (e) {}
      } else {
        root.dataset.theme = value;
        try { localStorage.setItem("theme", value); } catch (e) {}
      }
      sync();
    });
  });

  sync();
})();
