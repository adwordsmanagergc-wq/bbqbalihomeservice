# BBQ Bali Home Service — Website

A modern, mobile-first rebuild of [bbqbalihomeservice.com](https://bbqbalihomeservice.com) —
at-home BBQ & private chef hire across Bali. Same branding, same contact channels
(WhatsApp + email), rebuilt as a fast, app-like experience with a native
**Interactive Menu & Price Builder**.

Built as a **plain static site** — just HTML, CSS and vanilla JavaScript. No build
step, no framework, no dependencies. Open `index.html` and it works; drop the folder
on any static host and it's live.

---

## 🔥 What's here

| Page | File | What it does |
|------|------|--------------|
| Home | `index.html` | Hero, value props, package preview, how-it-works, CTAs |
| **Menu & Price Builder** | `menu.html` | The core feature — a 5-step interactive builder with a live IDR/USD total and a "Send order via WhatsApp" button |
| How It Works | `about.html` | The at-home BBQ concept + same-day (before 11am) booking |
| Gallery | `gallery.html` | Photo grid linking to Instagram |
| FAQ | `faq.html` | Accordion of all questions, cleaned up & de-duplicated |
| Contact | `contact.html` | WhatsApp click-to-chat, email, and a large-group / wedding enquiry form |

Shared pieces:

```
css/styles.css      Design system (charcoal / ember-red / warm-white)
css/builder.css     Styles specific to the price builder
js/main.js          Nav, scroll reveal, FAQ accordion, WhatsApp/email wiring
js/builder.js       The price-builder engine (reads data/pricing.js)
data/pricing.js     ⭐ ALL prices, packages, menu items, fees & areas
assets/img/         Image drop-in folder (see assets/img/README.md)
```

---

## ✏️ Updating prices & the menu (no code needed)

**Everything money-related lives in one file: [`data/pricing.js`](data/pricing.js).**
It's heavily commented and written so a non-developer can edit it. You never need
to touch the HTML, CSS or the builder logic.

From that one file you can change:

- The **USD exchange rate** (`FX.idrPerUsd`)
- The **Chef & BBQ hire fee** (`FEES.chefBbqHire.idr`)
- **Package prices** per group-size tier (`PACKAGES.*.perPerson`)
- **Proteins, sides & sauces** and their per-person prices
- **Group-size tiers** (currently 6–9, 10–19, 20+)
- **Optional extras** (drinks, dessert, veg/vegan, bartender…)
- **Delivery areas & fees** (`AREAS`)
- **Contact details** — WhatsApp number, email, Instagram (`BUSINESS`)

Change a number, refresh the page — the builder, the totals and the pre-filled
WhatsApp message all update automatically.

> ⚠️ **Please verify the numbers.** The prices in `data/pricing.js` are sensible
> defaults based on the current site and public info. Confirm every price, fee and
> delivery zone against your real rates before going live.

---

## 🖼️ Adding the real photos

The site currently uses warm, intentional **placeholder panels** so it looks
complete out of the box. To swap in the real photos (from the current site /
Instagram), follow the short guide in **[`assets/img/README.md`](assets/img/README.md)** —
it's a one-line change per image, and please compress photos first for fast loading.

---

## 💬 How booking works

There's **no payment processing** on the site — by design. The builder produces an
itemised order and a total, then opens WhatsApp with the whole thing pre-filled to
**wa.me/6281776666692**. The guest finishes booking in a real conversation, and the
50% deposit is handled manually (cash / transfer / crypto), exactly as today.

---

## 🚀 Deploying

It's a static site, so any of these work with zero configuration:

- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, or connect this repo.
- **GitHub Pages** — enable Pages on the repo, serve from the root.
- **Any web host** — upload the files to your web root.

No server, database or build command required.

---

## ♿ Accessibility & performance notes

- Semantic HTML, landmarks, skip-link, keyboard-operable nav, accordion and builder.
- Respects `prefers-reduced-motion`.
- No external fonts, scripts or trackers — nothing to slow the first paint.
- Images are the only heavy assets; compress them (see the image guide) to keep it fast.
