/* ============================================================================
 * BBQ BALI HOME SERVICE — PRICING & MENU CONFIGURATION
 * ============================================================================
 *
 *  👉  THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE PRICES OR THE MENU.
 *      You do NOT need to touch any HTML, CSS, or the builder code.
 *
 *  Everything the interactive Menu & Price Builder shows — packages, proteins,
 *  prices per group size, extras, delivery areas and fees — is defined here.
 *
 *  HOW PRICING WORKS
 *  -----------------
 *  Final total  =  (per-person price  ×  number of guests)
 *               +  Chef & BBQ hire fee (flat, always added)
 *               +  Delivery fee (only if an out-of-area location is chosen)
 *               +  Any optional extras
 *
 *  The per-person price changes automatically with the group size "tier":
 *      6–9 guests, 10–19 guests, or 20+ guests.
 *  The bigger the group, the lower the per-person price.
 *
 *  QUICK EDITS
 *  -----------
 *  • Change the USD exchange rate ......... FX.idrPerUsd
 *  • Change the chef & BBQ hire fee ....... FEES.chefBbqHire.idr
 *  • Change a package price ............... PACKAGES[...].perPerson.{small|medium|large}
 *  • Add/remove a protein ................. PROTEINS array
 *  • Change a delivery fee ................ AREAS array
 *  • Add a drink / dessert / extra ........ EXTRAS array
 *
 *  All prices are in IDR (Indonesian Rupiah). USD is calculated automatically.
 *  ⚠️  Numbers below are sensible defaults based on the current site — please
 *      confirm each one against your live prices before going public.
 * ========================================================================== */

window.PRICING = {

  /* ---- Currency ---------------------------------------------------------- */
  FX: {
    // How many IDR to 1 USD. Update when the rate moves a lot.
    idrPerUsd: 17500,
  },

  /* ---- Business / contact details --------------------------------------- */
  BUSINESS: {
    name: "BBQ Bali Home Service",
    tagline: "BBQ Hire Bali · Bali BBQ & Chef Hire",
    whatsappNumber: "6281776666692",          // digits only, country code first
    whatsappDisplay: "+62 817 7666 6692",
    email: "bbqbalihomeservice@gmail.com",
    instagram: "https://www.instagram.com/bbqbalihomeservice/",
    bookingCutoff: "11am",                     // same-day booking cutoff time
  },

  /* ---- Flat fees (always added to every order) -------------------------- */
  FEES: {
    chefBbqHire: {
      label: "Chef & BBQ Hire",
      note: "Includes the chef, full BBQ setup, charcoal & gas.",
      idr: 1800000,
      // Bigger groups get a discount on this fee — see "hireDiscount" per tier below.
    },
  },

  /* ---- Group-size tiers -------------------------------------------------- *
   *  The builder auto-selects the tier from the guest count entered.
   *  "id" is used to look up per-person prices in the packages/proteins below.
   *  "hireDiscount" is the discount applied to the Chef & BBQ Hire fee for that
   *  group size (0 = full price, 0.25 = 25% off, 0.5 = 50% off).
   *  Keep them ordered small → large and make the ranges continuous.
   */
  TIERS: [
    { id: "small",  label: "6–9 guests",  min: 6,  max: 9,   hireDiscount: 0    },
    { id: "medium", label: "10–19 guests", min: 10, max: 19, hireDiscount: 0.25 },
    { id: "large",  label: "20+ guests",  min: 20, max: 999, hireDiscount: 0.5  },
  ],
  MIN_GUESTS: 6,     // minimum booking size

  /* ---- Base packages ----------------------------------------------------- *
   *  Each package has a fixed menu (what's on the plate) and a per-person price
   *  for each group-size tier. Prices are IDR, per person.
   *  "image" is the menu photo shown on the home page (in assets/img/).
   */
  PACKAGES: {
    package1: {
      name: "Package 1",
      subtitle: "The classic crowd-pleaser",
      description:
        "Our best-value mixed grill — burgers, hot dogs and BBQ favourites " +
        "with something for everyone, served buffet-style.",
      image: "assets/img/package1.webp",
      proteins: [
        "Hotdog & burger",
        "Beef & chicken",
        "Chicken wings",
        "Chicken drumsticks",
        "Pork ribs",
        "Sausage",
      ],
      included: ["Potato wedges"],
      perPerson: { small: 415000, medium: 395000, large: 375000 },
      badge: null,
    },
    package2: {
      name: "Package 2",
      subtitle: "Sirloin steak upgrade",
      description:
        "A step up with juicy sirloin steak and slow-cooked pork ribs, " +
        "rounded out with coleslaw and potato wedges.",
      image: "assets/img/package2.webp",
      proteins: [
        "Sirloin steak",
        "Pork ribs",
        "Chicken wings",
        "Chicken drumsticks",
        "Sausage",
      ],
      included: ["Coleslaw salad", "Potato wedges"],
      perPerson: { small: 520000, medium: 495000, large: 470000 },
      badge: "Most popular",
    },
    surfturf: {
      name: "Surf & Turf",
      subtitle: "The premium spread",
      description:
        "The full ocean-and-land feast — sirloin steak, prawns and whole red " +
        "snapper alongside chicken and sausages. The showstopper.",
      image: "assets/img/package3.webp",
      proteins: [
        "Sirloin steak",
        "Prawns",
        "Red snapper fish",
        "Chicken wings & drums",
        "Sausages",
      ],
      included: ["Potato wedges", "Salads", "Sauces"],
      perPerson: { small: 620000, medium: 590000, large: 560000 },
      badge: "Premium",
    },
  },

  /* ---- BBQ & Chef hire only (you provide the food) ---------------------- *
   *  A "hire only" option: the guest buys their own food and we bring the BBQ
   *  setup and chefs to cook it. Price = the flat Chef & BBQ Hire fee above
   *  (no group-size discount) + delivery. No per-person food charge.
   */
  HIRE_ONLY: {
    name: "BBQ & Chef hire only",
    subtitle: "You provide the food",
    description:
      "Just the setup: we bring the BBQ, charcoal & gas and 2 professional " +
      "chefs to grill the food you buy yourself. Perfect if you'd rather shop " +
      "for your own ingredients.",
    image: "assets/img/package-coal-or-gas-bbq.webp",
    chefs: 2,
    includes: ["2 professional chefs", "Full BBQ setup", "Charcoal & gas", "Setup & clean-up"],
    // Uses FEES.chefBbqHire.idr as a flat price (no discount) + delivery.
  },

  /* ---- Custom-build proteins -------------------------------------------- *
   *  Used when a guest chooses "Build my own". Each protein has a per-person
   *  price for each tier. Sides & sauces (below) are included free.
   *  "seafood" / "premium" flags are just used for a small label in the UI.
   */
  PROTEINS: [
    { id: "chicken",  name: "Chicken wings & drumsticks", perPerson: { small: 90000,  medium: 85000,  large: 80000  }, tag: null },
    { id: "sausage",  name: "Gourmet sausages",           perPerson: { small: 80000,  medium: 75000,  large: 70000  }, tag: null },
    { id: "ribs",     name: "Pork ribs",                  perPerson: { small: 120000, medium: 110000, large: 100000 }, tag: null },
    { id: "sirloin",  name: "Sirloin steak",              perPerson: { small: 160000, medium: 150000, large: 140000 }, tag: null },
    { id: "prawns",   name: "Grilled prawns",             perPerson: { small: 150000, medium: 140000, large: 130000 }, tag: "seafood" },
    { id: "snapper",  name: "Whole red snapper",          perPerson: { small: 150000, medium: 140000, large: 130000 }, tag: "seafood" },
    { id: "octopus",  name: "Grilled octopus",            perPerson: { small: 160000, medium: 150000, large: 140000 }, tag: "seafood" },
    { id: "wagyu",    name: "Wagyu upgrade (per steak)",  perPerson: { small: 260000, medium: 250000, large: 240000 }, tag: "premium" },
  ],

  /* ---- Sides (included free with any custom build) ---------------------- */
  SIDES: [
    { id: "wedges",  name: "Potato wedges",     default: true },
    { id: "salad",   name: "Fresh garden salad", default: true },
    { id: "corn",    name: "Grilled corn",       default: false },
    { id: "rice",    name: "Steamed rice",       default: false },
    { id: "veggies", name: "Grilled vegetables", default: false },
  ],

  /* ---- Sauces (included free, pick any) --------------------------------- */
  SAUCES: [
    { id: "bbq",       name: "House BBQ",        default: true },
    { id: "garlic",    name: "Garlic butter",    default: true },
    { id: "chimi",     name: "Chimichurri",      default: false },
    { id: "sambal",    name: "Balinese sambal",  default: false },
    { id: "peppercorn",name: "Peppercorn",       default: false },
  ],

  /* ---- Optional extras --------------------------------------------------- *
   *  "unit" controls how the price is applied:
   *     "perPerson" → price × number of guests
   *     "count"     → price × a quantity the guest chooses (e.g. number of staff)
   *     "flat"      → price added once (on/off)
   *  Set "perPersonPrice" (object by tier) for perPerson extras, or
   *  "flatIdr" for count/flat extras (for "count" it's the price per unit).
   *  Add "capGuests: true" to cap a count extra's quantity at the guest count.
   *  Add "food: true" to a food add-on so it is hidden in "BBQ & Chef hire
   *  only" mode (where the guest brings their own food).
   */
  EXTRAS: [
    {
      id: "extra_prawns", name: "Extra prawns & red snapper", unit: "perPerson",
      note: "Add-on or replacement, per guest", food: true,
      perPersonPrice: { small: 150000, medium: 150000, large: 150000 },
    },
    {
      id: "wagyu_swap", name: "Wagyu steak upgrade", unit: "count",
      note: "Swap to premium wagyu (avg. 180–200g per steak) · choose how many guests",
      flatIdr: 380000, capGuests: true, food: true,
    },
    {
      id: "veg_sub", name: "Vegetarian / vegan plate", unit: "perPerson",
      note: "Grilled veg, tofu & plant-based skewers, per veggie guest", food: true,
      perPersonPrice: { small: 120000, medium: 110000, large: 100000 },
    },
    {
      id: "dessert", name: "Dessert platter", unit: "perPerson",
      note: "Grilled pineapple, banana & seasonal fruit, per guest", food: true,
      perPersonPrice: { small: 45000, medium: 40000, large: 35000 },
    },
    {
      id: "drinks", name: "Soft drinks & water package", unit: "perPerson",
      note: "Unlimited soft drinks & water, per guest", food: true,
      perPersonPrice: { small: 40000, medium: 35000, large: 30000 },
    },
    {
      id: "bartender", name: "Professional bartender", unit: "count",
      note: "Choose how many, each approx. 3 hrs",
      flatIdr: 900000,
    },
    {
      id: "waitstaff", name: "Waitstaff service", unit: "count",
      note: "Choose how many, each approx. 3 hrs",
      flatIdr: 750000,
    },
  ],

  /* ---- Delivery / service areas ----------------------------------------- *
   *  Each area adds a flat delivery fee (deliveryIdr). Use confirm: true for a
   *  zone whose fee is quoted later on WhatsApp (its deliveryIdr is ignored).
   */
  AREAS: [
    { id: "core", label: "Canggu / Berawa / Pererenan / Seminyak / Kerobokan", deliveryIdr: 200000 },
    { id: "umalas", label: "Umalas / Kuta / Legian / Jimbaran", deliveryIdr: 250000 },
    { id: "far", label: "Ubud / Gianyar / Sanur / Uluwatu", deliveryIdr: 375000 },
    { id: "other", label: "Somewhere else in Bali (we'll confirm on WhatsApp)", deliveryIdr: 0, confirm: true },
  ],

  /* ---- Budget options (home-page "Choose your budget" dropdown) --------- *
   *  A simpler, budget-first path shown on the home page. Choosing one opens
   *  budget.html, which asks for guest count + location and shows the price:
   *      per-person price  ×  guests  +  hireIdr  +  delivery
   *  Set "enquireOnly: true" for a tier with no fixed price (quote on request).
   *  NOTE: this flow uses its own flat hire fee (hireIdr) below.
   */
  BUDGET: {
    title: "Choose your budget",
    discountNote: "Subject to discounted BBQ & Chef hire",   // shown under the dropdown
    hireIdr: 1800000,                    // flat BBQ & Chef hire for budget options (1.8jt)
    menuNote: "Full menu coming soon — we'll walk you through every dish when you book.",
    // Guest-count discounts on the BBQ & Chef hire fee (ordered high → low by minGuests).
    // At 30+ the price stays full, but a 2nd BBQ and an extra chef are included.
    hireDiscounts: [
      { minGuests: 30, discount: 0,   note: "Includes a 2nd BBQ &amp; an extra chef" },
      { minGuests: 20, discount: 0.5 },
      { minGuests: 10, discount: 0.3 },
      { minGuests: 0,  discount: 0 },
    ],
    eventCatering: {
      minGuests: 50,
      text: "Event catering?",
      note: "50+ guests",
      cta: "Chat with the team",
      waText: "Hi BBQ Bali Home Service! 🔥 I'd like to enquire about event catering for 50+ guests. Could you help with a tailored quote?",
    },
    tiers: [
      {
        id: "impressive", name: "Impressive Budget Option",
        perPersonIdr: 200000, minGuests: 10,
        blurb: "Our best-value crowd-pleaser — a generous BBQ spread that keeps everyone happy.",
      },
      {
        id: "middle", name: "Magic Middle of the Range",
        perPersonIdr: 450000, minGuests: 6,
        blurb: "A step up with juicy sirloin steak and slow-cooked pork ribs, rounded out with coleslaw and potato wedges.",
        image: "assets/img/package2.webp",
        menu: ["Sirloin steak", "Pork ribs", "Chicken wings", "Chicken drumsticks", "Sausage", "Coleslaw salad", "Potato wedges"],
      },
      {
        id: "premium", name: "Premium",
        perPersonIdr: 600000, minGuests: 6,
        blurb: "The full ocean-and-land feast — export-quality meats and seafood. The showstopper.",
        image: "assets/img/package3.webp",
        menu: ["Sirloin steak", "Prawns", "Red snapper fish", "Chicken wings & drums", "Sausages", "Potato wedges", "Salads", "Sauces"],
      },
      {
        id: "hireonly", name: "BBQ & Chef hire only (I buy the groceries)",
        hireOnly: true, minGuests: 6,
        blurb: "You buy your own groceries — we bring the BBQ, charcoal & gas and chef to cook them. Just the hire fee plus delivery.",
        image: "assets/img/package-coal-or-gas-bbq.webp",
        includes: ["BBQ, charcoal & gas", "Professional chef", "Full setup & clean-up"],
      },
      {
        id: "top", name: "Top of the Range",
        enquireOnly: true, minGuests: 6,
        blurb: "Wagyu options and lobster — a bespoke luxury menu. Please enquire for a quote.",
      },
    ],
  },

  /* ---- Booking / payment terms (shown to guests, not used in maths) ------ */
  TERMS: {
    deposit: "50% deposit to secure your date, 50% on the day of your BBQ.",
    payment: "Cash, bank transfer or crypto.",
    cancellation:
      "Cancellations before the event day incur a fee of IDR 750,000 / USD 50. " +
      "Cancellations on the day forfeit the full deposit, as we book staff, " +
      "secure delivery and buy your food fresh that morning.",
    sameDay: "Same-day BBQ hire is possible for bookings made before 11am.",
  },
};
