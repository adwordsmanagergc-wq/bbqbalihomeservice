/* ============================================================================
 * SEO INJECTOR (one-off, idempotent) — adds canonical, Open Graph, Twitter
 * cards, preconnect and per-page JSON-LD to the hand-written sub-pages.
 * Safe to re-run: every insertion is guarded by a marker.
 *   node tools/seo-inject.js
 * ========================================================================== */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DOMAIN = "https://bbqbalihomeservice.com";
const OG_IMAGE = DOMAIN + "/assets/img/bbq-in-action.jpg";
const OG_ALT = "A private chef grilling a fresh BBQ feast at a Bali villa";
const SITE_NAME = "BBQ Bali Home Service";
const BUSINESS_ID = DOMAIN + "/#business";

function esc(s) { return String(s).replace(/&(?!amp;|quot;|lt;|gt;|#)/g, "&amp;").replace(/"/g, "&quot;"); }
function ldTag(o) { return '<script type="application/ld+json">' + JSON.stringify(o) + "</script>"; }
function crumb(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })) };
}

const faqItems = [
  ["What's included in the price?", "Everything you need for the BBQ: your private chef, the full BBQ setup, charcoal and gas, all the food, buffet-style serving, plus setup and clean-up. You just provide the space and the guests."],
  ["How does it work?", "Build your menu and get a live price using our menu builder, then send your order on WhatsApp. We confirm the date and details, you pay a 50% deposit to secure it, and on the day your chef arrives, cooks a fresh feast and cleans up afterwards."],
  ["How much does it cost?", "Menus start from around $11 USD per person, and the per-person price drops as your group grows (6–9, 10–19 and 20+ guest tiers). A flat chef & BBQ hire fee applies to every booking, and an out-of-area delivery fee may apply depending on your location."],
  ["What's the minimum number of guests?", "Our minimum booking is 6 guests. There's no real maximum — we cater everything from intimate dinners to 200+ guest weddings."],
  ["Can I customise the menu?", "Absolutely. Choose one of our set packages, or build your own to pick your own proteins, sides and sauces. Popular proteins include sirloin steak, prawns, pork ribs, chicken, sausages, red snapper and octopus."],
  ["Do you cater large events and weddings?", "Yes — we regularly cater parties and weddings for 200+ guests. For large events, send us an enquiry through the contact page or WhatsApp and we'll put together a tailored quote."],
  ["Do you offer vegetarian or vegan options?", "We do. You can add vegetarian/vegan plates as an extra — grilled vegetables, tofu and plant-based skewers — or let us know your needs when you book."],
  ["Which areas do you cover, and is there a delivery fee?", "We cover most of Bali. A delivery fee applies based on your area — IDR 200,000 around Canggu, Berawa, Pererenan, Seminyak and Kerobokan; IDR 250,000 for Umalas, Kuta, Legian and Jimbaran; and IDR 375,000 for Ubud, Gianyar, Sanur and Uluwatu. Somewhere else? We'll confirm on WhatsApp."],
  ["Can I book for the same day?", "Often, yes. Same-day BBQ hire is possible as long as your booking is confirmed before 11am — that gives us time to shop for fresh ingredients and prepare. After 11am we'll book you for the next available day."],
  ["How do deposits and payment work?", "A 50% deposit secures your date, with the remaining 50% paid on the day of your BBQ. We accept cash, bank transfer or crypto. No payment is taken through this website — everything is arranged directly with us."],
  ["What's your cancellation policy?", "Cancellations before the event day incur a fee of IDR 750,000 / USD 50. Cancellations on the day of the event forfeit the full deposit, as by then we've booked staff, secured delivery and bought your food fresh that morning."],
  ["What do I need to provide?", "Just a suitable, safe space for the BBQ and your guests. It's the host's responsibility to make sure the area works for grilling and to plan around Bali's weather and conditions."],
  ["What if it rains?", "Bali weather can be unpredictable, so we recommend a covered or sheltered spot for the grill and dining area where possible. Chat with us ahead of time and we'll help you plan a setup that works rain or shine."],
];
const faqPage = { "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqItems.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };

const menuService = { "@context": "https://schema.org", "@type": "Service", serviceType: "BBQ catering",
  name: "Bali BBQ Catering Packages", provider: { "@id": BUSINESS_ID }, areaServed: "Bali, Indonesia",
  hasOfferCatalog: { "@type": "OfferCatalog", name: "BBQ packages", itemListElement: [
    { "@type": "Offer", name: "Impressive Budget Option", priceCurrency: "IDR", price: "200000", description: "Per person, min 10 guests" },
    { "@type": "Offer", name: "Magic Middle of the Range", priceCurrency: "IDR", price: "450000", description: "Per person, min 6 guests" },
    { "@type": "Offer", name: "Premium (Surf & Turf)", priceCurrency: "IDR", price: "600000", description: "Per person, min 6 guests" },
  ] } };

const PAGES = {
  "menu.html": {
    title: "BBQ Menu &amp; Prices in Bali — Packages from $11 pp",
    desc: "Our Bali BBQ catering packages, menus and optional extras — from $11 USD per person. Pick a package, set your guest count and area, and order on WhatsApp.",
    canonical: DOMAIN + "/menu.html", ogType: "website",
    jsonld: [crumb([{ name: "Home", url: DOMAIN + "/" }, { name: "Menu & Prices", url: DOMAIN + "/menu.html" }]), menuService],
  },
  "about.html": {
    title: "How Our At-Home Bali BBQ Works | BBQ Bali Home Service",
    desc: "How our at-home Bali BBQ works: we bring the BBQ, chef, coals and food to your villa, cook a fresh buffet-style feast and clean up. Same-day booking before 11am.",
    canonical: DOMAIN + "/about.html", ogType: "website",
    jsonld: [crumb([{ name: "Home", url: DOMAIN + "/" }, { name: "How It Works", url: DOMAIN + "/about.html" }])],
  },
  "faq.html": {
    title: "Bali BBQ Catering FAQ — Prices, Areas &amp; Booking",
    desc: "Answers to common questions about our at-home Bali BBQ: what's included, pricing, minimum guests, delivery areas, deposits, same-day booking and more.",
    canonical: DOMAIN + "/faq.html", ogType: "website",
    jsonld: [crumb([{ name: "Home", url: DOMAIN + "/" }, { name: "FAQ", url: DOMAIN + "/faq.html" }]), faqPage],
  },
  "contact.html": {
    title: "Contact &amp; Get a Quote — BBQ Bali Home Service",
    desc: "Book your Bali BBQ or request a quote for large groups and weddings (200+). WhatsApp click-to-chat, email, and an enquiry form for tailored catering.",
    canonical: DOMAIN + "/contact.html", ogType: "website",
    jsonld: [crumb([{ name: "Home", url: DOMAIN + "/" }, { name: "Contact", url: DOMAIN + "/contact.html" }])],
  },
  "gallery.html": {
    title: "BBQ Gallery — Bali Villa Feasts &amp; Chefs | BBQ Bali Home Service",
    desc: "See our flame-grilled feasts, private chefs and villa BBQ setups across Bali. Straight from our Instagram, @bbqbalihomeservice.",
    canonical: DOMAIN + "/gallery.html", ogType: "website",
    jsonld: [crumb([{ name: "Home", url: DOMAIN + "/" }, { name: "Gallery", url: DOMAIN + "/gallery.html" }])],
  },
  "budget.html": {
    title: "Choose Your BBQ Budget in Bali | BBQ Bali Home Service",
    desc: "See the menu and price for your chosen Bali BBQ budget option. Pick your guest count and location, then chat with our team to book.",
    canonical: DOMAIN + "/budget.html", ogType: "website",
    jsonld: [crumb([{ name: "Home", url: DOMAIN + "/" }, { name: "Budget Options", url: DOMAIN + "/budget.html" }])],
  },
};

function seoBlock(p) {
  const L = ["  <!-- SEO:injected -->"];
  L.push(`  <link rel="canonical" href="${p.canonical}" />`);
  L.push(`  <meta property="og:site_name" content="${SITE_NAME}" />`);
  L.push(`  <meta property="og:title" content="${esc(p.title)}" />`);
  L.push(`  <meta property="og:description" content="${esc(p.desc)}" />`);
  L.push(`  <meta property="og:type" content="${p.ogType}" />`);
  L.push(`  <meta property="og:url" content="${p.canonical}" />`);
  L.push(`  <meta property="og:image" content="${OG_IMAGE}" />`);
  L.push(`  <meta property="og:image:alt" content="${OG_ALT}" />`);
  L.push(`  <meta property="og:locale" content="en_US" />`);
  L.push(`  <meta name="twitter:card" content="summary_large_image" />`);
  L.push(`  <meta name="twitter:title" content="${esc(p.title)}" />`);
  L.push(`  <meta name="twitter:description" content="${esc(p.desc)}" />`);
  L.push(`  <meta name="twitter:image" content="${OG_IMAGE}" />`);
  p.jsonld.forEach((o) => L.push("  " + ldTag(o)));
  return L.join("\n");
}

const GTAG_ANCHOR = "  <!-- Google tag (gtag.js) -->";
const PRECONNECT = '  <link rel="preconnect" href="https://www.googletagmanager.com" />\n  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />';
const THEME = '  <meta name="theme-color" content="#14100e" />';

Object.keys(PAGES).forEach((file) => {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, "utf8");
  const p = PAGES[file];

  // 1. Update <title> and description (first occurrence)
  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + p.title + "</title>");
  html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, '<meta name="description" content="' + esc(p.desc) + '" />');

  // 2. preconnect before the gtag tag
  if (!/rel="preconnect"/.test(html)) html = html.replace(GTAG_ANCHOR, PRECONNECT + "\n" + GTAG_ANCHOR);

  // 3. SEO block after theme-color
  if (!/SEO:injected/.test(html)) html = html.replace(THEME, THEME + "\n" + seoBlock(p));

  fs.writeFileSync(fp, html);
  console.log("SEO ✓ " + file);
});
