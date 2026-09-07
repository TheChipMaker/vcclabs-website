(function () {
  var fig = document.querySelector("[data-hero-wave]");
  if (!fig) return;

  var path = fig.querySelector(".w-sum");
  var slider = fig.querySelector("[data-hw-n]");
  var readout = fig.querySelector("[data-hw-read]");
  var play = fig.querySelector("[data-hw-play]");

  var W = 520, CY = 75, A = 50, PER = 2, SAMPLES = 300;
  var timer = null, mode = "sq";
  var modes = fig.querySelectorAll("[data-hw-mode]");
  var gibbs = fig.querySelectorAll(".w-gibbs");
  var target = fig.querySelector(".w-target");

  /* Verified series (MathWorld):
     square   4/pi   * sum odd n:  sin(n@)/n
     sawtooth 2/pi   * sum all n:  (-1)^(n+1) sin(n@)/n
     triangle 8/pi^2 * sum odd n:  (-1)^((n-1)/2) sin(n@)/n^2   */
  function partial(t, N) {
    var s = 0, n;
    for (n = 1; n <= N; n++) {
      var w = 2 * Math.PI * n * t;
      if (mode === "sq") { if (n % 2) s += Math.sin(w) / n; }
      else if (mode === "saw") { s += Math.pow(-1, n + 1) * Math.sin(w) / n; }
      else if (n % 2) s += Math.pow(-1, (n - 1) / 2) * Math.sin(w) / (n * n); 
    }
    return s * (mode === "sq" ? 4 / Math.PI : mode === "saw" ? 2 / Math.PI : 8 / Math.PI / Math.PI);
  }

  function exact(t) {
    var p = t - Math.floor(t);
    if (mode === "sq") return p < 0.5 ? 1 : -1;
    if (mode === "saw") return 2 * (((t + 0.5) - Math.floor(t + 0.5)) - 0.5);
    return p < 0.25 ? 4 * p : p < 0.75 ? 2 - 4 * p : 4 * p - 4;
  }

  function trace(f) {
    var d = "", i, x;
    for (i = 0; i <= SAMPLES; i++) {
      x = W * i / SAMPLES;
      d += (i ? " L" : "M") + x.toFixed(1) + "," + (CY - A * f(PER * x / W)).toFixed(1);
    }
    return d;
  }

  function draw(n) {
    path.setAttribute("d", trace(function (t) { return partial(t, n); }));
    target.setAttribute("d", trace(exact));
    readout.textContent = "n ≤ " + n;
    var show = mode !== "tri" ? "" : "none";
    gibbs[0].style.display = show;
    gibbs[1].style.display = show;
  }

  function setMode(m) {
    mode = m;
    for (var j = 0; j < modes.length; j++) {
      modes[j].classList.toggle("is-on", modes[j].getAttribute("data-hw-mode") === m);
    }
    draw(+slider.value);
  }

  for (var j = 0; j < modes.length; j++) {
    modes[j].addEventListener("click", function () { setMode(this.getAttribute("data-hw-mode")); });
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    play.textContent = "Play";
    play.setAttribute("aria-pressed", "false");
  }

  function start() {
    var dir = 1;
    play.textContent = "Pause";
    play.setAttribute("aria-pressed", "true");
    timer = setInterval(function () {
      var n = +slider.value + dir;
      if (n >= +slider.max) { n = +slider.max; dir = -1; }
      else if (n <= 1) { n = 1; dir = 1; }
      slider.value = n;
      draw(n);
    }, 380);
  }

  slider.addEventListener("input", function () { stop(); draw(+slider.value); });
  play.addEventListener("click", function () { timer ? stop() : start(); });

  draw(+slider.value);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) start();
})();