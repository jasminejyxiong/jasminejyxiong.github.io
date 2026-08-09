// The snore bubble: inflates while the lights are off, then waits to be
// popped. Click it and it bursts immediately; ignore it and it pops on its
// own, so a full bubble parked on the face never reads as stuck.
(function () {
  var snore = document.querySelector(".fc-snore");
  if (!snore) return;

  var INFLATE = 3200;   // matches the scale transition in CSS
  var PATIENCE = 5200;  // how long a full bubble waits for a click
  var BURST = 300;      // matches the pop animation
  var REST = 1100;

  var motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)");
  var dark = window.matchMedia("(prefers-color-scheme: dark)");
  var timer = null;

  function isDark() {
    var chosen = document.documentElement.dataset.theme;
    return chosen ? chosen === "dark" : dark.matches;
  }

  function setState(name) {
    snore.classList.remove("is-inflating", "is-full", "is-popping");
    if (name) snore.classList.add(name);
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
    setState(null);
  }

  function pop() {
    if (!snore.classList.contains("is-full")) return;
    clearTimeout(timer);
    setState("is-popping");
    timer = setTimeout(cycle, BURST + REST);
  }

  function cycle() {
    if (!isDark() || !motionOK.matches) return stop();

    setState("is-inflating");
    timer = setTimeout(function () {
      setState("is-full");
      // Unclicked bubbles still pop, just later.
      timer = setTimeout(function () {
        setState("is-popping");
        timer = setTimeout(cycle, BURST + REST);
      }, PATIENCE);
    }, INFLATE);
  }

  snore.addEventListener("click", pop);

  function sync() {
    if (isDark() && motionOK.matches) {
      if (!timer && !snore.classList.contains("is-inflating")) cycle();
    } else {
      stop();
    }
  }

  // The bulb writes data-theme, so watch the attribute as well as the system.
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"],
  });
  dark.addEventListener("change", sync);

  sync();
})();
