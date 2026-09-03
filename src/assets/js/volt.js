(function () {
  var root = document.querySelector("[data-volt]");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-slide]"));
  if (!slides.length) return;

  var counter = root.querySelector("[data-volt-counter]");
  var fill = root.querySelector("[data-volt-fill]");
  var prev = root.querySelector("[data-volt-prev]");
  var next = root.querySelector("[data-volt-next]");
  var i = 0;

  function hashIndex() {
    var h = location.hash.replace("#", "");
    if (!h) return 0;
    var found = slides.findIndex(function (s) { return s.id === h; });
    return found < 0 ? 0 : found;
  }

  function show(n, push) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.hidden = k !== i; });
    counter.textContent = (i + 1) + " / " + slides.length;
    fill.style.width = ((i + 1) / slides.length * 100) + "%";
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    if (push) history.replaceState(null, "", "#" + slides[i].id);
    root.scrollIntoView({ block: "start", behavior: "auto" });
  }

  prev.addEventListener("click", function () { show(i - 1, true); });
  next.addEventListener("click", function () { show(i + 1, true); });

  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); show(i + 1, true); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(i - 1, true); }
  });

  var x0 = null, y0 = null;
  root.addEventListener("touchstart", function (e) {
    x0 = e.changedTouches[0].clientX;
    y0 = e.changedTouches[0].clientY;
  }, { passive: true });

  root.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1), true);
    x0 = y0 = null;
  }, { passive: true });

  window.addEventListener("hashchange", function () { show(hashIndex(), false); });

  show(hashIndex(), false);
})();
