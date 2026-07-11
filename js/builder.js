/* ============================================================================
 * Interactive Menu & Price Builder
 * ----------------------------------------------------------------------------
 * Reads everything from window.PRICING (data/pricing.js). No prices are
 * hard-coded here — to change pricing, edit data/pricing.js only.
 * ========================================================================== */
(function () {
  "use strict";

  var P = window.PRICING;
  if (!P || !document.getElementById("builder")) return;

  /* ---- State ------------------------------------------------------------ */
  var state = {
    step: 1,
    mode: "preset",              // "preset" | "custom"
    pkg: null,                    // package id
    proteins: [],                 // custom protein ids
    sides: defaults(P.SIDES),     // custom side ids
    sauces: defaults(P.SAUCES),   // custom sauce ids
    guests: P.MIN_GUESTS,
    extras: {},                   // id -> qty (perPerson) or 1/0 (flat)
    area: P.AREAS[0].id,
  };
  var TOTAL_STEPS = 5;

  function defaults(list) { return list.filter(function (x) { return x.default; }).map(function (x) { return x.id; }); }

  /* ---- Money helpers ---------------------------------------------------- */
  function idr(n) { return "IDR " + Math.round(n).toLocaleString("id-ID"); }
  function usd(n) { return "$" + Math.round(n / P.FX.idrPerUsd).toLocaleString("en-US"); }

  function currentTier() {
    var g = state.guests;
    for (var i = 0; i < P.TIERS.length; i++) {
      if (g >= P.TIERS[i].min && g <= P.TIERS[i].max) return P.TIERS[i];
    }
    return P.TIERS[P.TIERS.length - 1];
  }

  /* ---- Pricing calculation --------------------------------------------- */
  function perPerson() {
    var t = currentTier().id;
    if (state.mode === "preset") {
      return state.pkg ? P.PACKAGES[state.pkg].perPerson[t] : 0;
    }
    return state.proteins.reduce(function (sum, id) {
      var pr = P.PROTEINS.find(function (x) { return x.id === id; });
      return sum + (pr ? pr.perPerson[t] : 0);
    }, 0);
  }

  function extraCost(ex) {
    var qty = state.extras[ex.id] || 0;
    if (!qty) return 0;
    if (ex.unit === "flat") return ex.flatIdr;
    return ex.perPersonPrice[currentTier().id] * qty; // perPerson
  }

  function deliveryFee() {
    var a = P.AREAS.find(function (x) { return x.id === state.area; });
    return a ? a.deliveryIdr : 0;
  }

  function calc() {
    var pp = perPerson();
    var food = pp * state.guests;
    var chef = P.FEES.chefBbqHire.idr;
    var delivery = deliveryFee();
    var extrasTotal = P.EXTRAS.reduce(function (s, ex) { return s + extraCost(ex); }, 0);
    return {
      perPerson: pp, food: food, chef: chef, delivery: delivery,
      extras: extrasTotal, total: food + chef + delivery + extrasTotal,
    };
  }

  function hasMenu() {
    return state.mode === "preset" ? !!state.pkg : state.proteins.length > 0;
  }

  /* ---- Selected menu description (for summary + WhatsApp) --------------- */
  function menuName() {
    if (state.mode === "preset" && state.pkg) return P.PACKAGES[state.pkg].name;
    return "Custom build";
  }
  function proteinNames() {
    if (state.mode === "preset" && state.pkg) return P.PACKAGES[state.pkg].proteins.slice();
    return state.proteins.map(function (id) { return name(P.PROTEINS, id); });
  }
  function sideNames() {
    if (state.mode === "preset" && state.pkg) return P.PACKAGES[state.pkg].included.slice();
    return state.sides.map(function (id) { return name(P.SIDES, id); });
  }
  function sauceNames() {
    if (state.mode === "preset") return [];
    return state.sauces.map(function (id) { return name(P.SAUCES, id); });
  }
  function name(list, id) { var x = list.find(function (i) { return i.id === id; }); return x ? x.name : id; }

  /* ======================================================================
   *  RENDERING
   * ==================================================================== */
  var el = {
    stepper: document.getElementById("stepper"),
    presetList: document.getElementById("preset-list"),
    proteinList: document.getElementById("protein-list"),
    sideList: document.getElementById("side-list"),
    sauceList: document.getElementById("sauce-list"),
    customBlock: document.getElementById("custom-block"),
    presetBlock: document.getElementById("preset-block"),
    modeToggle: document.getElementById("mode-toggle"),
    guestVal: document.getElementById("guest-val"),
    tierFlag: document.getElementById("tier-flag"),
    extrasList: document.getElementById("extras-list"),
    areaSelect: document.getElementById("area-select"),
    step4Breakdown: document.getElementById("step4-breakdown"),
    review: document.getElementById("review"),
    summaryBody: document.getElementById("summary-body"),
    summaryTotalIdr: document.getElementById("summary-total-idr"),
    summaryTotalUsd: document.getElementById("summary-total-usd"),
    barIdr: document.getElementById("bar-idr"),
    barUsd: document.getElementById("bar-usd"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    waSend: document.getElementById("wa-send"),
  };

  /* ---- Stepper ---------------------------------------------------------- */
  var STEP_LABELS = ["Menu", "Guests", "Extras", "Total", "Send"];
  function renderStepper() {
    el.stepper.innerHTML = STEP_LABELS.map(function (lbl, i) {
      var n = i + 1;
      var cls = n === state.step ? "is-active" : n < state.step ? "is-done" : "";
      return '<div class="stepper__item ' + cls + '">' +
        '<div class="stepper__dot"></div>' +
        '<span>' + n + '<span class="stepper__label">. ' + lbl + '</span></span></div>';
    }).join("");
  }

  /* ---- Step 1: menu ----------------------------------------------------- */
  function renderMode() {
    // "Build your own" is handled by our staff over WhatsApp rather than in-app,
    // so that option is a direct chat link (not a mode switch). Presets stay in-app.
    var waText = "Hi BBQ Bali Home Service! 🔥 I'd like to build my own custom BBQ menu with your team — please help me pick proteins, sides & sauces and give me a price.";
    var waHref = "https://wa.me/" + P.BUSINESS.whatsappNumber + "?text=" + encodeURIComponent(waText);
    el.modeToggle.innerHTML =
      '<div class="opt is-selected" style="cursor:default">' +
        '<span class="opt__title">Choose a set package</span>' +
        '<span class="opt__desc">Pick a curated favourite below and get an instant price.</span>' +
      '</div>' +
      '<a class="opt opt--wa" href="' + waHref + '" target="_blank" rel="noopener">' +
        '<span class="opt__tag opt__tag--wa" style="align-self:flex-start">via WhatsApp</span>' +
        '<span class="opt__title">Build your own via WhatsApp with staff</span>' +
        '<span class="opt__desc">Prefer a fully custom menu? Chat with our team to build it and get a quote.</span>' +
      '</a>';
  }
  function optCard(nm, val, title, sub, sel) {
    return '<label class="opt' + (sel ? " is-selected" : "") + '">' +
      '<input type="radio" name="' + nm + '" value="' + val + '"' + (sel ? " checked" : "") + '>' +
      '<span class="opt__title">' + title + '</span>' +
      '<span class="opt__desc">' + sub + '</span></label>';
  }

  function renderPackages() {
    var t = currentTier().id;
    el.presetList.innerHTML = Object.keys(P.PACKAGES).map(function (id) {
      var pk = P.PACKAGES[id];
      var sel = state.pkg === id;
      var img = pk.image
        ? '<span class="opt__img" style="background-image:url(\'' + pk.image + '\')" role="img" aria-label="' + pk.name + ' menu">' +
            (pk.badge ? '<span class="pkg__badge">' + pk.badge + "</span>" : "") + "</span>"
        : "";
      return '<label class="opt opt--pkg' + (sel ? " is-selected" : "") + '">' +
        '<input type="radio" name="pkg" value="' + id + '"' + (sel ? " checked" : "") + '>' +
        img +
        '<span class="opt__title">' + pk.name + "</span>" +
        '<span class="opt__sub">' + pk.subtitle + "</span>" +
        '<span class="opt__price">from <b>' + idr(pk.perPerson[t]) + "</b> / person</span></label>";
    }).join("");
    el.presetList.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("change", function () { state.pkg = inp.value; update(); });
    });
  }

  function renderItemList(container, list, selected, stateKey) {
    var t = currentTier().id;
    container.innerHTML = list.map(function (it) {
      var sel = selected.indexOf(it.id) > -1;
      var price = it.perPerson ? '<span class="opt__price"><b>' + idr(it.perPerson[t]) + "</b> / person</span>" : "";
      var tag = it.tag ? '<span class="opt__tag opt__tag--' + it.tag + '" style="align-self:flex-start">' + it.tag + "</span>" : "";
      return '<label class="opt' + (sel ? " is-selected" : "") + '">' +
        '<input type="checkbox" value="' + it.id + '"' + (sel ? " checked" : "") + ">" +
        tag + '<span class="opt__title">' + it.name + "</span>" + price + "</label>";
    }).join("");
    container.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var arr = state[stateKey];
        var i = arr.indexOf(inp.value);
        if (inp.checked && i < 0) arr.push(inp.value);
        else if (!inp.checked && i > -1) arr.splice(i, 1);
        update();
      });
    });
  }

  function syncMode() {
    el.presetBlock.classList.toggle("hidden", state.mode !== "preset");
    el.customBlock.classList.toggle("hidden", state.mode !== "custom");
  }

  /* ---- Step 2: guests --------------------------------------------------- */
  function renderGuests() {
    el.guestVal.textContent = state.guests;
    var t = currentTier();
    el.tierFlag.innerHTML = '<span class="pill">📊 Pricing tier: ' + t.label + "</span>" +
      '<span class="per-person" style="margin-left:.6rem">' + idr(perPerson()) + " / person</span>";
  }

  /* ---- Step 3: extras --------------------------------------------------- */
  function renderExtras() {
    var t = currentTier().id;
    el.extrasList.innerHTML = P.EXTRAS.map(function (ex) {
      var priceLabel = ex.unit === "flat"
        ? idr(ex.flatIdr) + " / event"
        : idr(ex.perPersonPrice[t]) + " / guest";
      var control;
      if (ex.unit === "flat") {
        var on = !!state.extras[ex.id];
        control = '<label class="switch"><input type="checkbox" data-extra="' + ex.id + '"' +
          (on ? " checked" : "") + '><span class="track"></span></label>';
      } else {
        var qty = state.extras[ex.id] || 0;
        control = '<div class="mini-counter" data-extra="' + ex.id + '">' +
          '<button type="button" data-d="-1" aria-label="Fewer">−</button>' +
          '<span>' + qty + "</span>" +
          '<button type="button" data-d="1" aria-label="More">+</button></div>';
      }
      return '<div class="extra-row"><div class="extra-row__info">' +
        "<h4>" + ex.name + "</h4><p>" + ex.note + " · " + priceLabel + "</p></div>" +
        '<div class="extra-row__price">' + control + "</div></div>";
    }).join("");

    // flat toggles
    el.extrasList.querySelectorAll('input[data-extra]').forEach(function (inp) {
      inp.addEventListener("change", function () {
        state.extras[inp.getAttribute("data-extra")] = inp.checked ? 1 : 0;
        update();
      });
    });
    // perPerson counters
    el.extrasList.querySelectorAll('.mini-counter[data-extra]').forEach(function (mc) {
      var id = mc.getAttribute("data-extra");
      mc.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          var d = parseInt(b.getAttribute("data-d"), 10);
          var cur = state.extras[id] || 0;
          cur = Math.max(0, Math.min(state.guests, cur + d));
          state.extras[id] = cur;
          update();
        });
      });
    });
  }

  /* ---- Step 4: area ----------------------------------------------------- */
  function renderArea() {
    el.areaSelect.innerHTML = P.AREAS.map(function (a) {
      var lbl = a.label + (a.deliveryIdr > 0 ? "  (+" + idr(a.deliveryIdr) + ")" : a.confirm ? "" : "  (no delivery fee)");
      return '<option value="' + a.id + '"' + (state.area === a.id ? " selected" : "") + ">" + lbl + "</option>";
    }).join("");
    el.areaSelect.addEventListener("change", function () { state.area = el.areaSelect.value; update(); });
  }

  /* ---- Breakdown (shared by sidebar, step 4, review) -------------------- */
  function breakdownLines() {
    var c = calc();
    var lines = [];
    lines.push(["group", menuName() + " × " + state.guests + " guests", idr(c.food)]);
    lines.push(["sub", "Per person (" + currentTier().label + ")", idr(c.perPerson)]);
    P.EXTRAS.forEach(function (ex) {
      var cost = extraCost(ex);
      if (cost > 0) {
        var q = state.extras[ex.id];
        lines.push(["extra", ex.name + (ex.unit === "perPerson" ? " × " + q : ""), idr(cost)]);
      }
    });
    lines.push(["fee", P.FEES.chefBbqHire.label, idr(c.chef)]);
    if (c.delivery > 0) lines.push(["fee", "Out-of-area delivery", idr(c.delivery)]);
    return { lines: lines, calc: c };
  }

  function renderSummary() {
    var bd = breakdownLines();
    if (!hasMenu()) {
      el.summaryBody.innerHTML = '<p class="summary__empty">Pick a package or build your own menu to see your live price.</p>';
      el.summaryTotalIdr.textContent = idr(0);
      el.summaryTotalUsd.textContent = usd(0);
      el.barIdr.textContent = idr(0);
      el.barUsd.textContent = usd(0);
      return;
    }
    el.summaryBody.innerHTML = bd.lines.map(function (l) {
      if (l[0] === "sub") return '<div class="summary__line is-muted"><span>' + l[1] + "</span><span>" + l[2] + "</span></div>";
      return '<div class="summary__line"><span>' + l[1] + "</span><span>" + l[2] + "</span></div>";
    }).join("");
    el.summaryTotalIdr.textContent = idr(bd.calc.total);
    el.summaryTotalUsd.textContent = "~ " + usd(bd.calc.total);
    el.barIdr.textContent = idr(bd.calc.total);
    el.barUsd.textContent = "~ " + usd(bd.calc.total);
  }

  function renderStep4() {
    var bd = breakdownLines();
    el.step4Breakdown.innerHTML = bd.lines.map(function (l) {
      return '<div class="review__line"><span>' + l[1] + '</span><span class="amt">' + l[2] + "</span></div>";
    }).join("") +
      '<div class="review__total"><div><div class="idr">' + idr(bd.calc.total) + '</div>' +
      '<div class="usd">~ ' + usd(bd.calc.total) + '</div></div>' +
      '<div style="text-align:right"><small class="text-muted" style="color:var(--muted-light)">Includes chef & BBQ hire' +
      (bd.calc.delivery > 0 ? " + delivery" : "") + "</small></div></div>";
  }

  /* ---- Step 5: review --------------------------------------------------- */
  function renderReview() {
    var bd = breakdownLines();
    var t = currentTier();
    var html = '<h3>' + menuName() + ' <span class="pill">' + state.guests + " guests</span></h3>";
    html += '<p class="review__meta">' + t.label + " pricing · " + idr(bd.calc.perPerson) + " per person</p>";

    html += '<div class="review__group">On the grill</div>';
    proteinNames().forEach(function (p) { html += line(p); });
    html += '<div class="review__group">Sides</div>';
    sideNames().forEach(function (s) { html += line(s); });
    var sauces = sauceNames();
    if (sauces.length) { html += '<div class="review__group">Sauces</div>'; sauces.forEach(function (s) { html += line(s); }); }

    var chosenExtras = P.EXTRAS.filter(function (ex) { return extraCost(ex) > 0; });
    if (chosenExtras.length) {
      html += '<div class="review__group">Extras</div>';
      chosenExtras.forEach(function (ex) {
        var q = state.extras[ex.id];
        html += '<div class="review__line"><span>' + ex.name + (ex.unit === "perPerson" ? " × " + q : "") +
          '</span><span class="amt">' + idr(extraCost(ex)) + "</span></div>";
      });
    }

    html += '<div class="review__group">Fees & delivery</div>';
    html += '<div class="review__line"><span>' + P.FEES.chefBbqHire.label + '</span><span class="amt">' + idr(bd.calc.chef) + "</span></div>";
    var area = P.AREAS.find(function (a) { return a.id === state.area; });
    html += '<div class="review__line"><span>Delivery — ' + area.label + '</span><span class="amt">' +
      (bd.calc.delivery > 0 ? idr(bd.calc.delivery) : (area.confirm ? "TBC" : "Free")) + "</span></div>";

    html += '<div class="review__total"><div><div class="idr">' + idr(bd.calc.total) + '</div>' +
      '<div class="usd">~ ' + usd(bd.calc.total) + '</div></div>' +
      '<div style="max-width:220px;text-align:right;font-size:.8rem;color:var(--muted-light)">Estimate. Deposit is 50% to secure your date.</div></div>';

    html += '<div class="review__cta"><a id="wa-send" class="btn btn--wa btn--lg btn--block" target="_blank" rel="noopener">' +
      waIcon() + ' Send order via WhatsApp</a></div>';
    html += '<p class="review__terms">' + P.TERMS.deposit + " " + P.TERMS.payment +
      " We'll confirm availability and the final price with you directly — no payment is taken on this site.</p>";

    el.review.innerHTML = html;
    var btn = document.getElementById("wa-send");
    if (btn) btn.setAttribute("href", "https://wa.me/" + P.BUSINESS.whatsappNumber + "?text=" + encodeURIComponent(waMessage(bd)));

    function line(txt) { return '<div class="review__line"><span>' + txt + '</span><span class="amt">✓</span></div>'; }
  }

  function waIcon() { return "🟢"; }

  function waMessage(bd) {
    var L = [];
    L.push("Hi BBQ Bali Home Service! 🔥 I'd like to book an at-home BBQ.");
    L.push("");
    L.push("📋 MY ORDER");
    L.push("• Menu: " + menuName());
    L.push("• Guests: " + state.guests + " (" + currentTier().label + ")");
    L.push("• On the grill: " + proteinNames().join(", "));
    L.push("• Sides: " + sideNames().join(", "));
    if (sauceNames().length) L.push("• Sauces: " + sauceNames().join(", "));
    var ex = P.EXTRAS.filter(function (e) { return extraCost(e) > 0; });
    if (ex.length) {
      L.push("");
      L.push("➕ EXTRAS");
      ex.forEach(function (e) {
        var q = state.extras[e.id];
        L.push("• " + e.name + (e.unit === "perPerson" ? " × " + q : "") + " — " + idr(extraCost(e)));
      });
    }
    var area = P.AREAS.find(function (a) { return a.id === state.area; });
    L.push("");
    L.push("📍 Location: " + area.label);
    L.push("");
    L.push("💰 ESTIMATED TOTAL: " + idr(bd.calc.total) + " (~ " + usd(bd.calc.total) + ")");
    L.push("   incl. " + P.FEES.chefBbqHire.label + (bd.calc.delivery > 0 ? " + delivery" : "") + ".");
    L.push("");
    L.push("Please confirm availability and the final price. Thank you!");
    return L.join("\n");
  }

  /* ======================================================================
   *  STEP NAVIGATION
   * ==================================================================== */
  function showStep(n) {
    state.step = Math.max(1, Math.min(TOTAL_STEPS, n));
    document.querySelectorAll(".step-panel").forEach(function (p) {
      p.classList.toggle("is-active", +p.getAttribute("data-step") === state.step);
    });
    el.btnPrev.style.visibility = state.step === 1 ? "hidden" : "visible";
    el.btnNext.classList.toggle("hidden", state.step === TOTAL_STEPS);
    el.btnNext.disabled = state.step === 1 && !hasMenu();
    el.btnNext.textContent = state.step === TOTAL_STEPS - 1 ? "Review order →" : "Next →";
    if (state.step === 4) renderStep4();
    if (state.step === 5) renderReview();
    renderStepper();
    // scroll builder into view on step change
    var top = document.getElementById("builder").getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  /* ---- Master update (recompute everything price-dependent) ------------- */
  function update() {
    syncMode();
    // Tier can change per-person prices shown on option cards, so re-render lists
    if (state.step === 1) {
      renderPackages();
      renderItemList(el.proteinList, P.PROTEINS, state.proteins, "proteins");
    }
    renderGuests();
    renderSummary();
    if (state.step === 4) renderStep4();
    if (state.step === 5) renderReview();
    el.btnNext.disabled = state.step === 1 && !hasMenu();
  }

  /* ======================================================================
   *  INIT
   * ==================================================================== */
  function init() {
    renderStepper();
    renderMode();
    renderPackages();
    renderItemList(el.proteinList, P.PROTEINS, state.proteins, "proteins");
    renderItemList(el.sideList, P.SIDES, state.sides, "sides");
    renderItemList(el.sauceList, P.SAUCES, state.sauces, "sauces");
    syncMode();
    renderGuests();
    renderExtras();
    renderArea();
    renderSummary();

    // Guest counter
    document.getElementById("guest-minus").addEventListener("click", function () {
      state.guests = Math.max(P.MIN_GUESTS, state.guests - 1);
      clampExtras(); update();
    });
    document.getElementById("guest-plus").addEventListener("click", function () {
      state.guests = state.guests + 1; update();
    });

    el.btnPrev.addEventListener("click", function () { showStep(state.step - 1); });
    el.btnNext.addEventListener("click", function () {
      if (state.step === 1 && !hasMenu()) return;
      showStep(state.step + 1);
    });

    showStep(1);
  }

  function clampExtras() {
    Object.keys(state.extras).forEach(function (id) {
      var ex = P.EXTRAS.find(function (e) { return e.id === id; });
      if (ex && ex.unit === "perPerson" && state.extras[id] > state.guests) state.extras[id] = state.guests;
    });
    renderExtras();
  }

  init();
})();
