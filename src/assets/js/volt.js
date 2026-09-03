(function () {
  var shell = document.querySelector("[data-volt]");
  if (!shell) return;

  var frame = shell.querySelector("[data-volt-frame]");
  var slides = Array.prototype.slice.call(shell.querySelectorAll("[data-slide]"));
  if (!slides.length) return;

  var counter = document.querySelector("[data-volt-counter]");
  var prev = document.querySelector("[data-volt-prev]");
  var next = document.querySelector("[data-volt-next]");
  var panel = document.querySelector("[data-volt-index-panel]");
  var list = document.querySelector("[data-volt-index-list]");
  var openBtn = document.querySelector("[data-volt-index]");
  var closeBtn = document.querySelector("[data-volt-index-close]");

  var W = 1280, H = 720, PAD = 56, i = 0;

  function fit() {
    var s = Math.min((innerWidth - PAD) / W, (innerHeight - PAD * 2) / H);
    frame.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  }

  /* A slide's surface is dark either when the site theme is dark and the
     slide is normal, or the theme is light and the slide is inverted. */
  function markSurfaces() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    slides.forEach(function (s) {
      var inv = s.classList.contains("invert");
      s.classList.toggle("on-dark", dark ? !inv : inv);
    });
  }

  function show(n, push) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
    counter.textContent = (i + 1) + " / " + slides.length;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    if (list) {
      Array.prototype.forEach.call(list.children, function (li, k) {
        li.classList.toggle("is-current", k === i);
      });
    }
    if (push) history.replaceState(null, "", "#" + slides[i].id);
  }

  function hashIndex() {
    var h = location.hash.replace("#", "");
    if (!h) return 0;
    for (var k = 0; k < slides.length; k++) if (slides[k].id === h) return k;
    return 0;
  }

  slides.forEach(function (s, k) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<span class="n">' + String(k + 1).padStart(2, "0") + "</span><span>" +
      (s.dataset.title || "Slide " + (k + 1)) + "</span>";
    b.addEventListener("click", function () {
      panel.classList.remove("is-open");
      show(k, true);
    });
    li.appendChild(b);
    list.appendChild(li);
  });

  prev.addEventListener("click", function () { show(i - 1, true); });
  next.addEventListener("click", function () { show(i + 1, true); });
  openBtn.addEventListener("click", function () { panel.classList.add("is-open"); });
  closeBtn.addEventListener("click", function () { panel.classList.remove("is-open"); });

  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "Escape") { panel.classList.remove("is-open"); return; }
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); show(i + 1, true); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(i - 1, true); }
    if (e.key === "Home") { e.preventDefault(); show(0, true); }
    if (e.key === "End") { e.preventDefault(); show(slides.length - 1, true); }
    if (e.key === "o" || e.key === "O") panel.classList.toggle("is-open");
  });

  var x0 = null, y0 = null;
  shell.addEventListener("touchstart", function (e) {
    x0 = e.changedTouches[0].clientX;
    y0 = e.changedTouches[0].clientY;
  }, { passive: true });

  shell.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) show(i + (dx < 0 ? 1 : -1), true);
    x0 = y0 = null;
  }, { passive: true });

  addEventListener("resize", fit);
  addEventListener("hashchange", function () { show(hashIndex(), false); });

  new MutationObserver(markSurfaces).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"]
  });

  fit();
  markSurfaces();
  show(hashIndex(), false);
})();
