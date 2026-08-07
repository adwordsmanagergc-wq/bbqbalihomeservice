/* ============================================================================
 * Shared site behaviour: mobile nav, scroll reveal, FAQ accordion, footer year,
 * and WhatsApp link wiring. Progressive enhancement — nothing here is required
 * for the content to be readable.
 * ========================================================================== */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ------------------------------------------------ */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    // Close on link click
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  /* ---- Scroll reveal ---------------------------------------------------- */
  var reveal = document.querySelectorAll(".reveal");
  if (reveal.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- FAQ / accordion -------------------------------------------------- */
  document.querySelectorAll(".acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) {
        panel.style.maxHeight = expanded ? "0px" : panel.scrollHeight + "px";
      }
    });
  });
  // Recalculate open panels on resize
  window.addEventListener("resize", function () {
    document.querySelectorAll('.acc-trigger[aria-expanded="true"]').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
    });
  });

  /* ---- Wire WhatsApp + email links from config -------------------------- */
  var P = window.PRICING;
  if (P && P.BUSINESS) {
    var b = P.BUSINESS;
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var preset = el.getAttribute("data-wa-text") || "";
      var base = "https://wa.me/" + b.whatsappNumber;
      el.setAttribute("href", preset ? base + "?text=" + encodeURIComponent(preset) : base);
    });
    document.querySelectorAll("[data-email]").forEach(function (el) {
      el.setAttribute("href", "mailto:" + b.email);
      if (el.hasAttribute("data-email-text")) el.textContent = b.email;
    });
    document.querySelectorAll("[data-wa-display]").forEach(function (el) { el.textContent = b.whatsappDisplay; });
    document.querySelectorAll("[data-ig]").forEach(function (el) { el.setAttribute("href", b.instagram); });
  }

  /* ---- Footer year ------------------------------------------------------ */
  // Avoid Date in restricted contexts is fine here (browser runtime).
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
