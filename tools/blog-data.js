/* ============================================================================
 * BLOG CONTENT — per-area SEO posts
 * ----------------------------------------------------------------------------
 *  👉  ADD OR EDIT A BLOG POST HERE, then run:  node tools/build-blog.js
 *      That regenerates blog.html (the index) and every bbq-<slug>.html post,
 *      and refreshes sitemap.xml. You never edit the generated HTML by hand.
 *
 *  Each entry targets the search term "BBQ <area>" for one main Bali area.
 *  Keep the copy UNIQUE per area (Google penalises duplicated pages) — the
 *  intro, "why here" and area-specific FAQs below are what make each post rank.
 *
 *  Shared, non-area-specific values (contact details, hire fee, min guests)
 *  live in SITE below so they only need changing in one place.
 * ========================================================================== */

const SITE = {
  domain: "https://bbqbalihomeservice.com",
  name: "BBQ Bali Home Service",
  tagline: "Bali BBQ & Chef Hire",
  whatsappNumber: "6281776666692",
  whatsappDisplay: "+62 817 7666 6692",
  email: "gedebarosa04@gmail.com",
  instagram: "https://www.instagram.com/bbqbalihomeservice/",
  hireFeeIdr: 1800000,
  minGuests: 6,
  fromUsd: 11,
  bookingCutoff: "11am",
  logo: "assets/img/logo.svg",
  heroImage: "assets/img/bbq-in-action.jpg",
};

/* Delivery zones (mirror data/pricing.js AREAS). Referenced by each post. */
const ZONES = {
  core:   { fee: "IDR 200,000", label: "Canggu, Berawa, Pererenan, Seminyak & Kerobokan zone" },
  umalas: { fee: "IDR 250,000", label: "Umalas, Kuta, Legian & Jimbaran zone" },
  far:    { fee: "IDR 375,000", label: "Ubud, Gianyar, Sanur & Uluwatu zone" },
  confirm:{ fee: "a delivery fee we'll confirm on WhatsApp", label: "greater Bali" },
};

/*  Each POST:
 *    slug        → file name (bbq-<slug>.html) and URL keyword
 *    area        → the suburb/area name, used in the H1 "BBQ <area>"
 *    zoneKey     → which ZONES entry applies for the delivery line
 *    metaDesc    → unique <meta description> (~150 chars)
 *    intro       → array of unique opening paragraphs (HTML-safe strings)
 *    whyTitle    → unique H2 for the "why here" section
 *    why         → array of unique paragraphs about the area + BBQ fit
 *    occasions   → 4 event types that suit that area (unique-ish)
 *    localColour → short list of recognisable local spots/landmarks (for flavour)
 *    faqs        → 2–3 AREA-SPECIFIC FAQs (shared FAQs are added by the builder)
 */
const POSTS = [
  {
    slug: "canggu",
    area: "Canggu",
    zoneKey: "core",
    metaDesc:
      "At-home & villa BBQ catering in Canggu, Bali. A private chef brings the grill, food & setup to your villa. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Canggu runs on good food, good waves and long afternoons that drift into the evening — and nothing suits that rhythm better than a BBQ right at your villa. Instead of squeezing a big group into a busy Berawa restaurant, you keep everyone by the pool while a private chef fires up the grill a few steps away.",
      "We bring the whole show to you: the BBQ, the charcoal and gas, fresh food bought that morning, and a chef who cooks it all buffet-style and cleans up before they leave. You just supply the villa and the crew.",
    ],
    whyTitle: "Why a villa BBQ works so well in Canggu",
    why: [
      "Canggu is villa country. Most stays here come with a pool deck, a garden or a rooftop — exactly the kind of space a mobile BBQ is built for. Rather than book taxis into town and split the table, you host at home and the party never has to move.",
      "It's also a town of gatherings: surf crews, digital-nomad birthdays, villa reunions and sunset send-offs. A grill full of satay, steak and prawns turns any of those into an event, and because we scale from 6 to 200+ guests, it works for an intimate dinner or a full villa takeover.",
    ],
    occasions: [
      "Poolside villa birthdays in Berawa & Batu Bolong",
      "Digital-nomad & co-living group dinners",
      "Post-surf feasts after Echo Beach sessions",
      "Villa reunions and farewell parties",
    ],
    localColour: ["Batu Bolong", "Berawa", "Echo Beach", "Pererenan border", "the Shortcut"],
    faqs: [
      {
        q: "Do you deliver a BBQ to villas in Canggu?",
        a: "Yes — Canggu is in our core service zone, so delivery is a flat IDR 200,000 on top of your food and hire. We regularly cater villas around Batu Bolong, Berawa, Padang Linjong and the Shortcut.",
      },
      {
        q: "Can you cater a big villa party in Canggu?",
        a: "Absolutely. We cater everything from a 6-person dinner to 200+ guest villa parties. For larger Canggu events we can add a second BBQ and extra chefs to keep the food flowing.",
      },
    ],
  },
  {
    slug: "seminyak",
    area: "Seminyak",
    zoneKey: "core",
    metaDesc:
      "Private villa BBQ & chef hire in Seminyak, Bali. Restaurant-quality surf & turf grilled at your villa. From $11 USD pp — book in a quick WhatsApp chat.",
    intro: [
      "Seminyak does things with a bit of polish — boutique villas, beach clubs and some of the island's best dining. A private BBQ at your villa fits right in: the same restaurant-quality plates, minus the reservation, the taxi and the check.",
      "Our chef arrives with the grill, the charcoal and gas, and fresh produce bought that day, then serves everything buffet-style and tidies the space before heading off. You get a proper feast without leaving the villa.",
    ],
    whyTitle: "Seminyak villa BBQs, done properly",
    why: [
      "This is one of Bali's most established villa neighbourhoods, which means space to host — private pools, styled gardens and rooftop terraces made for entertaining. A mobile BBQ turns that space into the venue.",
      "Seminyak crowds tend to want a step up, so our Surf & Turf spread — sirloin steak, prawns and whole red snapper — is a favourite here. Pair it with a bartender or waitstaff add-on and a villa dinner starts to feel like a private restaurant.",
    ],
    occasions: [
      "Upscale villa dinner parties",
      "Hen weekends & milestone birthdays",
      "Sunset celebrations near Petitenget",
      "Anniversary & proposal dinners",
    ],
    localColour: ["Petitenget", "Eat Street (Kayu Aya)", "Oberoi", "Double Six border"],
    faqs: [
      {
        q: "How much is BBQ delivery to a Seminyak villa?",
        a: "Seminyak sits in our core zone, so delivery is a flat IDR 200,000. That covers bringing the full BBQ setup, chef and food to villas around Petitenget, Oberoi and Kayu Aya.",
      },
      {
        q: "Can you make a Seminyak villa dinner feel like a restaurant?",
        a: "Yes — go for the Surf & Turf menu and add a professional bartender and waitstaff. Your chef plates everything fresh from the grill while the team looks after your guests.",
      },
    ],
  },
  {
    slug: "berawa",
    area: "Berawa",
    zoneKey: "core",
    metaDesc:
      "Family & villa BBQ catering in Berawa, Canggu. A chef brings the grill and food to your villa — great for kids' parties & group dinners. From $11 USD pp.",
    intro: [
      "Berawa has become one of Canggu's most family-friendly corners — gated villa complexes, beach clubs and a school-run community of expats and long-stayers. It's a neighbourhood built for hosting, and an at-home BBQ is about as easy as entertaining gets.",
      "We handle everything: the BBQ, the fuel, fresh food and a chef who grills, serves and cleans up. Parents relax, kids run around the garden, and nobody has to book a table or drive anywhere.",
    ],
    whyTitle: "A family-friendly BBQ in Berawa",
    why: [
      "With so many family villas and residential compounds around Berawa, a mobile BBQ suits the way people actually live here — casual, at home, with room for the kids. Our Package 1 mixed grill (burgers, hot dogs, wings and sausages) is a guaranteed crowd-pleaser for younger guests.",
      "It scales up just as easily for the grown-up gatherings Berawa is known for: villa birthdays, team dinners and weekend get-togethers near Finns and Atlas. Bigger group? Per-person pricing drops as the headcount grows.",
    ],
    occasions: [
      "Kids' birthday parties in gated villa complexes",
      "Family & multi-generational dinners",
      "Expat community & school-crew get-togethers",
      "Weekend villa gatherings near Finns",
    ],
    localColour: ["Finns Beach Club", "Atlas", "Pantai Berawa", "Padang Linjong"],
    faqs: [
      {
        q: "Do you cater kids' parties in Berawa?",
        a: "We do — our Package 1 mixed grill (burgers, hot dogs, chicken wings and sausages) is a hit with kids, and we can add fries, dessert platters and soft drinks. Berawa is in our core zone, so delivery is a flat IDR 200,000.",
      },
      {
        q: "Can you cater inside a gated villa complex in Berawa?",
        a: "Yes. Just let us know the complex and any access details when you book and we'll coordinate arrival, setup and clean-up around the property's rules.",
      },
    ],
  },
  {
    slug: "pererenan",
    area: "Pererenan",
    zoneKey: "core",
    metaDesc:
      "Villa BBQ & private chef hire in Pererenan, Bali. Fresh-grilled feasts brought to your rice-field villa. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Pererenan is Canggu's quieter, greener neighbour — rice-field villas, a slower pace and a growing line-up of good cafes. It's the kind of place you settle into for a longer stay, and a villa BBQ makes the most of those calm evenings at home.",
      "Our chef brings the grill, the charcoal and gas and fresh food bought that morning, cooks it buffet-style and leaves the space spotless. All you do is gather your people.",
    ],
    whyTitle: "Slow evenings, big feasts in Pererenan",
    why: [
      "The appeal of Pererenan is space and quiet — rice-paddy views, private pools and villas set back from the noise. That's a perfect backdrop for a relaxed grill dinner where the evening unfolds on its own time.",
      "Because it's a longer-stay area, we see plenty of intimate villa dinners, small retreats and welcome feasts here. Start from 6 guests, choose a set menu or build your own, and we bring the whole kitchen to the paddies.",
    ],
    occasions: [
      "Intimate rice-field villa dinners",
      "Small retreat & workshop group meals",
      "Welcome feasts for long-stay villas",
      "Quiet-night birthdays & anniversaries",
    ],
    localColour: ["Pererenan Beach", "Nyanyi", "Tibubeneng border", "the rice paddies"],
    faqs: [
      {
        q: "Is Pererenan within your delivery area?",
        a: "Yes — Pererenan is in our core service zone, so delivery is a flat IDR 200,000 on top of food and hire. We reach villas across the rice-field lanes and down toward Pererenan Beach.",
      },
      {
        q: "Can I build a custom menu for a Pererenan villa dinner?",
        a: "Definitely. Choose a set package or build your own with your pick of proteins, sides and sauces, then send the order on WhatsApp and we'll confirm everything before the day.",
      },
    ],
  },
  {
    slug: "umalas",
    area: "Umalas",
    zoneKey: "umalas",
    metaDesc:
      "At-home BBQ catering in Umalas, Bali. A private chef brings the grill and food to your villa — ideal for family dinners & birthdays. From $11 USD pp.",
    intro: [
      "Umalas sits in the calm pocket between Canggu and Seminyak — residential, leafy and full of family villas and long-term rentals. It's a neighbourhood of home cooks and hosts, which makes an at-home BBQ feel completely natural.",
      "We arrive with the full BBQ setup, fresh food and a chef to grill, serve and clean up. No booking a table, no driving into town — just a feast in your own garden.",
    ],
    whyTitle: "The easy way to host in Umalas",
    why: [
      "Umalas is where a lot of Bali's expat families actually live, so the gatherings here are the homely kind: birthdays, Sunday dinners, farewells and get-togethers with the neighbours. A mobile BBQ takes all the work off the host.",
      "You choose the menu — from the value Package 1 to a premium Surf & Turf — and we handle the rest. Bigger group of 10 or 20+? The per-person price drops and the hire fee is discounted too.",
    ],
    occasions: [
      "Family birthdays & Sunday dinners",
      "Neighbourhood & community get-togethers",
      "Long-stay villa farewells",
      "Relaxed group dinners for 10–20 guests",
    ],
    localColour: ["Umalas I & II", "Bumbak", "the Umalas shortcut", "Kerobokan border"],
    faqs: [
      {
        q: "What's the delivery fee to Umalas?",
        a: "Umalas is in our second zone, so delivery is a flat IDR 250,000 on top of food and hire. That brings the BBQ, chef and food right to your villa.",
      },
      {
        q: "Do bigger Umalas bookings get a discount?",
        a: "Yes. From 10 guests the BBQ & chef hire fee is discounted, and from 20 guests the discount is bigger again — plus the per-person food price drops as your group grows.",
      },
    ],
  },
  {
    slug: "kuta-legian",
    area: "Kuta & Legian",
    zoneKey: "umalas",
    metaDesc:
      "Villa & group BBQ catering in Kuta and Legian, Bali. A chef grills a fresh feast at your villa or accommodation. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Kuta and Legian are where a lot of Bali trips begin — the classic beach strip, walkable and lively, packed with groups here for a good time. If you've booked a villa or a big accommodation nearby, an at-home BBQ keeps the whole crew together instead of splitting across restaurants.",
      "We bring the grill, the fuel, fresh food and a chef who cooks it all buffet-style and cleans up. It's the easiest way to feed a big group after a day at the beach.",
    ],
    whyTitle: "Feeding the whole group in Kuta & Legian",
    why: [
      "Kuta and Legian draw groups — stag and hen trips, mates' holidays, big family stays — and coordinating a dinner table for that many people is a headache. A villa BBQ solves it: everyone eats together, at your place, on your schedule.",
      "Our mixed-grill packages are made for hungry crowds, and add-ons like a bartender, extra sides and dessert platters turn dinner into the main event of the night. Scale it from 6 up to 200+.",
    ],
    occasions: [
      "Stag & hen group dinners",
      "Mates' holiday & big-group feasts",
      "Family stays near the beach strip",
      "Pre-night-out villa parties",
    ],
    localColour: ["Kuta Beach", "Legian Street", "Poppies Lanes", "Double Six border"],
    faqs: [
      {
        q: "Can you cater a big group BBQ in Kuta or Legian?",
        a: "Yes — feeding large groups is our speciality. We scale from 6 to 200+ guests and can add a second BBQ and extra chefs for the big ones. Delivery to Kuta and Legian is a flat IDR 250,000.",
      },
      {
        q: "Can you set up at a villa or private accommodation?",
        a: "As long as there's a safe, suitable space for the grill, we can set up at most villas and private accommodation. Share the details when you book and we'll advise on the setup.",
      },
    ],
  },
  {
    slug: "jimbaran",
    area: "Jimbaran",
    zoneKey: "umalas",
    metaDesc:
      "Seafood BBQ & villa chef hire in Jimbaran, Bali. Whole red snapper, prawns & steak grilled at your villa. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Jimbaran is Bali's seafood bay — the sunset spot famous for fresh fish grilled right on the sand. Bring that same idea to your villa and skip the crowded beachfront: a private chef grilling whole red snapper, prawns and steak while you keep your table by the pool.",
      "We supply the BBQ, the charcoal and gas, fresh seafood and meat bought that day, and a chef to cook and clean up. It's Jimbaran's signature feast, hosted at home.",
    ],
    whyTitle: "A seafood BBQ to rival the bay",
    why: [
      "Jimbaran is built around seafood and sunsets, and our Surf & Turf menu leans right into it — whole red snapper, grilled prawns and sirloin steak alongside chicken and sausages. It's the closest thing to the beachfront experience, without the shared benches.",
      "The area's luxury villas and clifftop stays make ideal venues, and a private BBQ suits everything from an intimate anniversary to a villa wedding celebration. Add waitstaff for a truly hands-off evening.",
    ],
    occasions: [
      "Sunset seafood dinners at clifftop villas",
      "Anniversary & proposal feasts",
      "Villa wedding & celebration catering",
      "Luxury villa group dinners",
    ],
    localColour: ["Jimbaran Bay", "Muaya Beach", "the cliffs toward Uluwatu", "Four Seasons area"],
    faqs: [
      {
        q: "Can you do a seafood BBQ at a Jimbaran villa?",
        a: "Yes — our Surf & Turf menu features whole red snapper, grilled prawns and sirloin steak, and you can add extra seafood too. Delivery to Jimbaran is a flat IDR 250,000.",
      },
      {
        q: "Do you cater villa weddings and celebrations in Jimbaran?",
        a: "We do. For weddings and larger celebrations we build a tailored menu and can bring extra chefs, a bartender and waitstaff. Send us the details for a custom quote.",
      },
    ],
  },
  {
    slug: "uluwatu",
    area: "Uluwatu",
    zoneKey: "far",
    metaDesc:
      "Clifftop villa BBQ & private chef hire in Uluwatu, Bali. A chef brings the grill and feast to your villa. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Uluwatu is all dramatic cliffs, world-class surf and luxury villas perched over the Indian Ocean. When the view is that good, you don't want to leave it for dinner — so we bring the BBQ to you, right there on the clifftop deck.",
      "Our chef arrives with the grill, the fuel and fresh food, cooks a full feast buffet-style and packs everything down afterwards. You keep the sunset, we handle the rest.",
    ],
    whyTitle: "Sunset BBQs above the surf",
    why: [
      "The Bukit's villas are made for entertaining — infinity pools, ocean decks and space to gather — and a private BBQ turns that setting into an unforgettable dinner as the sun drops behind the break.",
      "Uluwatu is also a favourite for villa weddings, surf-trip crews and milestone celebrations. Whether it's an intimate clifftop dinner or a big villa party, we scale to fit and can add a bartender and waitstaff for the occasion.",
    ],
    occasions: [
      "Clifftop sunset dinners & parties",
      "Villa weddings & elopement feasts",
      "Surf-trip crew celebrations",
      "Milestone birthdays with a view",
    ],
    localColour: ["Single Fin", "Padang Padang", "Bingin", "Uluwatu Temple", "the Bukit"],
    faqs: [
      {
        q: "Do you deliver BBQ catering to Uluwatu villas?",
        a: "Yes — Uluwatu is in our wider zone, so delivery is a flat IDR 375,000 on top of food and hire. We regularly cater clifftop and Bukit villas around Bingin, Padang Padang and Pecatu.",
      },
      {
        q: "Can you cater a clifftop villa wedding in Uluwatu?",
        a: "We can. For weddings and big celebrations we tailor the menu and bring extra chefs and staff. Message us with your date, villa and guest count for a custom quote.",
      },
    ],
  },
  {
    slug: "ubud",
    area: "Ubud",
    zoneKey: "far",
    metaDesc:
      "Villa & retreat BBQ catering in Ubud, Bali. A private chef brings the grill and a fresh feast to your jungle villa. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Ubud is Bali's green heart — jungle villas, rice terraces and a wellness-and-culture crowd that comes to slow down. A villa BBQ fits the setting beautifully: a fresh, hands-off feast in the trees, with no drive back through winding lanes after dinner.",
      "We bring the whole grill to you: BBQ, charcoal and gas, fresh food and a chef to cook and clean up. Perfect for a retreat, a family villa or a celebration among the paddies.",
    ],
    whyTitle: "Jungle-villa feasts & retreat catering",
    why: [
      "Ubud draws retreats, workshops and family stays in villas tucked into the greenery — often a little way from restaurants. Having a chef come to you means the group eats well together without anyone getting back in a car.",
      "It's also a natural fit for wellness and dietary needs: we offer vegetarian and vegan plates alongside the grill, so mixed groups are easy to feed. Start from 6 guests and scale up for bigger retreats and events.",
    ],
    occasions: [
      "Wellness & yoga retreat catering",
      "Jungle-villa family dinners",
      "Workshop & group-stay feasts",
      "Celebrations among the rice terraces",
    ],
    localColour: ["Tegallalang rice terraces", "Campuhan", "Penestanan", "the Ubud jungle"],
    faqs: [
      {
        q: "Can you cater a retreat or group villa in Ubud?",
        a: "Yes — retreats and group villas are a great fit. We can cater mixed diets with vegetarian and vegan plates, and scale the menu to your numbers. Delivery to Ubud is a flat IDR 375,000.",
      },
      {
        q: "Do you offer vegetarian and vegan options for Ubud groups?",
        a: "We do. Add our vegetarian/vegan plates — grilled veg, tofu and plant-based skewers — for any guests who need them, and let us know your requirements when you book.",
      },
    ],
  },
  {
    slug: "sanur",
    area: "Sanur",
    zoneKey: "far",
    metaDesc:
      "Relaxed family BBQ catering in Sanur, Bali. A private chef brings the grill and feast to your villa. From $11 USD pp — book in a quick WhatsApp chat.",
    intro: [
      "Sanur is Bali's calm, family-friendly east coast — gentle beaches, a walkable boardwalk and a settled, unhurried feel. It's a neighbourhood of long lunches and easy evenings, and a villa BBQ slots right into that relaxed pace.",
      "Our chef brings the grill, the fuel and fresh food, cooks everything buffet-style and clears up before leaving. A proper feast at home, with none of the fuss.",
    ],
    whyTitle: "Easy-going villa BBQs in Sanur",
    why: [
      "Sanur suits the unhurried gathering — multi-generational family stays, quiet birthdays and get-togethers with old friends. A mobile BBQ lets everyone stay put in the garden while the food comes to them.",
      "With plenty of family villas and a laid-back crowd, our mixed-grill packages go down a treat, and you can keep it simple or add sides, dessert and drinks. Six guests or sixty, we've got it covered.",
    ],
    occasions: [
      "Multi-generational family dinners",
      "Relaxed garden birthdays",
      "Old-friends reunions & long lunches",
      "Quiet-evening villa gatherings",
    ],
    localColour: ["Sanur boardwalk", "Mertasari", "the sunrise beaches", "Bali Beach area"],
    faqs: [
      {
        q: "What's the BBQ delivery fee to Sanur?",
        a: "Sanur is in our wider zone, so delivery is a flat IDR 375,000 on top of food and hire. We bring the full BBQ setup, chef and food to your villa.",
      },
      {
        q: "Is a villa BBQ good for an older or mixed-age group in Sanur?",
        a: "Very — it's relaxed, everyone stays comfortable at home, and the buffet-style service suits all ages. We can keep the menu simple or add extra sides and dessert.",
      },
    ],
  },
  {
    slug: "nusa-dua",
    area: "Nusa Dua",
    zoneKey: "confirm",
    metaDesc:
      "Villa & resort BBQ catering in Nusa Dua, Bali. A private chef grills a fresh feast at your villa. From $11 USD pp — book on WhatsApp.",
    intro: [
      "Nusa Dua is Bali's polished resort enclave — manicured, gated and geared toward comfort. If you're staying in a private villa here, an at-home BBQ brings a bit of island soul to the setting: a chef grilling fresh over charcoal, right by your pool.",
      "We handle the BBQ, the fuel, fresh food bought that day and all the cooking and clean-up. You get a relaxed, restaurant-quality feast without leaving the resort.",
    ],
    whyTitle: "Private villa & resort BBQs in Nusa Dua",
    why: [
      "The villas and residences around Nusa Dua and Tanjung Benoa are made for hosting, and a private BBQ is an easy upgrade on room service or a resort buffet — fresher, more personal and served exactly when you want it.",
      "It's a strong fit for family holidays, corporate stays and celebrations. Choose a set menu or go premium with Surf & Turf, and add a bartender or waitstaff to make an evening of it.",
    ],
    occasions: [
      "Private villa family holidays",
      "Corporate & incentive-stay dinners",
      "Celebration & anniversary feasts",
      "Tanjung Benoa group gatherings",
    ],
    localColour: ["Tanjung Benoa", "Geger Beach", "the resort enclave", "Bali Collection"],
    faqs: [
      {
        q: "Do you cater BBQ at villas in Nusa Dua?",
        a: "Yes — we cater private villas and residences around Nusa Dua and Tanjung Benoa. As it's further south, we'll confirm your exact delivery fee on WhatsApp when you share the address.",
      },
      {
        q: "Can you cater a corporate or resort-stay dinner in Nusa Dua?",
        a: "We can. Tell us your numbers and any requirements and we'll tailor the menu — and add extra chefs, a bartender and waitstaff for larger groups.",
      },
    ],
  },
];

module.exports = { SITE, ZONES, POSTS };
