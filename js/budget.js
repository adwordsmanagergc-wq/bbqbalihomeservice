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
  function usdWords(n) { return "USD " + Math.round(n / P.FX.idrPerUsd).toLocaleString("en-US"); }
  function param(k) { return new URLSearchParams(window.location.search).get(k); }

  var tier = B.tiers.find(function (t) { return t.id === param("tier"); }) || B.tiers[0];
  var minGuests = tier.minGuests || P.MIN_GUESTS || 6;

  var state = { guests: minGuests, area: P.AREAS[0].id, extras: {} };

  // Optional extras apply to the food packages only (not hire-only or enquire-only).
  var extrasEnabled = !!(B.extras && B.extras.length) && !tier.hireOnly && !tier.enquireOnly;

  var el = {
    name: document.getElementById("tier-name"),
    blurb: document.getElementById("tier-blurb"),
    badge: document.getElementById("tier-badge"),
    menuNote: document.getElementById("menu-note"),
    menuHeading: document.getElementById("menu-heading"),
    menuImage: document.getElementById("menu-image"),
    menuList: document.getElementById("menu-list"),
    menuPlaceholder: document.getElementById("menu-placeholder"),
    guestVal: document.getElementById("guest-val"),
    guestFlag: document.getElementById("guest-flag"),
    area: document.getElementById("area-select"),
    extrasCard: document.getElementById("extras-card"),
    extrasNote: document.getElementById("extras-note"),
    extrasList: document.getElementById("extras-list"),
    priceBody: document.getElementById("price-body"),
    priceIdr: document.getElementById("price-idr"),
    priceUsd: document.getElementById("price-usd"),
    bookBtn: document.getElementById("book-btn"),
    minNote: document.getElementById("min-note"),
  };

  /* ---- Static tier content ---------------------------------------------- */
  el.name.textContent = tier.name;
  el.blurb.textContent = tier.blurb || "";
  el.badge.textContent = tier.enquireOnly ? "Please enquire"
    : tier.hireOnly ? "from " + idr(B.hireIdr) + " + delivery"
    : idr(tier.perPersonIdr) + " / person";
  el.minNote.textContent = "Minimum " + minGuests + " guests";
  if (el.menuHeading) el.menuHeading.textContent = tier.hireOnly ? "What's included" : "What's on the grill";
  var guestSub = document.getElementById("guest-subnote");
  if (guestSub) guestSub.textContent = tier.hireOnly
    ? "More guests unlock a bigger discount on the hire fee."
    : "Pricing is per person.";

  // Menu image (or "includes" image for hire-only)
  if (tier.image) {
    el.menuImage.style.backgroundImage = "url('" + tier.image + "')";
    el.menuImage.style.display = "";
    el.menuImage.setAttribute("aria-label", tier.name);
  }
  // Item list: the grill menu, or the hire-only "includes" list.
  var listItems = tier.hireOnly ? tier.includes : tier.menu;
  if (listItems && listItems.length) {
    el.menuList.innerHTML = listItems.map(function (m) { return "<li>" + m + "</li>"; }).join("");
    el.menuList.style.display = "";
    el.menuPlaceholder.style.display = "none";
    el.menuNote.textContent = tier.hireOnly
      ? "You buy your own groceries — we bring the BBQ, chef and setup to cook them."
      : "Cooked fresh and served buffet-style. Menu confirmed with you on booking.";
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
  // Extras are priced for B.extrasBaseGuests people; +extrasStepPct per extra guest above that.
  function extraMultiplier() {
    var base = B.extrasBaseGuests || 10, step = B.extrasStepPct || 0;
    return 1 + Math.max(0, state.guests - base) * step;
  }
  function extraPrice(ex) { return Math.round(ex.idr * extraMultiplier()); }
  function chosenExtras() {
    return extrasEnabled ? B.extras.filter(function (ex) { return state.extras[ex.id]; }) : [];
  }
  function extrasTotal() {
    return chosenExtras().reduce(function (s, ex) { return s + extraPrice(ex); }, 0);
  }

  function calc() {
    var food = tier.hireOnly ? 0 : tier.perPersonIdr * state.guests;
    var h = hireInfo();
    var delivery = deliveryFee();
    var extras = extrasTotal();
    return {
      food: food, hire: h.net, hireFull: h.full, hireDiscount: h.discount,
      hireSaving: h.saving, hireNote: h.note, delivery: delivery, extras: extras,
      total: food + h.net + delivery + extras,
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
    L.push("Hi BBQ Bali Home Service! 🔥 I'd like to book " +
      (tier.hireOnly ? tier.name + "." : "the " + tier.name + " menu."));
    L.push("");
    L.push("📋 MY BOOKING");
    if (tier.hireOnly) {
      L.push("• " + tier.name);
      if (tier.includes && tier.includes.length) L.push("• Includes: " + tier.includes.join(", ").replace(/&amp;/g, "&"));
      L.push("• Guests: " + state.guests);
    } else {
      L.push("• Menu: " + tier.name);
      if (tier.menu && tier.menu.length) L.push("• On the grill: " + tier.menu.join(", "));
      L.push("• Guests: " + state.guests);
      L.push("• Per person: " + idr(tier.perPersonIdr) + " → " + idr(c.food));
    }
    L.push("• BBQ & Chef hire: " + idr(c.hire) +
      (c.hireDiscount > 0 ? " (" + Math.round(c.hireDiscount * 100) + "% off)" : ""));
    if (c.hireNote) L.push("   " + c.hireNote.replace(/&amp;/g, "&"));
    var ex = chosenExtras();
    if (ex.length) {
      L.push("");
      L.push("➕ EXTRAS (for " + state.guests + " guests)");
      ex.forEach(function (e) { L.push("• " + e.name + " — " + idr(extraPrice(e))); });
    }
    L.push("");
    L.push("• Location: " + areaLabel() + (c.delivery > 0 ? " (delivery " + idr(c.delivery) + ")" : ""));
    L.push("");
    L.push("💰 ESTIMATED TOTAL: " + idr(c.total));
    L.push("   USD alternative price: approx. " + usdWords(c.total));
    L.push("");
    L.push("Please confirm availability" + (tier.hireOnly ? "" : " and the full menu") + ". Thank you!");
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

  function renderExtras() {
    if (!el.extrasCard) return;
    if (!extrasEnabled) { el.extrasCard.style.display = "none"; return; }
    el.extrasNote.textContent = B.extrasNote + (state.guests > (B.extrasBaseGuests || 10)
      ? "  (prices below are for " + state.guests + " guests)" : "");
    el.extrasList.innerHTML = B.extras.map(function (ex) {
      var on = !!state.extras[ex.id];
      return '<div class="extra-row' + (on ? " is-on" : "") + '"><div class="extra-row__info"><h4>' + ex.name + "</h4>" +
        '<p>' + idr(extraPrice(ex)) + "</p></div>" +
        '<button type="button" class="add-btn' + (on ? " is-added" : "") + '" data-extra="' + ex.id + '" aria-pressed="' +
        (on ? "true" : "false") + '">' + (on ? "✓ Added" : "+ Add") + "</button></div>";
    }).join("");
    el.extrasList.querySelectorAll("button[data-extra]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-extra");
        state.extras[id] = !state.extras[id];
        render();
      });
    });
  }

  function render() {
    el.guestVal.textContent = state.guests;
    renderGuestFlag();
    renderExtras();

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
      var html = tier.hireOnly ? "" :
        '<div class="review__line"><span>' + idr(tier.perPersonIdr) + " × " + state.guests + " guests</span>" +
          '<span class="amt">' + idr(c.food) + "</span></div>";
      html += '<div class="review__line"><span>' + hireLabel + '</span><span class="amt">' + hireAmt + "</span></div>";
      if (c.hireDiscount > 0)
        html += '<div class="review__line is-save"><span>Group discount saving</span><span class="amt">− ' + idr(c.hireSaving) + "</span></div>";
      if (c.hireNote)
        html += '<div class="review__line is-save"><span>' + c.hireNote + '</span><span class="amt">✓</span></div>';
      chosenExtras().forEach(function (ex) {
        html += '<div class="review__line"><span>+ ' + ex.name + '</span><span class="amt">' + idr(extraPrice(ex)) + "</span></div>";
      });
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
