/**
 * Remember / restore #app-sidebar scroll across page navigations.
 */
(function () {
  var KEY = "admin-sidebar-scroll";
  var sidebar = document.getElementById("app-sidebar");
  if (!sidebar) return;

  function save() {
    try {
      sessionStorage.setItem(KEY, String(sidebar.scrollTop));
    } catch (e) {}
  }

  function restore() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (raw == null) return;
      var y = parseInt(raw, 10);
      if (isNaN(y)) return;
      sidebar.scrollTop = y;
    } catch (e) {}
  }

  function ensureActiveVisible() {
    var active = sidebar.querySelector(".nav-item.nav-active");
    if (!active) return;
    var sRect = sidebar.getBoundingClientRect();
    var aRect = active.getBoundingClientRect();
    if (aRect.top < sRect.top || aRect.bottom > sRect.bottom) {
      active.scrollIntoView({ block: "nearest", inline: "nearest" });
      save();
    }
  }

  restore();
  // Layout / icons may shift height; re-apply once after paint
  requestAnimationFrame(function () {
    restore();
    ensureActiveVisible();
  });

  var ticking = false;
  sidebar.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        save();
        ticking = false;
      });
    },
    { passive: true }
  );

  sidebar.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link || !sidebar.contains(link)) return;
    save();
  });

  window.addEventListener("pagehide", save);
})();
