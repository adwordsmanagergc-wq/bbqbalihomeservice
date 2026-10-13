/* ============================================================================
 * HOME motion — count-ups, hero parallax, drifting embers, image reveals,
 * seamless marquee. Transform/opacity only. Everything gated by reduced-motion.
 * ========================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Stagger index on grouped reveals --------------------------------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  /* ---- Seamless marquee (duplicate items inside the one track) ---------- */
  var track = document.querySelector(".hx-marq__track");
  if (track && !reduce) {
    Array.prototype.slice.call(track.children).forEach(function (node) {
      var c = node.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      // Keep cloned links out of the tab order so aria-hidden has no focusable descendants.
      if (c.hasAttribute && c.hasAttribute("href")) c.setAttribute("tabindex", "-1");
      Array.prototype.forEach.call(c.querySelectorAll ? c.querySelectorAll("a,button") : [], function (el) {
        el.setAttribute("tabindex", "-1");
      });
      track.appendChild(c);
    });
  }

  /* ---- Count-up stats on view ------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix + target + suffix; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- IntersectionObserver: image reveals + count-ups ------------------ */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.classList.contains("hx-img-reveal")) t.classList.add("is-in");
        if (t.hasAttribute("data-count")) countUp(t);
        io.unobserve(t);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".hx-img-reveal, [data-count]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = (el.getAttribute("data-prefix") || "") + el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  if (reduce) return; // nothing decorative below

  /* ---- Hero pointer parallax (fine pointer only) ------------------------ */
  var frame = document.querySelector(".hx-hero__frame");
  var hero = document.querySelector(".hx-hero");
  if (frame && hero && window.matchMedia("(pointer:fine)").matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      cx = ((e.clientX - r.left) / r.width - 0.5) * 18;
      cy = ((e.clientY - r.top) / r.height - 0.5) * 16;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener("pointerleave", function () { cx = 0; cy = 0; if (!raf) raf = requestAnimationFrame(apply); });
    function apply() {
      tx += (cx - tx) * 0.12; ty += (cy - ty) * 0.12;
      frame.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0)";
      raf = (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) ? requestAnimationFrame(apply) : null;
    }
  }

  /* ---- Magnetic primary CTAs -------------------------------------------- */
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.25;
        var my = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = "translate(" + mx.toFixed(1) + "px," + my.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---- Drifting embers in the hero -------------------------------------- */
  var sparkHost = document.querySelector(".hx-hero");
  if (sparkHost) {
    for (var i = 0; i < 9; i++) spawnEmber(sparkHost, i);
  }
  function spawnEmber(host, i) {
    var s = document.createElement("span");
    s.className = "hx-spark";
    s.style.left = (6 + Math.random() * 60) + "%";
    host.appendChild(s);
    function run() {
      var dur = 4200 + Math.random() * 4200;
      var rise = host.offsetHeight * (0.55 + Math.random() * 0.4);
      var drift = (Math.random() - 0.5) * 90;
      s.animate([
        { transform: "translate(0,0) scale(1)", opacity: 0 },
        { opacity: 0.9, offset: 0.12 },
        { opacity: 0.9, offset: 0.7 },
        { transform: "translate(" + drift + "px,-" + rise + "px) scale(0.3)", opacity: 0 }
      ], { duration: dur, delay: Math.random() * 4000, easing: "cubic-bezier(0.4,0,0.6,1)" })
        .addEventListener("finish", run);
    }
    run();
  }
})();
