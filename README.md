# FairGround Landing

Landing page for FairGround, the anti-auction service request platform. A FairGround resource from OPAL Quality Systems Management.

Built with Next.js 15 App Router (JavaScript), React 19, and CSS custom properties. Google Fonts are self-hosted at build time via `next/font`.

## Stack

- Next.js 15.1.6 (App Router)
- React 19
- Plain CSS with custom properties (no Tailwind)
- `next/font/google` for Fraunces, Instrument Sans, JetBrains Mono
- Deployable to Vercel with zero config

## Local development

Prerequisites: Node.js 18.18 or later. Node 20 LTS or newer is recommended.

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open http://localhost:3000 in your browser.

### Production build locally

```bash
npm run build
npm run start
```

## Project structure

```
fairground-landing/
├── package.json
├── next.config.mjs
├── jsconfig.json              # @/* path alias
├── .gitignore
├── .eslintrc.json
└── src/
    └── app/
        ├── layout.js          # Root layout, fonts, metadata
        ├── page.js            # Composes the landing page
        ├── globals.css        # All styles
        └── components/
            ├── Reveal.js        # Client, scroll reveal wrapper
            ├── BrandMark.js     # Inline SVG logo
            ├── Icons.js         # Arrow, Check, Lock, ExternalArrow
            ├── Nav.js
            ├── Hero.js
            ├── Problem.js
            ├── Principles.js
            ├── HowItWorks.js
            ├── Audience.js
            ├── Pricing.js
            ├── NoRefunds.js
            ├── Guarantees.js
            ├── Faq.js           # Client, accordion
            ├── Cta.js
            └── Footer.js
```

Only `Reveal.js` and `Faq.js` are client components. Everything else is a server component.

## Design tokens

Edit the top of `src/app/globals.css` to change colors, shadows, or the three font families:

```css
:root {
  --ink: #0E1B13;
  --cream: #F1EADB;
  --rust: #B8441F;
  --sage: #5A7459;
  /* ...and more */
}
```

Fonts are wired in `src/app/layout.js` via `next/font/google`. Swap any family by editing the imports and updating the matching CSS variable.

## Push to GitHub

```bash
# From the project root
git init
git add .
git commit -m "feat: initial fairground landing page"

# Create a new repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/<your-username>/fairground-landing.git
git push -u origin main
```

## Deploy to Vercel

### Option A: Vercel dashboard (easiest)

1. Go to https://vercel.com/new
2. Import the GitHub repo you just pushed
3. Vercel auto-detects Next.js. Leave all defaults.
4. Click **Deploy**. You will get a `.vercel.app` URL in about a minute.

Every push to `main` redeploys production automatically. Every push to any other branch creates a preview URL.

### Option B: Vercel CLI

```bash
# One-time
npm install -g vercel
vercel login

# From the project root
vercel           # preview deploy
vercel --prod    # production deploy
```

## Customization notes

- **Buttons and CTAs**: The three primary CTAs (hero, pricing, final CTA) currently point at `#cta` or `#`. Replace those hrefs with your real signup or beta form URL.
- **Logo**: `src/app/components/BrandMark.js` contains the inline SVG mark. Replace it with your real logo if you have one.
- **Metadata and OG**: Title, description, and Open Graph tags live in `src/app/layout.js` under `export const metadata`.
- **Em dashes**: None anywhere in the project, per project convention.

## Notes

- The page is static and does not hit any external services at runtime.
- No env variables are required.
- The subtle paper grain overlay is inlined as an SVG data URL in `globals.css`, so there are no extra network requests.
