# Images — how to add the real photos

The site is built to look complete right now using warm gradient **placeholders**
(the charcoal/red panels with a label like "Hero — grill in action"). Swap in the
real photos from the current website / Instagram whenever you're ready — **no design
code needs to change.**

## How the placeholders work

Anywhere you see a panel, it's an element with the class `photo`, e.g.:

```html
<div class="photo hero__photo" aria-label="Flame-grilled BBQ feast">
  <span class="photo__tag">Hero — grill in action</span>
</div>
```

To show a real image, just add a background image via inline style:

```html
<div class="photo hero__photo"
     style="background-image:url('assets/img/hero.jpg')"
     aria-label="Flame-grilled BBQ feast"></div>
```

That's it. The label chip hides automatically once a background image is set, and
the image is centred and cropped to fit the panel. (You can delete the
`<span class="photo__tag">…</span>` line, or leave it — it won't show.)

## Suggested files to add

| Where | Suggested filename | Notes |
|-------|--------------------|-------|
| Home hero | `hero.jpg` | Best hero shot, portrait-ish (4:5) |
| Home "Chef at work" | `chef.jpg` | Tall (3:4) |
| About – villa setup | `setup.jpg` | Tall (3:4) |
| About – feast | `feast.jpg` | |
| Package cards | `package1.jpg`, `package2.jpg`, `surfturf.jpg` | ~16:10 |
| Gallery | `gallery-01.jpg` … `gallery-12.jpg` | Square (1:1) |

The gallery tiles are generated in `gallery.html`; to point them at real images,
edit the small `labels`/render block there and add a `style="background-image:…"`
to each tile (there's a comment marking the spot).

## Please compress before uploading

The brief asks for fast load times. Before adding photos:

1. **Resize** — hero ~1600px wide max; gallery tiles ~800px; cards ~1000px.
2. **Compress** — aim for < 200 KB each. Good free tools: [squoosh.app](https://squoosh.app),
   [tinypng.com](https://tinypng.com).
3. **Prefer `.webp`** where you can (smaller than JPG at the same quality).

## Favicon

The site uses the real brand logo: `logo.svg` (shown in the header/footer on a
white chip) and `favicon.png` (the browser-tab icon, logo on a white background).
To change either, replace those files in `assets/img/`.
