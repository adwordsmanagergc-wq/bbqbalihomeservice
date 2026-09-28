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
const { SITE, ZONES, POSTS, PILLAR } = require("./blog-data");

const ROOT = path.join(__dirname, "..");
const GTAG_ID = "AW-846645441";
const GTAG_LABEL = "AW-846645441/Lwx1CK-v290cEMGR25MD";
const ONCLICK = 'onclick="return gtag_report_conversion(this.href)"';
const BUSINESS_ID = SITE.domain + "/#business";
const PUBLISHED = "2026-08-07";

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
  <link rel="preconnect" href="https://www.googletagmanager.com" />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
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
  <meta property="og:site_name" content="${attr(SITE.name)}" />
  <meta property="og:title" content="${attr(opts.title)}" />
  <meta property="og:description" content="${attr(opts.description)}" />
  <meta property="og:type" content="${opts.ogType || "article"}" />
  <meta property="og:url" content="${opts.canonical}" />
  <meta property="og:image" content="${SITE.domain}/${SITE.heroImage}" />
  <meta property="og:image:alt" content="A private chef grilling a fresh BBQ feast at a Bali villa" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(opts.title)}" />
  <meta name="twitter:description" content="${attr(opts.description)}" />
  <meta name="twitter:image" content="${SITE.domain}/${SITE.heroImage}" />
  <link rel="icon" href="assets/img/favicon.png" type="image/png" /><link rel="apple-touch-icon" href="assets/img/favicon.png" />
  ${styles}
  ${ld}
</head>`;
}

/* ---- shared nav + footer (with Blog link) ------------------------------- */
function nav(current) {
  const links = [
    ["/", "Home"],
    ["menu.html", "Menu &amp; Prices"],
    ["about.html", "How It Works"],
    [SITE.instagram, "Gallery", true],
    ["faq.html", "FAQ"],
    ["blog.html", "Areas"],
    ["contact.html", "Contact"],
  ].map(([href, label, ig]) => {
    if (ig) return `<a href="${href}" data-ig target="_blank" rel="noopener">${label}</a>`;
    const cur = href === current ? ' aria-current="page"' : "";
    return `<a href="${href}"${cur}>${label}</a>`;
  }).join("");
  return `  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="/" aria-label="BBQ Bali Home Service home"><span class="brand__mark" aria-hidden="true"><img src="assets/img/logo.png" alt="" /></span><span class="brand__name">BBQ Bali Home Service<small>BBQ Hire Bali</small></span></a>
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
        <div><a class="brand" href="/"><span class="brand__mark" aria-hidden="true"><img src="assets/img/logo.png" alt="" /></span><span class="brand__name">BBQ Bali Home Service<small>BBQ Hire Bali</small></span></a><p class="text-muted" style="margin-top:1rem;font-size:.9rem">At-home BBQ &amp; private chef hire across Bali.</p></div>
        <div><h4>Explore</h4><ul class="footer-links"><li><a href="menu.html">Menu &amp; Prices</a></li><li><a href="about.html">How It Works</a></li><li><a href="https://www.instagram.com/bbqbalihomeservice/" data-ig target="_blank" rel="noopener">Gallery</a></li><li><a href="faq.html">FAQ</a></li><li><a href="blog.html">Areas</a></li><li><a href="contact.html">Contact</a></li></ul></div>
        <div class="footer-contact"><h4>Get in touch</h4><a data-wa data-wa-text="Hi BBQ Bali Home Service!" target="_blank" rel="noopener" ${ONCLICK}>🟢 WhatsApp <span data-wa-display></span></a><a data-email data-email-text>✉️ email</a><a data-ig target="_blank" rel="noopener">📸 @bbqbalihomeservice</a></div>
      </div>
      <div class="footer-bottom"><span>© <span data-year>2026</span> BBQ Bali Home Service.</span><span>Bali BBQ &amp; Chef Hire</span></div>
    </div>
  </footer>
  <a class="wa-float" data-wa data-wa-text="Hi BBQ Bali Home Service! I'd like to book a BBQ 🔥" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" ${ONCLICK}><svg class="wa-float__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg><span>WhatsApp</span></a>

  <script src="data/pricing.js"></script>
  <script src="js/main.js"></script>
  <!-- Vercel Web Analytics (static-site snippet) -->
  <script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
  <script defer src="/_vercel/insights/script.js"></script>`;
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
    datePublished: PUBLISHED,
    dateModified: today(),
    author: { "@type": "Organization", name: SITE.name, "@id": BUSINESS_ID },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      "@id": BUSINESS_ID,
      logo: { "@type": "ImageObject", url: SITE.domain + "/assets/img/logo.png" },
    },
    mainEntityOfPage: url,
    about: "BBQ catering in " + post.area + ", Bali",
  };
}
function areaServiceLD(area) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "BBQ catering",
    name: "BBQ Catering " + area,
    provider: { "@id": BUSINESS_ID },
    areaServed: { "@type": "Place", name: area + ", Bali" },
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
    areaServiceLD(post.area),
    articleLD(post, url),
    faqLD(faqs),
    breadcrumbLD([
      { name: "Home", url: SITE.domain + "/" },
      { name: "Areas", url: SITE.domain + "/blog.html" },
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
    title: `BBQ ${post.area} — Villa & At-Home BBQ Catering`,
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
          <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="blog.html">Areas</a> <span aria-hidden="true">›</span> <span>BBQ ${post.area}</span></nav>
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

          <h2>Local know-how for a ${post.area} BBQ</h2>
          <p>Getting to you is easy: ${post.zoneKey === "confirm" ? "we confirm your delivery fee on WhatsApp once we have the villa address" : "delivery is a flat " + zone.fee}. Around ${colour}, most villas come with a pool deck, garden or rooftop that suits a mobile grill, so our chef can set up, cook and pack down without disrupting your stay. Share the villa access details when you book and we handle the rest.</p>
          <p>We also cater nearby: ${related.map((r) => `<a href="bbq-${r.slug}.html">BBQ ${r.area}</a>`).join(", ")}.</p>
          <!-- TODO(${post.area}): add a real event photo from ${post.area} and a short local guest review here. -->

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

/* ---- render the flagship "BBQ Catering Bali" pillar post ---------------- */
function renderPillar() {
  const P = PILLAR;
  const url = SITE.domain + "/" + P.slug + ".html";
  const bookText = "Hi BBQ Bali Home Service! 🔥 I'd like to book BBQ catering in Bali. Could you help with availability and a price?";
  const bookHref = waHref(bookText);

  const pkgCards = P.packages.map((pk) =>
    `<article class="card pkg">
            <div class="pkg__body">
              <h3>${pk.name}</h3>
              <div class="pkg__sub">${pk.price} · ${pk.min}</div>
              <p class="text-muted" style="font-size:.92rem">${pk.desc}</p>
              <a class="btn btn--primary" href="${pk.href}" style="margin-top:auto;align-self:flex-start">Choose &amp; order →</a>
            </div>
          </article>`).join("\n          ");

  const areaLinks = POSTS.map((p) => `<a class="related-chip" href="bbq-${p.slug}.html">BBQ ${p.area}</a>`).join("");

  const faqHtml = P.faqs.map((f, i) => {
    const pid = "faq-panel-" + i;
    return `<div class="acc-item">
          <button class="acc-trigger" aria-expanded="false" aria-controls="${pid}"><span>${f.q}</span><span class="acc-icon" aria-hidden="true"></span></button>
          <div class="acc-panel" id="${pid}" role="region"><div class="acc-panel__inner"><p>${f.a}</p></div></div>
        </div>`;
  }).join("\n        ");

  const jsonld = [
    {
      "@context": "https://schema.org", "@type": "Article",
      headline: P.h1, description: P.metaDesc, image: SITE.domain + "/" + SITE.heroImage,
      datePublished: "2026-08-13", dateModified: today(),
      author: { "@type": "Organization", name: SITE.name, "@id": BUSINESS_ID },
      publisher: { "@type": "Organization", name: SITE.name, "@id": BUSINESS_ID, logo: { "@type": "ImageObject", url: SITE.domain + "/assets/img/logo.png" } },
      mainEntityOfPage: url, about: "BBQ catering in Bali",
    },
    {
      "@context": "https://schema.org", "@type": "Service",
      serviceType: "BBQ catering", provider: { "@id": BUSINESS_ID },
      areaServed: "Bali, Indonesia", name: "BBQ Catering Bali",
      offers: P.packages.map((pk) => ({ "@type": "Offer", name: pk.name, description: pk.desc })),
    },
    faqLD(P.faqs),
    breadcrumbLD([
      { name: "Home", url: SITE.domain + "/" },
      { name: "Areas", url: SITE.domain + "/blog.html" },
      { name: P.h1, url },
    ]),
  ];

  return `<!DOCTYPE html>
<html lang="en">
${head({ title: P.title, description: P.metaDesc, canonical: url, jsonld })}
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${nav("blog.html")}

  <main id="main">
    <article class="blog-post">
      <header class="section--tight band-charcoal">
        <div class="wrap" style="padding-block:2.4rem 2rem">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="blog.html">Areas</a> <span aria-hidden="true">›</span> <span>${P.h1}</span></nav>
          <span class="eyebrow eyebrow--light">Private BBQ &amp; Chef Hire · All of Bali</span>
          <h1 style="color:#fff">${P.h1}</h1>
          <p class="lead" style="color:var(--cream-dim)">${P.lead}</p>
          <div class="btn-row mt-2">
            <a class="btn btn--wa btn--lg" href="${attr(bookHref)}" target="_blank" rel="noopener" ${ONCLICK}>🟢 Book BBQ catering</a>
            <a class="btn btn--ghost-light btn--lg" href="menu.html">See menus &amp; prices →</a>
          </div>
        </div>
      </header>

      <div class="section">
        <div class="wrap blog-prose">
          ${P.intro.map((p) => `<p>${p}</p>`).join("\n          ")}

          <h2>Our Bali BBQ catering packages</h2>
          <p>Every package is cooked fresh at your villa and served buffet-style. Browse them all on our <a href="menu.html">menu &amp; prices</a> page, or start from a <a href="/">budget option on the home page</a>.</p>
        </div>
        <div class="wrap" style="margin-top:1.4rem">
          <div class="grid grid--3">
          ${pkgCards}
          </div>
        </div>

        <div class="wrap blog-prose" style="margin-top:2rem">
          <h2>What's included</h2>
          <ul class="check-list">
            <li>A private chef who grills everything fresh and serves it buffet-style</li>
            <li>The full mobile BBQ setup, charcoal &amp; gas — nothing for you to buy</li>
            <li>Fresh food shopped that morning and cooked at your villa</li>
            <li>Complete setup and clean-up — you don't lift a finger</li>
          </ul>

          <h2>How our BBQ catering works</h2>
          <ol class="steps-list">
            <li><strong>Pick your menu &amp; price.</strong> Choose a package or build your own on the <a href="menu.html">menu &amp; prices</a> page, or a <a href="/">budget option</a> from the home page.</li>
            <li><strong>Send it on WhatsApp.</strong> Your order and total pre-fill a message. We confirm your date, details and final price.</li>
            <li><strong>Secure the date.</strong> A 50% deposit holds your booking; the balance is paid on the day.</li>
            <li><strong>We fire up the grill.</strong> Your chef arrives, cooks a fresh feast and tidies away. Read more on <a href="about.html">how it works</a>.</li>
          </ol>

          <h2>BBQ catering prices in Bali</h2>
          <p>Menus start from around <strong>$${SITE.fromUsd} USD per person</strong> (about IDR 200,000), dropping as your group grows across the 6–9, 10–19 and 20+ guest tiers. A flat BBQ &amp; chef hire fee of IDR ${SITE.hireFeeIdr.toLocaleString("en-US")} applies to every booking — discounted <strong>20% for 10+ guests</strong> and <strong>50% for 20+</strong>, and at 30+ guests we add a second BBQ and an extra chef. A delivery fee applies by area (from IDR 200,000). See exact totals live in IDR and USD on the <a href="menu.html">menu &amp; prices</a> and <a href="budget.html?tier=impressive">budget</a> pages.</p>

          <h2>Areas we cover across Bali</h2>
          <p>We bring BBQ catering to villas right across the island. Read the guide for your area:</p>
          <div class="related-row" style="margin:.4rem 0 .6rem">${areaLinks}</div>

          <h2>Events we cater</h2>
          <p>From relaxed villa dinners to full celebrations — birthdays, hen and stag weekends, corporate retreats, family holidays and <strong>weddings for 200+ guests</strong>. Planning something big? <a href="contact.html">Request a tailored quote</a> and we'll build a bespoke menu with extra chefs, a bar and waitstaff.</p>

          <div class="cta-band">
            <h2 style="color:#fff;margin-bottom:.4rem">Ready to book BBQ catering in Bali?</h2>
            <p style="color:var(--cream-dim);margin-bottom:1.2rem">Message us with your date, villa area and guest count — we reply quickly and can often cater same-day before ${SITE.bookingCutoff}.</p>
            <div class="btn-row" style="justify-content:center">
              <a class="btn btn--wa btn--lg" href="${attr(bookHref)}" target="_blank" rel="noopener" ${ONCLICK}>🟢 Chat on WhatsApp</a>
              <a class="btn btn--ghost-light btn--lg" href="menu.html">Build your BBQ →</a>
            </div>
          </div>

          <h2 id="faq">BBQ catering Bali — FAQs</h2>
          <p class="text-muted" style="font-size:.92rem">More answers on our <a href="faq.html">full FAQ page</a>.</p>
          <div class="accordion accordion--left">
        ${faqHtml}
          </div>

          <div class="related">
            <h3>Explore more</h3>
            <div class="related-row">
              <a class="related-chip" href="/">Home</a>
              <a class="related-chip" href="menu.html">Menu &amp; prices</a>
              <a class="related-chip" href="faq.html">FAQ</a>
              <a class="related-chip" href="contact.html">Contact</a>
              <a class="related-chip related-chip--all" href="blog.html">All areas →</a>
            </div>
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
    itemListElement: [{ "@type": "ListItem", position: 1, name: PILLAR.h1, url: SITE.domain + "/" + PILLAR.slug + ".html" }].concat(
      POSTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: "BBQ " + p.area,
        url: SITE.domain + "/bbq-" + p.slug + ".html",
      }))),
  };
  const jsonld = [
    itemList,
    breadcrumbLD([
      { name: "Home", url: SITE.domain + "/" },
      { name: "Areas", url },
    ]),
  ];

  return `<!DOCTYPE html>
<html lang="en">
${head({
    title: "Areas We Serve — BBQ Catering Across Bali",
    description:
      "The Bali areas we serve for villa and at-home BBQ catering — Canggu, Seminyak, Uluwatu, Ubud, Jimbaran, Sanur and more. Find your area and book your BBQ.",
    canonical: url,
    ogType: "website",
    jsonld,
  })}
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${nav("blog.html")}

  <main id="main">
    <section class="section--tight band-charcoal">
      <div class="wrap center" style="padding-block:2.8rem">
        <nav class="crumbs crumbs--center" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <span>Areas</span></nav>
        <span class="eyebrow eyebrow--light">Areas we serve</span>
        <h1 style="color:#fff">BBQ catering across Bali, area by area</h1>
        <p class="lead" style="margin-inline:auto;color:var(--cream-dim)">Villa and at-home BBQ catering right across Bali. Find your neighbourhood below to see why a private BBQ makes such a great party, family or celebration addition, and how to book it.</p>
        <div class="btn-row mt-2" style="justify-content:center">
          <a class="btn btn--primary btn--lg" href="menu.html">Menus &amp; prices</a>
          <a class="btn btn--wa btn--lg" data-wa data-wa-text="Hi BBQ Bali Home Service! I'd like to book a BBQ 🔥" target="_blank" rel="noopener" ${ONCLICK}>Book on WhatsApp</a>
        </div>
      </div>
    </section>

    <section class="section" style="padding-bottom:0">
      <div class="wrap">
        <a class="card blog-card blog-card--feature reveal" href="${PILLAR.slug}.html">
          <div class="blog-card__body">
            <span class="eyebrow">Start here · Guide</span>
            <h2 style="margin:.1rem 0 .5rem">${PILLAR.h1}: the complete guide</h2>
            <p class="text-muted">${PILLAR.metaDesc}</p>
            <span class="blog-card__link">Read the full guide →</span>
          </div>
        </a>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="center" style="margin-bottom:1.6rem"><span class="eyebrow">By area</span><h2>Villa BBQ, neighbourhood by neighbourhood</h2></div>
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
    { loc: "/" },
    { loc: "/menu.html" },
    { loc: "/about.html" },
    { loc: "/faq.html" },
    { loc: "/contact.html" },
    { loc: "/gallery.html" },
    { loc: "/blog.html" },
    { loc: "/" + PILLAR.slug + ".html" },
  ];
  const postPages = POSTS.map((p) => ({ loc: "/bbq-" + p.slug + ".html" }));
  const urls = staticPages.concat(postPages).map((u) =>
    `  <url>\n    <loc>${SITE.domain}${u.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
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
  fs.writeFileSync(path.join(ROOT, PILLAR.slug + ".html"), renderPillar());
  written.push(PILLAR.slug + ".html");
  fs.writeFileSync(path.join(ROOT, "blog.html"), renderIndex());
  written.push("blog.html");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), renderSitemap());
  written.push("sitemap.xml");
  console.log("Generated " + written.length + " files:\n  " + written.join("\n  "));
}

main();
