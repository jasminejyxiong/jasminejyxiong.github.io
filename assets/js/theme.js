// Lights on / lights off.
//
// With no stored choice the site follows the system. Clicking flips to the
// opposite of whatever is currently showing and makes it sticky. The initial
// read happens in a blocking inline script in <head>; this wires the button.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;

  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function effective() {
    return root.dataset.theme || (media.matches ? "dark" : "light");
  }

  function sync() {
    var dark = effective() === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.title = dark ? "Turn the lights on" : "Turn the lights off";
  }

  btn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
  });

  // Follow the system while no explicit choice has been made.
  media.addEventListener("change", sync);

  sync();
})();
