# The Bell: subscription blocks for the homepage (MVP)

Two new homepage-builder blocks, **Product showcase** and **Webinars**, plus the checkout flow
**tariffs → payment → success**. Svelte 5 + TypeScript + Vite, with no runtime dependencies.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # selection / pricing / card logic
npm run check    # types
npm run build    # static build in dist/
```

Demo helpers: the **«⚙ Настройки блоков»** panel (bottom left) changes the block configs live, the date and
the reader's subscription. `?now=2026-12-10T12:00:00Z` sets the date from the URL.
Test cards: `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined.

## How it fits the grid

The homepage keeps the structure thebell.io uses today. It is a stack of **rows**, and each row has a
**basis** that splits it into equal slots: 25% → 4 slots, 33% → 3, 50% → 2, 100% → 1. Desktop
measurements match the live site: 1234px content width, 10px gaps, 300px rows for 33/50 and 500px for 100.
On phones, 25% rows become a swipe row of 250×250 cards and the other rows stack, as on the site.
The config is in `src/lib/layout.svelte.ts`, and its row rhythm (25 → 50 → 33 → 25 → 50 → 33 → 100)
copies the current homepage.

The new blocks use this model and add no new kind of grid:

- **Product showcase** is a widget for one slot. By default it takes the middle slot of a 33% row, where
  the site already puts Invest and Tech stories. It also fits a 50% or 100% slot: its layout follows
  the slot width through container queries, not the viewport.
- **Webinars** has two placements:
  - **Own row** (default, in place of the second headline row), with two views:
    - `feed`: 4 compact cards in a 25% row, a swipe row on phones, like the headline rows. If fewer than 4
      webinars qualify, the row falls back to blocks, so it is never half empty.
    - `blocks`: large cards, up to 3 per row (3 → 33%, 2 → 50%, 1 → 100%), stacked on phones.
  - **One slot** in a mixed row (`webinar` widget), next to news, like the showcase. It shows the nearest
    upcoming webinar, or the latest recording.

  All of these use one card component that sizes itself to its slot.

**No empty slots.** If a widget has nothing to show (for example, the showcase for an Unlimited
subscriber), its row splits among the remaining widgets: a 33% row with 2 widgets renders as 50%.
An empty row is hidden. See `resolveBasis` in `src/lib/logic/lines.ts`.

## What editors configure

| Block | Settings |
|---|---|
| `product-showcase` (widget) | `mode`: rotate / pinned · `pinned` product · rotation `pool` · which row and slot it is placed in |
| `webinars` (row) | `view`: feed / blocks · `productId` (or all) · `limit` (feed ≤ 4, blocks ≤ 3) · `showPast` |
| `webinar` (widget) | `productId` (or all) · `showPast` (fall back to the latest recording) · which row and slot it is placed in |

## How a block decides what to show (`src/lib/logic/`)

- **Showcase:** never shows a product the reader already has (Unlimited covers all). If the editor pinned
  a product, it shows that one. Otherwise it shows `pool[dayNumber % pool.length]`, where the day is
  counted in Moscow time, so everyone sees the same product and it changes at midnight. If nothing is
  left, the block is hidden.
- **Webinars:** filtered by product. Live and upcoming come first, nearest first. Past ones (recordings)
  fill the remaining slots, newest first, up to `limit`. Status is computed from the date and an assumed
  90-minute length. Subscribers skip the paywall: before the start they see "the link comes by email",
  once it starts they get the stream or recording link. If the list is empty, the block is hidden.
- **Checkout:** a "Попробовать" button opens the modal with the $1 trial already selected, matching the
  offer on the block. The tariffs step links signed-out subscribers to the site's own sign-in.

## Production seams

- `src/lib/payment.ts`: `PaymentProvider` is the single interface to billing. The mock goes here.
  In production it calls the existing thebell.site checkout.
- `src/lib/data.ts`: static JSON snapshots of thebell.io and the-chat.io. In production this data comes
  from the CMS or billing API.
- `src/lib/analytics.ts`: pushes events to GTM `dataLayer` (block_view, block_click, checkout_*, payment_*).
- `demo.owned` stands in for the reader's session and subscriptions.
