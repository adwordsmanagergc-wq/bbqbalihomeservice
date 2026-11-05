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

  /* ---- Vercel Analytics custom events ----------------------------------- */
  // Vercel Web Analytics tracks page views automatically; conversion actions
  // (WhatsApp, phone, email, start-a-booking) must be sent as custom events.
  // One delegated listener covers every page and any dynamically wired links.
  function track(name, data) {
    try {
      if (typeof window.va === "function") {
        window.va("event", Object.assign({ name: name }, data || {}));
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("a,button") : null;
    if (!el) return;
    var href = (el.getAttribute && el.getAttribute("href")) || "";
    var page = location.pathname || "/";
    var label = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);

    var where = el.closest(".wa-float") ? "float"
      : el.closest(".site-header, .nav") ? "nav"
      : el.closest(".hx-hero") ? "hero"
      : el.closest("footer, .site-footer") ? "footer"
      : el.closest(".hx-cta, .cta-band, .cta-strip") ? "cta"
      : "body";

    var isWa = (el.matches && el.matches("[data-wa], .btn--wa, .wa-float"))
      || /wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href);

    if (isWa) {
      track("WhatsApp Click", { page: page, location: where, label: label });
    } else if (href.indexOf("tel:") === 0) {
      track("Phone Click", { page: page, location: where });
    } else if (href.indexOf("mailto:") === 0) {
      track("Email Click", { page: page, location: where });
    } else if (/budget\.html/i.test(href)) {
      var tier = (href.match(/tier=([a-z]+)/i) || [])[1] || "";
      track("Budget Start", { page: page, location: where, tier: tier });
    }
  }, true);

  /* ---- Footer year ------------------------------------------------------ */
  // Avoid Date in restricted contexts is fine here (browser runtime).
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
