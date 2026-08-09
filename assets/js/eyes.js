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

  // Horizontal and vertical are handled separately: an eye is far wider than
  // it is tall, so a single circular clamp made the pupils barely move
  // sideways. Reach is how far the cursor travels before the pupil is at its
  // limit — shorter across, so looking left or right pins fully to that side.
  var REACH_X = 420, REACH_Y = 300;

  // The whole face drifts a little too, so it reads as the head turning
  // rather than eyeballs rolling in a fixed mask. Kept far smaller than the
  // pupil travel, and it lags slightly (see the transition on .face), which
  // is what sells it.
  var FACE_X = 5, FACE_Y = 2.5;

  var faces = document.querySelectorAll(".face");
  var pointer = null;
  var queued = false;

  // Ease toward the extremes: most of the travel happens early, so a small
  // sideways move already reads as a proper glance.
  function curve(n) {
    var clamped = Math.max(-1, Math.min(1, n));
    return Math.sign(clamped) * Math.pow(Math.abs(clamped), 0.62);
  }

  function render() {
    queued = false;
    if (!pointer) return;

    eyes.forEach(function (eye) {
      var pupil = eye.querySelector("[data-pupil]");
      if (!pupil) return;

      var box = eye.getBoundingClientRect();
      if (!box.width) return;

      // Travel is in SVG user units and comes from the markup, since the face
      // and the small face use different viewBoxes.
      var maxX = parseFloat(eye.dataset.travelX) || parseFloat(eye.dataset.travel) || 7;
      var maxY = parseFloat(eye.dataset.travelY) || parseFloat(eye.dataset.travel) || 7;

      var dx = curve((pointer.x - (box.left + box.width / 2)) / REACH_X) * maxX;
      var dy = curve((pointer.y - (box.top + box.height / 2)) / REACH_Y) * maxY;

      pupil.setAttribute("transform", "translate(" + dx.toFixed(2) + " " + dy.toFixed(2) + ")");
    });

    faces.forEach(function (face) {
      var box = face.getBoundingClientRect();
      if (!box.width || !face.viewBox || !face.viewBox.baseVal.width) return;

      // Shift is authored in SVG units, so convert to px at the rendered size.
      var unit = box.width / face.viewBox.baseVal.width;
      var nx = curve((pointer.x - (box.left + box.width / 2)) / REACH_X);
      var ny = curve((pointer.y - (box.top + box.height / 2)) / REACH_Y);

      face.style.translate =
        (nx * FACE_X * unit).toFixed(2) + "px " + (ny * FACE_Y * unit).toFixed(2) + "px";
    });
  }

  window.addEventListener("pointermove", function (e) {
    pointer = { x: e.clientX, y: e.clientY };
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }, { passive: true });
})();
