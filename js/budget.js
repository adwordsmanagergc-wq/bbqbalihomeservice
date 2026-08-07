/* ============================================================================
 * Budget option page (budget.html)
 * ----------------------------------------------------------------------------
 * Reads the chosen budget tier from ?tier=<id>, asks for guest count + location,
 * shows the price, and books via a pre-filled WhatsApp message to the team.
 * All data comes from window.PRICING.BUDGET (data/pricing.js).
 * ========================================================================== */
(function () {
  "use strict";

  var P = window.PRICING;
  if (!P || !P.BUDGET || !document.getElementById("budget")) return;
  var B = P.BUDGET;

  function idr(n) { return "IDR " + Math.round(n).toLocaleString("id-ID"); }
  function usd(n) { return "$" + Math.round(n / P.FX.idrPerUsd).toLocaleString("en-US"); }
  function param(k) { return new URLSearchParams(window.location.search).get(k); }

  var tier = B.tiers.find(function (t) { return t.id === param("tier"); }) || B.tiers[0];
  var minGuests = tier.minGuests || P.MIN_GUESTS || 6;

  var state = { guests: minGuests, area: P.AREAS[0].id };

  var el = {
    name: document.getElementById("tier-name"),
    blurb: document.getElementById("tier-blurb"),
    badge: document.getElementById("tier-badge"),
    menuNote: document.getElementById("menu-note"),
    guestVal: document.getElementById("guest-val"),
    area: document.getElementById("area-select"),
    priceBody: document.getElementById("price-body"),
    priceIdr: document.getElementById("price-idr"),
    priceUsd: document.getElementById("price-usd"),
    bookBtn: document.getElementById("book-btn"),
    minNote: document.getElementById("min-note"),
  };

  /* ---- Static tier content ---------------------------------------------- */
  el.name.textContent = tier.name;
  el.blurb.textContent = tier.blurb || "";
  el.badge.textContent = tier.enquireOnly
    ? "Please enquire"
    : idr(tier.perPersonIdr) + " / person";
  el.menuNote.textContent = B.menuNote;
  el.minNote.textContent = "Minimum " + minGuests + " guests";

  /* ---- Area dropdown ----------------------------------------------------- */
  el.area.innerHTML = P.AREAS.map(function (a) {
    var suffix = a.deliveryIdr > 0 ? "  (+" + idr(a.deliveryIdr) + ")" : a.confirm ? "" : "  (incl.)";
    return '<option value="' + a.id + '"' + (state.area === a.id ? " selected" : "") + ">" + a.label + suffix + "</option>";
  }).join("");
  el.area.addEventListener("change", function () { state.area = el.area.value; render(); });

  /* ---- Guest counter ----------------------------------------------------- */
  document.getElementById("guest-minus").addEventListener("click", function () {
    state.guests = Math.max(minGuests, state.guests - 1); render();
  });
  document.getElementById("guest-plus").addEventListener("click", function () {
    state.guests = state.guests + 1; render();
  });

  /* ---- Pricing ----------------------------------------------------------- */
  function deliveryFee() {
    var a = P.AREAS.find(function (x) { return x.id === state.area; });
    return a ? a.deliveryIdr : 0;
  }
  function calc() {
    var food = tier.perPersonIdr * state.guests;
    var hire = B.hireIdr;
    var delivery = deliveryFee();
    return { food: food, hire: hire, delivery: delivery, total: food + hire + delivery };
  }

  /* ---- WhatsApp message -------------------------------------------------- */
  function areaLabel() {
    var a = P.AREAS.find(function (x) { return x.id === state.area; });
    return a ? a.label : "";
  }
  function bookMessage() {
    var L = [];
    if (tier.enquireOnly) {
      L.push("Hi BBQ Bali Home Service! 🔥 I'd like to enquire about the " + tier.name + " menu.");
      L.push("");
      L.push("• Menu: " + tier.name + " (" + tier.blurb + ")");
      L.push("• Guests: " + state.guests);
      L.push("• Location: " + areaLabel());
      L.push("");
      L.push("Please send me a quote. Thank you!");
      return L.join("\n");
    }
    var c = calc();
    L.push("Hi BBQ Bali Home Service! 🔥 I'd like to book the " + tier.name + " menu.");
    L.push("");
    L.push("📋 MY BOOKING");
    L.push("• Menu: " + tier.name);
    L.push("• Guests: " + state.guests);
    L.push("• Per person: " + idr(tier.perPersonIdr) + " → " + idr(c.food));
    L.push("• BBQ & Chef hire: " + idr(c.hire));
    L.push("• Location: " + areaLabel() + (c.delivery > 0 ? " (delivery " + idr(c.delivery) + ")" : ""));
    L.push("");
    L.push("💰 ESTIMATED TOTAL: " + idr(c.total) + " (~ " + usd(c.total) + ")");
    L.push("");
    L.push("Please confirm availability and the full menu. Thank you!");
    return L.join("\n");
  }

  /* ---- Render ------------------------------------------------------------ */
  function render() {
    el.guestVal.textContent = state.guests;

    if (tier.enquireOnly) {
      el.priceBody.innerHTML =
        '<div class="review__line"><span>' + tier.name + " × " + state.guests + " guests</span>" +
        '<span class="amt">Quote on request</span></div>' +
        '<div class="review__line"><span>Location — ' + areaLabel() + '</span><span class="amt">—</span></div>';
      el.priceIdr.textContent = "Please enquire";
      el.priceUsd.textContent = "We'll tailor a quote for you";
      el.bookBtn.textContent = "🟢 Enquire with the team";
    } else {
      var c = calc();
      var area = P.AREAS.find(function (a) { return a.id === state.area; });
      el.priceBody.innerHTML =
        '<div class="review__line"><span>' + idr(tier.perPersonIdr) + " × " + state.guests + " guests</span>" +
          '<span class="amt">' + idr(c.food) + "</span></div>" +
        '<div class="review__line"><span>BBQ &amp; Chef hire</span><span class="amt">' + idr(c.hire) + "</span></div>" +
        '<div class="review__line"><span>Delivery — ' + area.label + '</span><span class="amt">' +
          (c.delivery > 0 ? idr(c.delivery) : (area.confirm ? "TBC" : "Incl.")) + "</span></div>";
      el.priceIdr.textContent = idr(c.total);
      el.priceUsd.textContent = "~ " + usd(c.total);
      el.bookBtn.textContent = "🟢 Chat with team to book";
    }

    el.bookBtn.setAttribute("href",
      "https://wa.me/" + P.BUSINESS.whatsappNumber + "?text=" + encodeURIComponent(bookMessage()));
  }

  render();
})();
