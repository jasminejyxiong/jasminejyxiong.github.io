// Cursor-following eyes.
//
// Responsive rather than time-based, so it reads as alive without adding the
// drag of a scroll-triggered reveal. Skipped entirely on touch/coarse
// pointers and under reduced motion — the eyes then render open and static.
(function () {
  var eyes = document.querySelectorAll("[data-eye]");
  if (!eyes.length) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  var REACH = 320;    // px at which the catchlight is fully deflected
  var pointer = null;
  var queued = false;

  function render() {
    queued = false;
    if (!pointer) return;

    eyes.forEach(function (eye) {
      var pupil = eye.querySelector("[data-pupil]");
      if (!pupil) return;

      var box = eye.getBoundingClientRect();
      if (!box.width) return;

      var dx = pointer.x - (box.left + box.width / 2);
      var dy = pointer.y - (box.top + box.height / 2);
      // Travel is in SVG user units, so it comes from the markup rather than
      // being hard-coded — the face and the small face use different viewBoxes.
      var max = parseFloat(eye.dataset.travel) || 4.2;
      var dist = Math.hypot(dx, dy) || 1;
      var pull = Math.min(dist / REACH, 1) * max;

      pupil.setAttribute(
        "transform",
        "translate(" + ((dx / dist) * pull).toFixed(2) + " " + ((dy / dist) * pull).toFixed(2) + ")"
      );
    });
  }

  window.addEventListener("pointermove", function (e) {
    pointer = { x: e.clientX, y: e.clientY };
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }, { passive: true });
})();
