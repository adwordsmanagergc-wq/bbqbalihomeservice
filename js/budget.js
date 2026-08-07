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
    menuImage: document.getElementById("menu-image"),
    menuList: document.getElementById("menu-list"),
    menuPlaceholder: document.getElementById("menu-placeholder"),
    guestVal: document.getElementById("guest-val"),
    guestFlag: document.getElementById("guest-flag"),
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
  el.minNote.textContent = "Minimum " + minGuests + " guests";

  // Menu: show the saved menu image + item list when available, else a placeholder note.
  if (tier.image) {
    el.menuImage.style.backgroundImage = "url('" + tier.image + "')";
    el.menuImage.style.display = "";
    el.menuImage.setAttribute("aria-label", tier.name + " menu");
  }
  if (tier.menu && tier.menu.length) {
    el.menuList.innerHTML = tier.menu.map(function (m) { return "<li>" + m + "</li>"; }).join("");
    el.menuList.style.display = "";
    el.menuPlaceholder.style.display = "none";
    el.menuNote.textContent = "Everything shown, cooked fresh and served buffet-style. Menu confirmed with you on booking.";
  } else {
    el.menuNote.textContent = B.menuNote;
  }

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
  // Guest-count discount on the hire fee (30+ keeps full price + 2nd BBQ/chef).
  function hireInfo() {
    var rules = B.hireDiscounts || [{ minGuests: 0, discount: 0 }];
    var rule = rules.find(function (r) { return state.guests >= r.minGuests; }) || { discount: 0 };
    var discount = rule.discount || 0;
    var net = Math.round(B.hireIdr * (1 - discount));
    return { discount: discount, net: net, full: B.hireIdr, saving: B.hireIdr - net, note: rule.note || "" };
  }
  function calc() {
    var food = tier.perPersonIdr * state.guests;
    var h = hireInfo();
    var delivery = deliveryFee();
    return {
      food: food, hire: h.net, hireFull: h.full, hireDiscount: h.discount,
      hireSaving: h.saving, hireNote: h.note, delivery: delivery,
      total: food + h.net + delivery,
    };
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
    if (tier.menu && tier.menu.length) L.push("• On the grill: " + tier.menu.join(", "));
    L.push("• Guests: " + state.guests);
    L.push("• Per person: " + idr(tier.perPersonIdr) + " → " + idr(c.food));
    L.push("• BBQ & Chef hire: " + idr(c.hire) +
      (c.hireDiscount > 0 ? " (" + Math.round(c.hireDiscount * 100) + "% off)" : ""));
    if (c.hireNote) L.push("   " + c.hireNote.replace(/&amp;/g, "&"));
    L.push("• Location: " + areaLabel() + (c.delivery > 0 ? " (delivery " + idr(c.delivery) + ")" : ""));
    L.push("");
    L.push("💰 ESTIMATED TOTAL: " + idr(c.total) + " (~ " + usd(c.total) + ")");
    L.push("");
    L.push("Please confirm availability and the full menu. Thank you!");
    return L.join("\n");
  }

  /* ---- Render ------------------------------------------------------------ */
  function renderGuestFlag() {
    if (!el.guestFlag) return;
    var h = hireInfo();
    var bits = [];
    if (h.discount > 0) bits.push('<span class="pill pill--save">🎉 ' + Math.round(h.discount * 100) + "% off BBQ &amp; Chef hire</span>");
    if (h.note) bits.push('<span class="pill">🔥 ' + h.note + "</span>");
    el.guestFlag.innerHTML = bits.join(" ");
  }

  function render() {
    el.guestVal.textContent = state.guests;
    renderGuestFlag();

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
      var hireLabel = "BBQ &amp; Chef hire" +
        (c.hireDiscount > 0 ? ' <span class="pill" style="font-size:.68rem">' + Math.round(c.hireDiscount * 100) + "% off</span>" : "");
      var hireAmt = (c.hireDiscount > 0 ? '<s style="color:var(--muted);font-weight:400">' + idr(c.hireFull) + "</s> " : "") + idr(c.hire);
      var html =
        '<div class="review__line"><span>' + idr(tier.perPersonIdr) + " × " + state.guests + " guests</span>" +
          '<span class="amt">' + idr(c.food) + "</span></div>" +
        '<div class="review__line"><span>' + hireLabel + '</span><span class="amt">' + hireAmt + "</span></div>";
      if (c.hireDiscount > 0)
        html += '<div class="review__line is-save"><span>Group discount saving</span><span class="amt">− ' + idr(c.hireSaving) + "</span></div>";
      if (c.hireNote)
        html += '<div class="review__line is-save"><span>' + c.hireNote + '</span><span class="amt">✓</span></div>';
      html += '<div class="review__line"><span>Delivery — ' + area.label + '</span><span class="amt">' +
        (c.delivery > 0 ? idr(c.delivery) : (area.confirm ? "TBC" : "Incl.")) + "</span></div>";
      el.priceBody.innerHTML = html;
      el.priceIdr.textContent = idr(c.total);
      el.priceUsd.textContent = "~ " + usd(c.total);
      el.bookBtn.textContent = "🟢 Chat with team to book";
    }

    el.bookBtn.setAttribute("href",
      "https://wa.me/" + P.BUSINESS.whatsappNumber + "?text=" + encodeURIComponent(bookMessage()));
  }

  render();
})();
