// Draw-on for inline SVG doodles.
//
// The undrawn CSS state is scoped under [data-draw], which is only set here.
// So with JS off — or with reduced motion — doodles render complete rather
// than invisible.
(function () {
  var doodles = document.querySelectorAll(".doodle");
  if (!doodles.length) return;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  document.documentElement.setAttribute("data-draw", "");

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-drawn");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4, rootMargin: "0px 0px -10% 0px" });

  doodles.forEach(function (d) {
    d.querySelectorAll("path, circle, line").forEach(function (shape, i) {
      shape.style.setProperty("--i", i);
    });
    observer.observe(d);
  });
})();
