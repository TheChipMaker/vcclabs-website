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

  var W = 1280, H = 720, PAD = 56, NAV = 96, i = 0;

  function fit() {
    var navSpace = document.fullscreenElement ? 0 : NAV;
    var s = Math.min((innerWidth - PAD) / W, (innerHeight - PAD - navSpace) / H);
    frame.style.transform = "translate(-50%,-50%) translateY(" + (-navSpace / 2 / s) + "px) scale(" + s + ")";
  }

  /* A slide's surface is dark either when the site theme is dark and the
     slide is normal, or the theme is light and the slide is inverted. */
  function markSurfaces() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    var all = document.querySelectorAll(".slide");
    Array.prototype.forEach.call(all, function (s) {
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

  var THUMB_W = 260, thumbsBuilt = false;

  function buildThumbs() {
    if (thumbsBuilt) return;
    var scale = THUMB_W / W;

    slides.forEach(function (s, k) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";

      var holder = document.createElement("div");
      holder.className = "thumb-holder";
      holder.style.height = (H * scale) + "px";

      var mini = s.cloneNode(true);
      mini.removeAttribute("id");
      mini.removeAttribute("data-slide");
      mini.classList.add("is-active");
      mini.style.transform = "scale(" + scale + ")";

      /* don't spawn a second copy of every widget iframe */
      mini.querySelectorAll("iframe").forEach(function (f) {
        var ph = document.createElement("div");
        ph.className = "thumb-widget";
        ph.textContent = "interactive";
        f.parentNode.replaceChild(ph, f);
      });
      mini.querySelectorAll("[data-theme-toggle]").forEach(function (t) {
        t.removeAttribute("data-theme-toggle");
      });

      holder.appendChild(mini);

      var cap = document.createElement("span");
      cap.className = "thumb-cap";
      cap.innerHTML = '<span class="n">' + String(k + 1).padStart(2, "0") + "</span>" +
        (s.dataset.title || "Slide " + (k + 1));

      b.appendChild(holder);
      b.appendChild(cap);
      b.addEventListener("click", function () {
        panel.classList.remove("is-open");
        show(k, true);
      });
      li.appendChild(b);
      list.appendChild(li);
    });

    thumbsBuilt = true;
    markSurfaces();
  }

  prev.addEventListener("click", function () { show(i - 1, true); });
  next.addEventListener("click", function () { show(i + 1, true); });
  openBtn.addEventListener("click", function () { buildThumbs(); panel.classList.add("is-open"); });
  closeBtn.addEventListener("click", function () { panel.classList.remove("is-open"); });

  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "Escape") { panel.classList.remove("is-open"); return; }
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); show(i + 1, true); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(i - 1, true); }
    if (e.key === "Home") { e.preventDefault(); show(0, true); }
    if (e.key === "End") { e.preventDefault(); show(slides.length - 1, true); }
    if (e.key === "o" || e.key === "O") { buildThumbs(); panel.classList.toggle("is-open"); }
    if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFullscreen(); }
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

  var fsBtn = document.querySelector("[data-volt-fullscreen]");
  var toast = document.querySelector("[data-volt-toast]");
  var bar = document.querySelector("[data-volt-bar]");
  var toastTimer = null, wakeTimer = null;

  function showToast(html, ms) {
    toast.innerHTML = html;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, ms || 2600);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else shell.requestFullscreen().catch(function () {
      showToast("Full screen was blocked by the browser");
    });
  }

  fsBtn.addEventListener("click", toggleFullscreen);

  document.addEventListener("fullscreenchange", function () {
    var on = !!document.fullscreenElement;
    fsBtn.textContent = on ? "Exit full screen" : "Full screen";
    if (on) showToast("Press <kbd>Esc</kbd> to exit full screen");
    bar.classList.remove("is-woken");
    fit();
  });

  /* in fullscreen the nav is hidden until the mouse moves */
  document.addEventListener("mousemove", function () {
    if (!document.fullscreenElement) return;
    bar.classList.add("is-woken");
    clearTimeout(wakeTimer);
    wakeTimer = setTimeout(function () { bar.classList.remove("is-woken"); }, 2000);
  });

  addEventListener("resize", fit);
  addEventListener("hashchange", function () { show(hashIndex(), false); });

  new MutationObserver(markSurfaces).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"]
  });

  fit();
  markSurfaces();
  show(hashIndex(), false);
})();
