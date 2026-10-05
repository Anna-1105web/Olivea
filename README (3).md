# Olivea Estates — Real Estate Landing Page

A modern, minimal landing page for a company that sells and rents modern houses and villas.
Light theme, olive-green accents, rounded cards, smooth micro-interactions, and full mobile support.

**Languages:** English (default), Ukrainian, Russian — switch with the EN / UA / RU buttons in the header.

## Features

- Hero section with floating search (location, type, budget, bedrooms, buy/rent)
- Animated stats counters
- Advantages block with a spotlight carousel
- Interactive SVG map with regions, prices and best-value offers
- Property catalog with type tabs, sorting, favorites and a quick-view modal
- Testimonials, FAQ accordion, CTA banner
- Footer with contacts, social links and newsletter form

## Tech stack

- HTML5
- [Tailwind CSS](https://tailwindcss.com) (Play CDN) + custom CSS
- Vanilla JavaScript (no build step)
- [Lucide](https://lucide.dev) icons, [Manrope](https://fonts.google.com/specimen/Manrope) font
- Photos from [Unsplash](https://unsplash.com) (with a local SVG fallback)

## Project structure

```
olivea-estates/
├── index.html              # Page markup
├── css/
│   └── style.css           # Custom styles & animations
├── js/
│   ├── tailwind.config.js  # Tailwind theme (colors, fonts, shadows)
│   ├── i18n.js             # EN / UA / RU translations
│   └── main.js             # Data, rendering, interactions
├── images/
│   ├── favicon.svg
│   └── placeholder.svg     # Shown if an external photo fails to load
├── .nojekyll               # Lets GitHub Pages serve files as-is
├── .gitignore
└── README.md
```

## Run locally

Just open `index.html` in a browser, or start a simple server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy

### GitHub Pages
1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Your site will be live at `https://<username>.github.io/<repo>/`.

### Vercel
1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. No build command, output directory: `./`.
3. Click **Deploy**.

## Editing content

- **Properties:** edit the `PROPS` array in `js/main.js` (title, type, city, price, photo ID).
- **Texts:** edit the `I18N` object in `js/i18n.js` (keys are shared across all three languages).
- **Colors:** edit `js/tailwind.config.js`.

## Note

For production you can replace the Tailwind Play CDN with a compiled Tailwind build for better performance.
