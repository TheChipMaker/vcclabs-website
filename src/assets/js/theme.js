(function () {
  var root = document.documentElement;

  function label() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      var span = b.querySelector(".theme-toggle-label");
      if (span) span.textContent = dark ? "Light" : "Dark";
      b.setAttribute("aria-pressed", String(dark));
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("vcc-theme", next);
    label();
  });

  label();
})();