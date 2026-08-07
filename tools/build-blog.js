/* ============================================================================
 * BLOG BUILDER  —  node tools/build-blog.js
 * ----------------------------------------------------------------------------
 * Reads tools/blog-data.js and generates, at the project root:
 *   • blog.html                (the blog index / listing page)
 *   • bbq-<slug>.html          (one SEO post per Bali area)
 *   • sitemap.xml              (every page + post)
 *
 * The generated HTML matches the hand-written pages (same nav, footer, design
 * system, Google Ads tags). To change a post, edit tools/blog-data.js and
 * re-run this script — never edit the generated HTML by hand.
 * ========================================================================== */

const fs = require("fs");
const path = require("path");
const { SITE, ZONES, POSTS } = require("./blog-data");

const ROOT = path.join(__dirname, "..");
const GTAG_ID = "AW-846645441";
const GTAG_LABEL = "AW-846645441/Lwx1CK-v290cEMGR25MD";
const ONCLICK = 'onclick="return gtag_report_conversion(this.href)"';

/* ---- helpers ------------------------------------------------------------ */
function waHref(text) {
  return "https://wa.me/" + SITE.whatsappNumber + "?text=" + encodeURIComponent(text);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
// Escape for use inside a double-quoted HTML attribute.
function attr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/* ---- shared <head> ------------------------------------------------------ */
function head(opts) {
  // opts: { title, description, canonical, extraStyles, jsonld: [objects] }
  const styles = ['<link rel="stylesheet" href="css/styles.css" />', '<link rel="stylesheet" href="css/blog.css" />']
    .concat(opts.extraStyles || []).join("\n  ");
  const ld = (opts.jsonld || [])
    .map((o) => '<script type="application/ld+json">' + JSON.stringify(o) + "</script>")
    .join("\n  ");
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GTAG_ID}');
  </script>
  <!-- Event snippet: fires a Google Ads conversion, then continues to the link (e.g. WhatsApp) -->
  <script>
    function gtag_report_conversion(url) {
      var callback = function () {
        if (typeof(url) != 'undefined') {
          window.location = url;
        }
      };
      gtag('event', 'conversion', {
          'send_to': '${GTAG_LABEL}',
          'event_callback': callback
      });
      return false;
    }
  </script>
  <title>${opts.title}</title>
  <meta name="description" content="${attr(opts.description)}" />
  <meta name="theme-color" content="#14100e" />
  <link rel="canonical" href="${opts.canonical}" />
  <meta property="og:title" content="${attr(opts.title)}" />
  <meta property="og:description" content="${attr(opts.description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${opts.canonical}" />
  <meta property="og:image" content="${SITE.domain}/${SITE.heroImage}" />
  <link rel="icon" href="assets/img/favicon.png" type="image/png" /><link rel="apple-touch-icon" href="assets/img/favicon.png" />
  ${styles}
  ${ld}
</head>`;
}

/* ---- shared nav + footer (with Blog link) ------------------------------- */
function nav(current) {
  const links = [
    ["index.html", "Home"],
    ["menu.html", "Menu &amp; Prices"],
    ["about.html", "How It Works"],
    [SITE.instagram, "Gallery", true],
    ["faq.html", "FAQ"],
    ["blog.html", "Blog"],
    ["contact.html", "Contact"],
  ].map(([href, label, ig]) => {
    if (ig) return `<a href="${href}" data-ig target="_blank" rel="noopener">${label}</a>`;
    const cur = href === current ? ' aria-current="page"' : "";
    return `<a href="${href}"${cur}>${label}</a>`;
  }).join("");
  return `  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="index.html" aria-label="BBQ Bali Home Service home"><span class="brand__mark" aria-hidden="true"><img src="assets/img/logo.svg" alt="" /></span><span class="brand__name">BBQ Bali Home Service<small>BBQ Hire Bali</small></span></a>
      <button class="nav__toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu"><span></span><span></span><span></span></button>
      <div class="nav__menu" id="nav-menu">
        <nav class="nav__links" aria-label="Primary">
          ${links}
        </nav>
        <div class="nav__cta"><a class="btn btn--primary" href="menu.html">Build your BBQ</a></div>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div><a class="brand" href="index.html"><span class="brand__mark" aria-hidden="true"><img src="assets/img/logo.svg" alt="" /></span><span class="brand__name">BBQ Bali Home Service<small>BBQ Hire Bali</small></span></a><p class="text-muted" style="margin-top:1rem;font-size:.9rem">At-home BBQ &amp; private chef hire across Bali.</p></div>
        <div><h4>Explore</h4><ul class="footer-links"><li><a href="menu.html">Menu &amp; Prices</a></li><li><a href="about.html">How It Works</a></li><li><a href="https://www.instagram.com/bbqbalihomeservice/" data-ig target="_blank" rel="noopener">Gallery</a></li><li><a href="faq.html">FAQ</a></li><li><a href="blog.html">Blog</a></li><li><a href="contact.html">Contact</a></li></ul></div>
        <div class="footer-contact"><h4>Get in touch</h4><a data-wa data-wa-text="Hi BBQ Bali Home Service!" target="_blank" rel="noopener" ${ONCLICK}>🟢 WhatsApp <span data-wa-display></span></a><a data-email data-email-text>✉️ email</a><a data-ig target="_blank" rel="noopener">📸 @bbqbalihomeservice</a></div>
      </div>
      <div class="footer-bottom"><span>© <span data-year>2026</span> BBQ Bali Home Service.</span><span>Bali BBQ &amp; Chef Hire</span></div>
    </div>
  </footer>
  <a class="wa-float" data-wa data-wa-text="Hi BBQ Bali Home Service! I'd like to book a BBQ 🔥" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" ${ONCLICK}>🟢</a>

  <script src="data/pricing.js"></script>
  <script src="js/main.js"></script>`;
}

/* ---- schema.org objects ------------------------------------------------- */
function localBusinessLD(areaName) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    image: SITE.domain + "/" + SITE.heroImage,
    "@id": SITE.domain + "/#business",
    url: SITE.domain + "/",
    telephone: "+" + SITE.whatsappNumber,
    priceRange: "$$",
    servesCuisine: "Barbecue",
    areaServed: areaName ? { "@type": "Place", name: areaName + ", Bali" } : "Bali, Indonesia",
    address: { "@type": "PostalAddress", addressRegion: "Bali", addressCountry: "ID" },
    sameAs: [SITE.instagram],
  };
}
function faqLD(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
function breadcrumbLD(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
function articleLD(post, url) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "BBQ " + post.area + " — Villa & At-Home BBQ Catering",
    description: post.metaDesc,
    image: SITE.domain + "/" + SITE.heroImage,
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: SITE.domain + "/" + SITE.logo },
    },
    mainEntityOfPage: url,
    about: "BBQ catering in " + post.area + ", Bali",
  };
}

/* ---- shared FAQs (appended after each post's area-specific ones) -------- */
const SHARED_FAQS = [
  {
    q: "What's included in the BBQ price?",
    a: "Everything for the BBQ: your private chef, the full BBQ setup, charcoal and gas, all the food, buffet-style serving, plus setup and clean-up. You just provide the space and the guests.",
  },
  {
    q: "How do I book, and can I book for today?",
    a: "Pick a menu, then send your order on WhatsApp — we reply to confirm the date, details and final price, and a 50% deposit secures it. Same-day BBQ is possible as long as it's confirmed before 11am so we can shop and prep fresh.",
  },
];

/* ---- render a single post ----------------------------------------------- */
function renderPost(post) {
  const url = SITE.domain + "/bbq-" + post.slug + ".html";
  const zone = ZONES[post.zoneKey];
  const deliveryLine = post.zoneKey === "confirm"
    ? `Delivery to ${post.area} is ${zone.fee}.`
    : `Delivery to ${post.area} is a flat ${zone.fee}, on top of your food and the BBQ &amp; chef hire.`;
  const faqs = post.faqs.concat(SHARED_FAQS);
  const bookText = `Hi BBQ Bali Home Service! 🔥 I'd like to book an at-home BBQ in ${post.area}. Could you help with availability and a price?`;
  const bookHref = waHref(bookText);

  // Related links: 3 other areas (wrap around the list).
  const idx = POSTS.indexOf(post);
  const related = [POSTS[(idx + 1) % POSTS.length], POSTS[(idx + 2) % POSTS.length], POSTS[(idx + 3) % POSTS.length]];

  const jsonld = [
    localBusinessLD(post.area),
    articleLD(post, url),
    faqLD(faqs),
    breadcrumbLD([
      { name: "Home", url: SITE.domain + "/" },
      { name: "Blog", url: SITE.domain + "/blog.html" },
      { name: "BBQ " + post.area, url },
    ]),
  ];

  const introHtml = post.intro.map((p) => `<p>${p}</p>`).join("\n            ");
  const whyHtml = post.why.map((p) => `<p>${p}</p>`).join("\n            ");
  const occasions = post.occasions.map((o) => `<li>${o}</li>`).join("");
  const occasionsInline = post.occasions.join(" · ");
  const colour = post.localColour.join(" · ");
  const faqHtml = faqs.map((f, i) => {
    const pid = "faq-panel-" + i;
    return `<div class="acc-item">
          <button class="acc-trigger" aria-expanded="false" aria-controls="${pid}"><span>${f.q}</span><span class="acc-icon" aria-hidden="true"></span></button>
          <div class="acc-panel" id="${pid}" role="region"><div class="acc-panel__inner"><p>${f.a}</p></div></div>
        </div>`;
  }).join("\n        ");
  const relatedHtml = related.map((r) =>
    `<a class="related-chip" href="bbq-${r.slug}.html">BBQ ${r.area}</a>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
${head({
    title: `BBQ ${post.area} — At-Home & Villa BBQ Catering | BBQ Bali Home Service`,
    description: post.metaDesc,
    canonical: url,
    jsonld,
  })}
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${nav("blog.html")}

  <main id="main">
    <article class="blog-post">
      <header class="section--tight band-charcoal">
        <div class="wrap" style="padding-block:2.4rem 2rem">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span aria-hidden="true">›</span> <a href="blog.html">Blog</a> <span aria-hidden="true">›</span> <span>BBQ ${post.area}</span></nav>
          <span class="eyebrow eyebrow--light">Villa & At-Home BBQ · ${post.area}</span>
          <h1 style="color:#fff">BBQ ${post.area} — Villa &amp; At-Home BBQ Catering</h1>
          <p class="lead" style="color:var(--cream-dim)">Private BBQ &amp; chef hire brought to your villa in ${post.area}, Bali. From $${SITE.fromUsd} USD per person — book in a quick WhatsApp chat.</p>
          <div class="btn-row mt-2">
            <a class="btn btn--wa btn--lg" href="${attr(bookHref)}" target="_blank" rel="noopener" ${ONCLICK}>🟢 Book a ${post.area} BBQ</a>
            <a class="btn btn--ghost-light btn--lg" href="menu.html">See menus &amp; prices →</a>
          </div>
        </div>
      </header>

      <div class="section">
        <div class="wrap blog-prose">
          ${introHtml}

          <h2>${post.whyTitle}</h2>
          ${whyHtml}

          <div class="notice" style="margin:1.6rem 0"><strong>Popular in ${post.area}:</strong> ${occasionsInline}</div>

          <h2>Great for ${post.area} gatherings</h2>
          <ul class="pkg__list blog-tags">${occasions}</ul>
          <p class="text-muted" style="font-size:.9rem">Around ${colour} and beyond.</p>

          <h2>What you get</h2>
          <ul class="check-list">
            <li>A private chef who grills everything fresh and serves it buffet-style</li>
            <li>The full mobile BBQ setup, charcoal &amp; gas — nothing for you to buy</li>
            <li>Fresh food shopped that morning, cooked at your ${post.area} villa</li>
            <li>Complete setup and clean-up — you don't lift a finger</li>
          </ul>

          <h2>How it works</h2>
          <ol class="steps-list">
            <li><strong>Pick your menu &amp; price.</strong> Choose a set package or build your own on our <a href="menu.html">menu &amp; prices</a> page, or start from a <a href="budget.html?tier=impressive">budget option</a>.</li>
            <li><strong>Send it on WhatsApp.</strong> Your order and total pre-fill a message. We confirm your date, details and final price.</li>
            <li><strong>Secure the date.</strong> A 50% deposit holds your booking; the balance is paid on the day.</li>
            <li><strong>We fire up the grill.</strong> Your chef arrives in ${post.area}, cooks a fresh feast and tidies away.</li>
          </ol>

          <h2>${post.area} BBQ pricing &amp; delivery</h2>
          <p>Menus start from around <strong>$${SITE.fromUsd} USD per person</strong>, and the per-person price drops as your group grows (6–9, 10–19 and 20+ guests). A flat BBQ &amp; chef hire fee of IDR ${SITE.hireFeeIdr.toLocaleString("en-US")} applies to every booking — discounted for larger groups. ${deliveryLine} Our minimum booking is ${SITE.minGuests} guests, and there's no real maximum: we cater from intimate dinners to 200+ guest events.</p>
          <p><a href="menu.html">Browse the full menus &amp; prices →</a> &nbsp;·&nbsp; <a href="contact.html">Planning a big event? Get a tailored quote →</a></p>

          <div class="cta-band">
            <h2 style="color:#fff;margin-bottom:.4rem">Ready to book a BBQ in ${post.area}?</h2>
            <p style="color:var(--cream-dim);margin-bottom:1.2rem">Message us with your date, villa area and guest count — we reply quickly and can often cater same-day before ${SITE.bookingCutoff}.</p>
            <div class="btn-row" style="justify-content:center">
              <a class="btn btn--wa btn--lg" href="${attr(bookHref)}" target="_blank" rel="noopener" ${ONCLICK}>🟢 Chat on WhatsApp</a>
              <a class="btn btn--ghost-light btn--lg" href="menu.html">Build your BBQ →</a>
            </div>
          </div>

          <h2 id="faq">BBQ ${post.area} — FAQs</h2>
          <div class="accordion accordion--left">
        ${faqHtml}
          </div>

          <div class="related">
            <h3>More Bali areas we cater</h3>
            <div class="related-row">${relatedHtml}<a class="related-chip related-chip--all" href="blog.html">All areas →</a></div>
          </div>
        </div>
      </div>
    </article>
  </main>

${footer()}
</body>
</html>
`;
}

/* ---- render the blog index ---------------------------------------------- */
function renderIndex() {
  const url = SITE.domain + "/blog.html";
  const cards = POSTS.map((p) => {
    const zone = ZONES[p.zoneKey];
    const teaser = p.intro[0].split(". ")[0] + ".";
    return `      <a class="card blog-card reveal" href="bbq-${p.slug}.html">
        <div class="blog-card__body">
          <span class="eyebrow">BBQ ${p.area}</span>
          <h3>Villa &amp; at-home BBQ in ${p.area}</h3>
          <p class="text-muted">${teaser}</p>
          <span class="blog-card__meta">Delivery ${p.zoneKey === "confirm" ? "on request" : zone.fee} · from $${SITE.fromUsd} USD pp</span>
          <span class="blog-card__link">Read more →</span>
        </div>
      </a>`;
  }).join("\n");

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: POSTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: "BBQ " + p.area,
      url: SITE.domain + "/bbq-" + p.slug + ".html",
    })),
  };
  const jsonld = [
    localBusinessLD(null),
    itemList,
    breadcrumbLD([
      { name: "Home", url: SITE.domain + "/" },
      { name: "Blog", url },
    ]),
  ];

  return `<!DOCTYPE html>
<html lang="en">
${head({
    title: "BBQ Bali by Area — Villa & At-Home BBQ Catering Blog | BBQ Bali Home Service",
    description:
      "Villa and at-home BBQ catering across Bali, area by area — Canggu, Seminyak, Uluwatu, Ubud, Jimbaran and more. Tips, ideas and how to book your BBQ.",
    canonical: url,
    jsonld,
  })}
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${nav("blog.html")}

  <main id="main">
    <section class="section--tight band-charcoal">
      <div class="wrap center" style="padding-block:2.8rem">
        <nav class="crumbs crumbs--center" aria-label="Breadcrumb"><a href="index.html">Home</a> <span aria-hidden="true">›</span> <span>Blog</span></nav>
        <span class="eyebrow eyebrow--light">The Blog</span>
        <h1 style="color:#fff">BBQ Bali, area by area</h1>
        <p class="lead" style="margin-inline:auto;color:var(--cream-dim)">Villa and at-home BBQ catering right across Bali. Find your neighbourhood below to see why a private BBQ makes such a great party, family or celebration addition — and how to book it.</p>
        <div class="btn-row mt-2" style="justify-content:center">
          <a class="btn btn--primary btn--lg" href="menu.html">Menus &amp; prices</a>
          <a class="btn btn--wa btn--lg" data-wa data-wa-text="Hi BBQ Bali Home Service! I'd like to book a BBQ 🔥" target="_blank" rel="noopener" ${ONCLICK}>Book on WhatsApp</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="grid grid--3">
${cards}
        </div>
      </div>
    </section>

    <section class="section band-dark cta-strip">
      <div class="wrap reveal">
        <h2>Don't see your area?</h2>
        <p class="lead" style="margin-inline:auto">We cater villas right across Bali. Message us with your location and we'll sort delivery.</p>
        <div class="btn-row mt-2" style="justify-content:center">
          <a class="btn btn--wa btn--lg" data-wa data-wa-text="Hi BBQ Bali Home Service! I'd like to book a BBQ 🔥" target="_blank" rel="noopener" ${ONCLICK}>Ask on WhatsApp</a>
          <a class="btn btn--ghost-light btn--lg" href="contact.html">Contact us →</a>
        </div>
      </div>
    </section>
  </main>

${footer()}
</body>
</html>
`;
}

/* ---- sitemap ------------------------------------------------------------ */
function renderSitemap() {
  const lastmod = today();
  const staticPages = [
    { loc: "/", pri: "1.0" },
    { loc: "/menu.html", pri: "0.9" },
    { loc: "/budget.html", pri: "0.7" },
    { loc: "/about.html", pri: "0.7" },
    { loc: "/faq.html", pri: "0.6" },
    { loc: "/contact.html", pri: "0.7" },
    { loc: "/gallery.html", pri: "0.5" },
    { loc: "/blog.html", pri: "0.8" },
  ];
  const postPages = POSTS.map((p) => ({ loc: "/bbq-" + p.slug + ".html", pri: "0.8" }));
  const urls = staticPages.concat(postPages).map((u) =>
    `  <url>\n    <loc>${SITE.domain}${u.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${u.pri}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* ---- write everything --------------------------------------------------- */
function main() {
  let written = [];
  POSTS.forEach((p) => {
    const file = path.join(ROOT, "bbq-" + p.slug + ".html");
    fs.writeFileSync(file, renderPost(p));
    written.push("bbq-" + p.slug + ".html");
  });
  fs.writeFileSync(path.join(ROOT, "blog.html"), renderIndex());
  written.push("blog.html");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), renderSitemap());
  written.push("sitemap.xml");
  console.log("Generated " + written.length + " files:\n  " + written.join("\n  "));
}

main();
