/* ============================================================================
 * INVOICE GENERATOR — owner-only, 100% in-browser (no backend).
 * Data lives in localStorage on THIS device. PDF via jsPDF + autotable.
 * All business/bank/sign-off details come from window.INVOICE_CONFIG.
 * ========================================================================== */
(function () {
  "use strict";
  var C = window.INVOICE_CONFIG;
  if (!C) { console.error("INVOICE_CONFIG missing"); return; }

  /* ── storage keys ──────────────────────────────────────────────────── */
  var K = {
    seq: "bbq_inv_seq",        // { "2026": 3 }  highest number allocated per year
    records: "bbq_inv_records",// { "BBQ-2026-001": {..} }
    draft: "bbq_inv_draft",    // current working invoice
    auth: "bbq_inv_auth",      // sessionStorage flag
  };

  /* ── tiny helpers ──────────────────────────────────────────────────── */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function load(key, fb) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function fmt(n) { return Math.round(Number(n) || 0).toLocaleString("en-US"); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function pad3(n) { return String(n).padStart(3, "0"); }
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + pad3Two(d.getMonth() + 1) + "-" + pad3Two(d.getDate()); }
  function pad3Two(n) { return String(n).padStart(2, "0"); }
  function dmy(iso) { if (!iso) return ""; var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0].slice(2); }

  /* ── money maths (the single source of truth for totals) ───────────── */
  function lineAmount(it) {
    var u = parseFloat(it.unit);
    if (it.unit === "" || it.unit == null || isNaN(u)) u = 1;   // blank/non-numeric unit = 1
    var p = parseFloat(it.price) || 0;
    return u * p;
  }
  function invoiceTotal(items) { return items.reduce(function (s, it) { return s + lineAmount(it); }, 0); }

  /* ── invoice numbering (stored so it never repeats) ────────────────── */
  function allocateNumber() {
    var year = new Date().getFullYear();
    var seq = load(K.seq, {});
    var n = (seq[year] || 0) + 1;
    seq[year] = n;
    save(K.seq, seq);
    return C.invoicePrefix + "-" + year + "-" + pad3(n);
  }

  /* ── state ─────────────────────────────────────────────────────────── */
  var state = null;
  function blankInvoice() {
    return {
      number: allocateNumber(),
      dateISO: todayISO(),
      location: "",
      client: { name: "", address: "", email: "" },
      items: [{ type: "", desc: "", unit: "", price: "" }],
      status: "unpaid",
      paidDate: "",
      createdAt: Date.now(),
    };
  }
  function saveDraft() { save(K.draft, state); }

  /* Persist the current invoice into Records (create or update, never dup). */
  function commitRecord() {
    var recs = load(K.records, {});
    var existing = recs[state.number];
    recs[state.number] = {
      number: state.number,
      dateISO: state.dateISO,
      location: state.location,
      client: { name: state.client.name, address: state.client.address, email: state.client.email },
      items: state.items.map(function (i) { return { type: i.type, desc: i.desc, unit: i.unit, price: i.price }; }),
      total: invoiceTotal(state.items),
      status: state.status || (existing && existing.status) || "unpaid",
      paidDate: state.paidDate || (existing && existing.paidDate) || "",
      createdAt: (existing && existing.createdAt) || state.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    save(K.records, recs);
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  PASSCODE GATE  (light client-side lock)
   * ════════════════════════════════════════════════════════════════════ */
  function setupGate() {
    var gate = $("#gate"), app = $("#app");
    function unlock() { gate.hidden = true; app.hidden = false; boot(); refit(); }
    if (sessionStorage.getItem(K.auth) === "1") { unlock(); return; }
    var input = $("#gate-pass"), err = $("#gate-err");
    function tryPass() {
      if (input.value === String(C.passcode)) {
        sessionStorage.setItem(K.auth, "1"); err.textContent = ""; unlock();
      } else { err.textContent = "Incorrect passcode."; input.select(); }
    }
    $("#gate-btn").addEventListener("click", tryPass);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") tryPass(); });
    input.focus();
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  BUILDER
   * ════════════════════════════════════════════════════════════════════ */
  var refs = {};
  function boot() {
    refs = {
      number: $("#f-number"), date: $("#f-date"), location: $("#f-location"),
      name: $("#f-name"), address: $("#f-address"), email: $("#f-email"),
      itemsBody: $("#items-body"), itemsTotal: $("#items-total"), preview: $("#preview"),
    };
    // Restore a saved draft or start fresh.
    state = load(K.draft, null);
    if (!state || !state.number) state = blankInvoice();
    fillForm();
    renderItems();
    renderPreview();
    wireOnce();
    saveDraft();
  }

  function fillForm() {
    refs.number.value = state.number;
    refs.date.value = state.dateISO || todayISO();
    refs.location.value = state.location || "";
    refs.name.value = state.client.name || "";
    refs.address.value = state.client.address || "";
    refs.email.value = state.client.email || "";
  }

  var wired = false;
  function wireOnce() {
    if (wired) return; wired = true;

    refs.number.addEventListener("input", function () { state.number = refs.number.value.trim(); renderPreview(); saveDraft(); });
    refs.date.addEventListener("input", function () { state.dateISO = refs.date.value; renderPreview(); saveDraft(); });
    refs.location.addEventListener("input", function () { state.location = refs.location.value; renderPreview(); saveDraft(); });
    refs.name.addEventListener("input", function () { state.client.name = refs.name.value; renderPreview(); saveDraft(); });
    refs.address.addEventListener("input", function () { state.client.address = refs.address.value; renderPreview(); saveDraft(); });
    refs.email.addEventListener("input", function () { state.client.email = refs.email.value; renderPreview(); saveDraft(); });

    $("#add-row").addEventListener("click", function () {
      state.items.push({ type: "", desc: "", unit: "", price: "" });
      renderItems(); renderPreview(); saveDraft();
    });

    $("#btn-pdf").addEventListener("click", function () { downloadPdf(); });
    $("#btn-print").addEventListener("click", function () { window.print(); });
    $("#btn-send").addEventListener("click", function () { sendToClient(); });
    $("#btn-new").addEventListener("click", function () { startNew(); });

    // Tabs
    $$(".inv-tabs button").forEach(function (b) {
      b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
    });
    // Mobile edit/preview toggle
    $$(".inv-mobtabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".inv-mobtabs button").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        var g = $("#builder-grid");
        g.classList.toggle("m-preview", b.getAttribute("data-m") === "preview");
        g.classList.toggle("m-edit", b.getAttribute("data-m") === "edit");
        requestAnimationFrame(refit);
      });
    });

    // Records controls
    $("#rec-period").addEventListener("change", function () {
      $("#rec-custom").hidden = this.value !== "custom"; renderRecords();
    });
    $("#rec-from").addEventListener("change", renderRecords);
    $("#rec-to").addEventListener("change", renderRecords);
    $("#rec-search").addEventListener("input", renderRecords);
    $("#rec-status").addEventListener("change", renderRecords);
    $("#rec-csv").addEventListener("click", exportCsv);
    $("#rec-backup").addEventListener("click", backupJson);
    $("#rec-restore-file").addEventListener("change", restoreJson);

    if (window.ResizeObserver) { new ResizeObserver(refit).observe($("#pv-wrap")); }
    window.addEventListener("resize", refit);
  }

  /* ── line-items table ──────────────────────────────────────────────── */
  function renderItems() {
    refs.itemsBody.innerHTML = "";
    state.items.forEach(function (it, i) { refs.itemsBody.appendChild(rowEl(it, i)); });
    updateTotals();
  }
  function rowEl(it, i) {
    var tr = el("tr", { "data-idx": i });
    tr.innerHTML =
      '<td class="col-type" data-label="Product type"><input data-k="type" value="' + esc(it.type) + '" placeholder="e.g. Package #2" /></td>' +
      '<td class="col-desc" data-label="Description"><input data-k="desc" value="' + esc(it.desc) + '" placeholder="optional note" /></td>' +
      '<td class="col-qty" data-label="Unit (qty)"><input data-k="unit" inputmode="decimal" value="' + esc(it.unit) + '" placeholder="1" /></td>' +
      '<td class="col-price" data-label="Price"><input data-k="price" inputmode="decimal" value="' + esc(it.price) + '" placeholder="0" /></td>' +
      '<td class="col-amt amt-cell" data-label="Amount">' + fmt(lineAmount(it)) + '</td>' +
      '<td class="col-x"><button type="button" class="item-del" title="Remove row" aria-label="Remove row">×</button></td>';
    $$("input", tr).forEach(function (inp) {
      inp.addEventListener("input", function () {
        var idx = +tr.getAttribute("data-idx");
        state.items[idx][inp.getAttribute("data-k")] = inp.value;
        tr.querySelector(".amt-cell").textContent = fmt(lineAmount(state.items[idx]));
        updateTotals(); renderPreview(); saveDraft();
      });
    });
    $(".item-del", tr).addEventListener("click", function () {
      var idx = +tr.getAttribute("data-idx");
      state.items.splice(idx, 1);
      if (!state.items.length) state.items.push({ type: "", desc: "", unit: "", price: "" });
      renderItems(); renderPreview(); saveDraft();
    });
    return tr;
  }
  function updateTotals() { refs.itemsTotal.textContent = C.currencyLabel + " " + fmt(invoiceTotal(state.items)); }

  /* ── live A4 preview ───────────────────────────────────────────────── */
  function renderPreview() {
    var b = C.business, bank = C.bank, L = C.labels;
    var rows = state.items.map(function (it, i) {
      var u = parseFloat(it.unit);
      var qtyTxt = (it.unit !== "" && !isNaN(u) && u !== 1) ? ' x ' + it.unit : "";
      var main = esc(it.type || "") + qtyTxt;
      var sub = it.desc ? '<small>' + esc(it.desc) + '</small>' : "";
      return '<tr><td class="idx">' + (i + 1) + '.</td>' +
        '<td class="pv-desc">' + (main || "&nbsp;") + sub + '</td>' +
        '<td class="num">' + fmt(lineAmount(it)) + '</td></tr>';
    }).join("");

    refs.preview.innerHTML =
      '<div class="pv-head">' +
        '<div class="pv-logo"><img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" /></div>' +
        '<div class="pv-biz"><h2>' + esc(b.name) + '</h2>' +
          b.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join("") +
        '</div>' +
      '</div>' +
      '<div class="pv-title">INVOICE</div>' +
      '<div class="pv-meta">' +
        '<div class="pv-billto"><span class="k">' + esc(L.billTo) + '</span><span class="v">' + esc(state.client.name || "") + '</span>' +
          (state.client.address ? '<div class="pv-billaddr">' + esc(state.client.address) + '</div>' : "") +
        '</div>' +
        '<div class="pv-dates">' +
          '<span class="k">Invoice&nbsp;No:</span><span class="v">' + esc(state.number) + '</span>' +
          '<span class="k">' + esc(L.date) + '</span><span class="v">' + esc(dmy(state.dateISO)) + '</span>' +
          '<span class="k">' + esc(L.location) + '</span><span class="v">' + esc(state.location || "") + '</span>' +
        '</div>' +
      '</div>' +
      '<table class="pv-table"><thead><tr>' +
        '<th class="idx">' + esc(L.itemCol) + '</th><th>' + esc(L.descCol) + '</th>' +
        '<th class="num">' + esc(L.amountCol) + ' ' + esc(C.currencyLabel) + '</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="pv-total"><span class="lbl">' + esc(L.total) + '</span><span class="val">' + fmt(invoiceTotal(state.items)) + '</span></div>' +
      '<p class="pv-taxnote">' + esc(C.taxNote) + '</p>' +
      '<div class="pv-foot">' +
        '<div class="h">' + esc(bank.heading) + '</div>' +
        '<p>' + esc(bank.accountName) + '</p>' +
        '<p>' + esc(bank.bankName) + '</p>' +
        '<p>' + esc(bank.accountNumber) + '</p>' +
        '<p class="em">Email - ' + esc(b.email) + '</p>' +
      '</div>' +
      '<hr class="pv-rule" />' +
      '<div class="pv-web">' + esc(b.website) + '</div>';
    refit();
  }

  /* ── scale the fixed 794px preview to fit its container ────────────── */
  function refit() {
    var wrap = $("#pv-wrap"), pv = $("#preview");
    if (!wrap || !pv) return;
    var w = wrap.clientWidth;
    if (!w) return;
    var scale = Math.min(1, w / 794);
    pv.style.transform = "scale(" + scale + ")";
    wrap.style.height = (pv.offsetHeight * scale) + "px";
  }

  /* ── view switching ────────────────────────────────────────────────── */
  function showView(v) {
    $$(".inv-tabs button").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-view") === v); });
    $$(".inv-view").forEach(function (s) { s.hidden = s.getAttribute("data-view") !== v; });
    if (v === "records") renderRecords();
    if (v === "builder") requestAnimationFrame(refit);
  }

  /* ── actions ───────────────────────────────────────────────────────── */
  function startNew() {
    state = blankInvoice();
    fillForm(); renderItems(); renderPreview(); saveDraft();
    showView("builder");
  }

  function downloadPdf() {
    commitRecord();
    buildPdf(state).then(function (doc) { doc.save(state.number + ".pdf"); });
  }

  function sendToClient() {
    if (!state.client.email) { alert("Add the client's email first."); return; }
    commitRecord();
    var total = C.currencyLabel + " " + fmt(invoiceTotal(state.items));
    var bankTxt = C.bank.heading + ":\n" + C.bank.accountName + "\n" + C.bank.bankName + "\n" + C.bank.accountNumber;
    var map = {
      "{name}": state.client.name || "there", "{number}": state.number, "{total}": total,
      "{date}": dmy(state.dateISO), "{bank}": bankTxt, "{signoff}": C.signOff,
      "{business}": C.business.name, "{website}": C.business.website,
    };
    function tpl(s) { return s.replace(/\{name\}|\{number\}|\{total\}|\{date\}|\{bank\}|\{signoff\}|\{business\}|\{website\}/g, function (m) { return map[m]; }); }
    var subject = tpl(C.emailSubject), body = tpl(C.emailBody);
    // Download the PDF so it can be attached, then open the mail app.
    buildPdf(state).then(function (doc) {
      doc.save(state.number + ".pdf");
      window.location.href = "mailto:" + encodeURIComponent(state.client.email) +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  PDF  (jsPDF + autotable). Logo embedded as PNG (rasterised from SVG).
   * ════════════════════════════════════════════════════════════════════ */
  var _logo = null;
  function getLogoPng() {
    if (_logo) return Promise.resolve(_logo);
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var nw = img.naturalWidth || 360, nh = img.naturalHeight || 240;
        var tw = 480, th = Math.round(tw * (nh / nw));
        var cv = document.createElement("canvas"); cv.width = tw; cv.height = th;
        try { cv.getContext("2d").drawImage(img, 0, 0, tw, th); _logo = { data: cv.toDataURL("image/png"), w: nw, h: nh }; }
        catch (e) { _logo = null; }
        resolve(_logo);
      };
      img.onerror = function () { resolve(null); };
      img.src = C.business.logo;
    });
  }

  function buildPdf(inv) {
    return getLogoPng().then(function (logo) {
      var jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      var doc = new jsPDF({ unit: "mm", format: "a4" });
      var b = C.business, bank = C.bank, L = C.labels;
      var PW = 210, M = 16, right = PW - M;

      // Logo (top-left), keep aspect, ~42mm wide
      if (logo) {
        var lw = 42, lh = Math.min(34, lw * (logo.h / logo.w));
        try { doc.addImage(logo.data, "PNG", M, 12, lw, lh); } catch (e) {}
      }
      // Business block (top-right)
      doc.setTextColor(51); doc.setFont("helvetica", "normal"); doc.setFontSize(17);
      doc.text(b.name, right, 20, { align: "right" });
      doc.setFontSize(9); doc.setTextColor(120);
      var by = 26;
      b.lines.forEach(function (l) { doc.text(l, right, by, { align: "right" }); by += 5; });

      // INVOICE title
      doc.setTextColor(17); doc.setFont("helvetica", "bold"); doc.setFontSize(34);
      doc.text("INVOICE", M, 54);

      // Bill to (left)
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold"); doc.text(L.billTo, M, 74);
      doc.setFont("helvetica", "normal"); doc.setTextColor(80);
      doc.text(inv.client.name || "", M + 22, 74);
      var ay = 80;
      (inv.client.address || "").split("\n").forEach(function (line) { if (line) { doc.setFontSize(9); doc.text(line, M, ay); ay += 4.6; } });

      // Meta (right): invoice no, date, location
      doc.setFontSize(11); var mx = 120, vx = 152, my = 70;
      [["Invoice No:", inv.number], [L.date, dmy(inv.dateISO)], [L.location, inv.location || ""]].forEach(function (r) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(17); doc.text(r[0], mx, my);
        doc.setFont("helvetica", "normal"); doc.setTextColor(80); doc.text(String(r[1]), vx, my);
        my += 7;
      });

      // Items table
      var body = inv.items.map(function (it, i) {
        var u = parseFloat(it.unit);
        var qtyTxt = (it.unit !== "" && !isNaN(u) && u !== 1) ? "  x " + it.unit : "";
        var desc = (it.type || "") + qtyTxt + (it.desc ? "\n" + it.desc : "");
        return [(i + 1) + ".", desc, fmt(lineAmount(it))];
      });
      doc.autoTable({
        head: [[L.itemCol, L.descCol, L.amountCol + " " + C.currencyLabel]],
        body: body, startY: 98, theme: "plain", margin: { left: M, right: M },
        styles: { fontSize: 11, cellPadding: { top: 4, bottom: 4, left: 2, right: 2 }, textColor: 51 },
        headStyles: { fontStyle: "bold", textColor: 17, lineWidth: { top: 0.3, bottom: 0.3 }, lineColor: 190 },
        columnStyles: { 0: { cellWidth: 20, textColor: 90 }, 2: { halign: "right", cellWidth: 42 } },
      });

      // Total
      var fy = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 24;
      doc.setFont("helvetica", "bold"); doc.setTextColor(17);
      doc.setFontSize(20); doc.text(L.total, 130, fy);
      doc.setFontSize(21); doc.text(fmt(invoiceTotal(inv.items)), right, fy, { align: "right" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(C.taxNote, right, fy + 6, { align: "right" });

      // Footer: bank details
      var footY = Math.max(fy + 30, 246);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(140);
      doc.text(bank.heading, M, footY);
      doc.setTextColor(70); doc.setFontSize(9.5);
      doc.text(bank.accountName, M, footY + 7);
      doc.text(bank.bankName, M, footY + 12);
      doc.text(bank.accountNumber, M, footY + 17);
      doc.text("Email - " + b.email, M, footY + 25);

      // Website centred at foot
      doc.setDrawColor(190); doc.setLineWidth(0.3); doc.line(M, 285, right, 285);
      doc.setTextColor(60); doc.setFontSize(10); doc.text(b.website, PW / 2, 291, { align: "center" });

      return doc;
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   *  RECORDS
   * ════════════════════════════════════════════════════════════════════ */
  function taxYearBounds(which) {
    var now = new Date(), y = now.getFullYear();
    var startThis = new Date(y, 3, 6);              // 6 April
    var ty0 = (now >= startThis) ? y : y - 1;
    if (which === "last") ty0 -= 1;
    return { from: new Date(ty0, 3, 6, 0, 0, 0), to: new Date(ty0 + 1, 3, 5, 23, 59, 59) };
  }
  function periodBounds() {
    var v = $("#rec-period").value, now = new Date();
    if (v === "all") return null;
    if (v === "thisTax") return taxYearBounds("this");
    if (v === "lastTax") return taxYearBounds("last");
    if (v === "thisMonth") return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
    if (v === "custom") {
      var f = $("#rec-from").value, t = $("#rec-to").value;
      return { from: f ? new Date(f + "T00:00:00") : new Date(0), to: t ? new Date(t + "T23:59:59") : new Date(8640000000000000) };
    }
    return null;
  }
  function allRecords() {
    var recs = load(K.records, {});
    return Object.keys(recs).map(function (k) { return recs[k]; })
      .sort(function (a, b) { return (b.dateISO || "").localeCompare(a.dateISO || "") || (b.number).localeCompare(a.number); });
  }
  function inPeriod(inv, bounds) {
    if (!bounds) return true;
    var d = new Date((inv.dateISO || "") + "T12:00:00");
    return d >= bounds.from && d <= bounds.to;
  }

  function renderRecords() {
    var bounds = periodBounds();
    var search = ($("#rec-search").value || "").toLowerCase();
    var statusF = $("#rec-status").value;
    var periodList = allRecords().filter(function (i) { return inPeriod(i, bounds); });

    // Summary over the period (ignores search/status so totals are true)
    var invoiced = 0, paid = 0, count = periodList.length;
    periodList.forEach(function (i) { invoiced += i.total || 0; if (i.status === "paid") paid += i.total || 0; });
    $("#sum-count").textContent = count;
    $("#sum-invoiced").textContent = C.currencyLabel + " " + fmt(invoiced);
    $("#sum-paid").textContent = C.currencyLabel + " " + fmt(paid);
    $("#sum-out").textContent = C.currencyLabel + " " + fmt(invoiced - paid);

    // Breakdown by year and by month
    renderBreakdown(periodList);

    // Filtered list (search + status)
    var list = periodList.filter(function (i) {
      if (statusF !== "all" && i.status !== statusF) return false;
      if (search) return (i.client.name || "").toLowerCase().indexOf(search) > -1 || (i.number || "").toLowerCase().indexOf(search) > -1;
      return true;
    });
    renderList(list);
  }

  function renderBreakdown(list) {
    var byYear = {}, byMonth = {};
    list.forEach(function (i) {
      var y = (i.dateISO || "").slice(0, 4), m = (i.dateISO || "").slice(0, 7);
      byYear[y] = (byYear[y] || 0) + (i.total || 0);
      byMonth[m] = (byMonth[m] || 0) + (i.total || 0);
    });
    function rows(obj) {
      return Object.keys(obj).sort().reverse().map(function (k) {
        return '<tr><td>' + esc(k) + '</td><td class="num">' + C.currencyLabel + ' ' + fmt(obj[k]) + '</td></tr>';
      }).join("") || '<tr><td colspan="2" style="color:var(--muted)">No invoices</td></tr>';
    }
    $("#bd-year").innerHTML = '<caption>By year</caption><tr><th>Year</th><th class="num">Invoiced</th></tr>' + rows(byYear);
    $("#bd-month").innerHTML = '<caption>By month</caption><tr><th>Month</th><th class="num">Invoiced</th></tr>' + rows(byMonth);
  }

  function renderList(list) {
    var host = $("#rec-rows");
    if (!list.length) { host.innerHTML = '<tr><td colspan="6" class="rec-list__empty">No invoices for this filter.</td></tr>'; return; }
    host.innerHTML = list.map(function (i) {
      var badge = i.status === "paid"
        ? '<span class="badge badge--paid">Paid' + (i.paidDate ? " · " + dmy(i.paidDate) : "") + '</span>'
        : '<span class="badge badge--unpaid">Unpaid</span>';
      return '<tr data-num="' + esc(i.number) + '">' +
        '<td>' + esc(dmy(i.dateISO)) + '</td>' +
        '<td><strong>' + esc(i.number) + '</strong></td>' +
        '<td>' + esc(i.client.name || "—") + '</td>' +
        '<td class="num">' + C.currencyLabel + ' ' + fmt(i.total) + '</td>' +
        '<td>' + badge + '</td>' +
        '<td><div class="rec-actions">' +
          '<button data-a="pdf">PDF</button>' +
          '<button data-a="open">Open</button>' +
          '<button data-a="copy">Copy</button>' +
          '<button data-a="paid">' + (i.status === "paid" ? "Unpaid" : "Mark paid") + '</button>' +
          '<button data-a="del" class="danger">Delete</button>' +
        '</div></td></tr>';
    }).join("");
    $$("#rec-rows [data-a]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var num = btn.closest("tr").getAttribute("data-num");
        recordAction(btn.getAttribute("data-a"), num);
      });
    });
  }

  function recordAction(a, num) {
    var recs = load(K.records, {}), inv = recs[num];
    if (!inv) return;
    if (a === "pdf") { buildPdf(inv).then(function (doc) { doc.save(inv.number + ".pdf"); }); return; }
    if (a === "open") { state = deepInv(inv); saveDraft(); fillForm(); renderItems(); renderPreview(); showView("builder"); return; }
    if (a === "copy") {
      var c = deepInv(inv); c.number = allocateNumber(); c.status = "unpaid"; c.paidDate = ""; c.dateISO = todayISO(); c.createdAt = Date.now();
      state = c; saveDraft(); fillForm(); renderItems(); renderPreview(); showView("builder"); return;
    }
    if (a === "paid") {
      inv.status = inv.status === "paid" ? "unpaid" : "paid";
      inv.paidDate = inv.status === "paid" ? todayISO() : "";
      recs[num] = inv; save(K.records, recs); renderRecords(); return;
    }
    if (a === "del") {
      if (!confirm("Delete invoice " + num + "? This cannot be undone.")) return;
      delete recs[num]; save(K.records, recs); renderRecords(); return;
    }
  }
  function deepInv(inv) {
    return {
      number: inv.number, dateISO: inv.dateISO, location: inv.location,
      client: { name: inv.client.name, address: inv.client.address, email: inv.client.email },
      items: inv.items.map(function (i) { return { type: i.type, desc: i.desc, unit: i.unit, price: i.price }; }),
      status: inv.status, paidDate: inv.paidDate, createdAt: inv.createdAt,
    };
  }

  /* ── CSV / JSON ────────────────────────────────────────────────────── */
  function currentFilteredForExport() {
    var bounds = periodBounds(), search = ($("#rec-search").value || "").toLowerCase(), statusF = $("#rec-status").value;
    return allRecords().filter(function (i) { return inPeriod(i, bounds); }).filter(function (i) {
      if (statusF !== "all" && i.status !== statusF) return false;
      if (search) return (i.client.name || "").toLowerCase().indexOf(search) > -1 || (i.number || "").toLowerCase().indexOf(search) > -1;
      return true;
    });
  }
  function csvCell(s) { s = String(s == null ? "" : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function exportCsv() {
    var list = currentFilteredForExport();
    var lines = [["Invoice", "Date", "Client", "Amount", "Status", "Paid date", "Email"].join(",")];
    var inv = 0, paid = 0;
    list.forEach(function (i) {
      inv += i.total || 0; if (i.status === "paid") paid += i.total || 0;
      lines.push([csvCell(i.number), csvCell(dmy(i.dateISO)), csvCell(i.client.name), Math.round(i.total || 0),
        csvCell(i.status), csvCell(dmy(i.paidDate)), csvCell(i.client.email)].join(","));
    });
    lines.push("");
    lines.push(["", "", "Invoiced", Math.round(inv)].join(","));
    lines.push(["", "", "Paid", Math.round(paid)].join(","));
    lines.push(["", "", "Outstanding", Math.round(inv - paid)].join(","));
    downloadBlob(lines.join("\n"), "invoices-" + todayISO() + ".csv", "text/csv");
  }
  function backupJson() {
    var payload = { seq: load(K.seq, {}), records: load(K.records, {}), exportedAt: new Date().toISOString() };
    downloadBlob(JSON.stringify(payload, null, 2), "bbq-invoices-backup-" + todayISO() + ".json", "application/json");
  }
  function restoreJson(e) {
    var file = e.target.files && e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data.records) throw new Error("no records");
        if (!confirm("Restore will merge " + Object.keys(data.records).length + " invoices into this browser. Continue?")) return;
        var recs = load(K.records, {}); Object.keys(data.records).forEach(function (k) { recs[k] = data.records[k]; });
        save(K.records, recs);
        if (data.seq) { var seq = load(K.seq, {}); Object.keys(data.seq).forEach(function (y) { seq[y] = Math.max(seq[y] || 0, data.seq[y]); }); save(K.seq, seq); }
        renderRecords(); alert("Records restored.");
      } catch (err) { alert("Could not read that backup file."); }
      e.target.value = "";
    };
    reader.readAsText(file);
  }
  function downloadBlob(text, name, type) {
    var blob = new Blob([text], { type: type }), url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ── go ────────────────────────────────────────────────────────────── */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupGate);
  else setupGate();
})();
