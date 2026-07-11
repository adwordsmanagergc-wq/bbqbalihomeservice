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
    idrPerUsd: 16000,
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
    },
  },

  /* ---- Group-size tiers -------------------------------------------------- *
   *  The builder auto-selects the tier from the guest count entered.
   *  "id" is used to look up per-person prices in the packages/proteins below.
   *  Keep them ordered small → large and make the ranges continuous.
   */
  TIERS: [
    { id: "small",  label: "6–9 guests",  min: 6,  max: 9  },
    { id: "medium", label: "10–19 guests", min: 10, max: 19 },
    { id: "large",  label: "20+ guests",  min: 20, max: 999 },
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
   *     "flat"      → price added once
   *  Set "perPersonPrice" (object by tier) for perPerson extras,
   *  or "flatIdr" for flat extras.
   */
  EXTRAS: [
    {
      id: "extra_prawns", name: "Extra prawns & red snapper", unit: "perPerson",
      note: "Add-on or replacement, per guest",
      perPersonPrice: { small: 150000, medium: 150000, large: 150000 },
    },
    {
      id: "veg_sub", name: "Vegetarian / vegan plate", unit: "perPerson",
      note: "Grilled veg, tofu & plant-based skewers, per veggie guest",
      perPersonPrice: { small: 120000, medium: 110000, large: 100000 },
    },
    {
      id: "dessert", name: "Dessert platter", unit: "perPerson",
      note: "Grilled pineapple, banana & seasonal fruit, per guest",
      perPersonPrice: { small: 45000, medium: 40000, large: 35000 },
    },
    {
      id: "drinks", name: "Soft drinks & water package", unit: "perPerson",
      note: "Unlimited soft drinks & water, per guest",
      perPersonPrice: { small: 40000, medium: 35000, large: 30000 },
    },
    {
      id: "bartender", name: "Professional bartender", unit: "flat",
      note: "Per event (approx. 3 hrs)",
      flatIdr: 900000,
    },
    {
      id: "waitstaff", name: "Waitstaff service", unit: "flat",
      note: "Per event (approx. 3 hrs)",
      flatIdr: 750000,
    },
  ],

  /* ---- Delivery / service areas ----------------------------------------- *
   *  The first area (deliveryIdr: 0) is treated as the free core zone.
   *  Out-of-area zones add a flat delivery fee.
   */
  AREAS: [
    { id: "core", label: "Canggu / Berawa / Pererenan / Seminyak / Kerobokan", deliveryIdr: 0 },
    { id: "umalas", label: "Umalas / Kuta / Legian / Jimbaran", deliveryIdr: 200000 },
    { id: "far", label: "Ubud / Gianyar / Sanur / Uluwatu", deliveryIdr: 375000 },
    { id: "other", label: "Somewhere else in Bali (we'll confirm on WhatsApp)", deliveryIdr: 0, confirm: true },
  ],

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
