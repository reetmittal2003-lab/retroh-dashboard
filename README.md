This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Executive dashboard sections

- **Executive Summary** — total leads, leads by day/week, and conversion rate, computed from Waitlist + Contacts data, plus quick links into the sections below.
- **Website Traffic** — embedded Looker Studio report backed by Google Analytics 4 (Users, Sessions, Views, New Users, traffic sources, device breakdown, trends).
- **SEO** — embedded Looker Studio report backed by Google Search Console (Clicks, Impressions, CTR, average position, top queries, top pages).
- **User Behavior** — buttons to open Microsoft Clarity Session Recordings and Heatmaps in a new tab.
- **Waitlist / Contacts / Customers / Analytics** — unchanged from the existing operational dashboard.

The Website Traffic, SEO, and User Behavior sections are driven entirely by URLs you configure — no Google Cloud project, service account, or billing is used. Until an env var below is set, its section shows a "not connected" placeholder instead of erroring.

Set these in `.env.local` (see `.env.local.example`):

- `NEXT_PUBLIC_GA4_LOOKER_URL` — public Looker Studio embed URL for a GA4 report
- `NEXT_PUBLIC_GSC_LOOKER_URL` — public Looker Studio embed URL for a Search Console report
- `NEXT_PUBLIC_CLARITY_RECORDINGS_URL` — Microsoft Clarity Session Recordings URL
- `NEXT_PUBLIC_CLARITY_HEATMAPS_URL` — Microsoft Clarity Heatmaps URL

These are `NEXT_PUBLIC_` (not secrets — just URLs rendered client-side) and are inlined at build time, so restart `npm run dev` / redeploy after changing them.

## Push notifications for new leads

Netlify's outgoing webhook (`submission_created`) posts to `/api/notify/netlify-lead?secret=...`, which relays a formatted push to [ntfy.sh](https://ntfy.sh). Set these in `.env.local` (and in Vercel for production):

- `NETLIFY_WEBHOOK_SECRET` — shared secret the webhook URL must include, so the endpoint can't be spammed by random traffic
- `NTFY_TOPIC` — your private ntfy.sh topic name

Subscribe to `https://ntfy.sh/<NTFY_TOPIC>` in the ntfy app (phone) or a browser tab (laptop) to receive pushes. This route is excluded from the dashboard's Basic Auth gate in `proxy.ts` since Netlify's webhook can't supply that password — it's authenticated by the `secret` query param instead.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
