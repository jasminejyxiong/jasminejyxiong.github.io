// The typing line: types a phrase, pauses, deletes it, types the next.
//
// The animated span is aria-hidden and shadowed by a visually-hidden static
// sentence, so screen readers get one clean phrase instead of every keystroke.
// With reduced motion (or no JS) the first phrase simply stays put.
(function () {
  var el = document.querySelector("[data-type]");
  if (!el) return;

  var words;
  try { words = JSON.parse(el.dataset.type); } catch (e) { return; }
  if (!words || !words.length) return;

  el.textContent = words[0];
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  var HOLD = 2100, GAP = 420, TYPE = 62, ERASE = 34;
  var i = 0, pos = words[0].length, erasing = true;

  function tick() {
    var word = words[i];

    if (erasing) {
      pos--;
      if (pos <= 0) {
        pos = 0;
        erasing = false;
        i = (i + 1) % words.length;
        el.textContent = "";
        return setTimeout(tick, GAP);
      }
    } else {
      pos++;
      if (pos >= word.length) {
        el.textContent = word;
        erasing = true;
        return setTimeout(tick, HOLD);
      }
    }

    el.textContent = word.slice(0, pos);
    setTimeout(tick, erasing ? ERASE : TYPE);
  }

  setTimeout(tick, HOLD);
})();
