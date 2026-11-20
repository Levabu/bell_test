<script lang="ts">
  import { getProduct, periods } from '../../lib/data'
  import { demo } from '../../lib/layout.svelte'
  import { pickShowcaseProduct } from '../../lib/logic/showcase'
  import { formatPrice, startingPrice } from '../../lib/logic/pricing'
  import { checkout } from '../../lib/checkout.svelte'
  import { track } from '../../lib/analytics'
  import type { ProductShowcaseBlock } from '../../lib/types'

  let { config }: { config: ProductShowcaseBlock } = $props()

  const productId = $derived(pickShowcaseProduct(config, demo.now, demo.owned))
  const product = $derived(productId ? getProduct(productId) : null)
  const trial = $derived(product?.prices.USD?.trial)
  const m1 = $derived(product?.prices.USD?.m1)
  const price = $derived(product ? startingPrice(product, 'USD', periods) : null)

  $effect(() => {
    if (productId) track('block_view', { block: 'product-showcase', product: productId })
  })

  function subscribe() {
    if (!productId) return
    track('block_click', { block: 'product-showcase', product: productId })
    checkout.start(productId, { block: 'product-showcase', period: trial !== undefined ? 'trial' : undefined })
  }
</script>

<!-- One slot of a row. Layout follows the slot width (container queries):
     33% / phone → compact; 50% → features + offer row; 100% → features in their own column.
     The offer always sits left, under the product name, so the eye goes name → price → button. -->
{#if product}
  <section class="widget showcase" aria-labelledby="showcase-{config.id}">
    <div class="inner">
      <div class="body">
        <span class="chip accent">Подписка</span>
        <h2 id="showcase-{config.id}">{product.name}</h2>
        <p class="tagline">{product.tagline}</p>
      </div>
      <ul class="features">
        {#each product.features.paid.slice(0, 3) as f (f.text)}
          <li>{f.text}</li>
        {/each}
      </ul>
      <div class="offer">
        {#if trial !== undefined}
          <p class="price">
            <strong>Месяц за {formatPrice(trial, 'USD')}</strong>
            <span>для новых читателей{m1 !== undefined ? `, затем ${formatPrice(m1, 'USD')} в месяц` : ''}</span>
          </p>
        {:else if price}
          <p class="price">
            <strong>{price}</strong>
            {#if product.highlights[0]}<span>{product.highlights[0]}</span>{/if}
          </p>
        {/if}
        <div class="actions">
          <button class="btn" type="button" onclick={subscribe}>
            {trial !== undefined ? 'Попробовать' : 'Подписаться'}
          </button>
          <a class="more" href={product.landingUrl} target="_blank" rel="noopener">Подробнее</a>
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .showcase {
    display: flex;
    background: var(--dark);
    color: #fff;
  }
  .inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .body {
    margin-bottom: auto;
  }
  h2 {
    margin: 12px 0 0;
    font: 900 36px/0.95 var(--display);
    text-transform: uppercase;
  }
  .tagline {
    margin: 8px 0 0;
    font-size: 15px;
    line-height: 1.35;
    color: #cfcfcf;
  }
  .features {
    display: none;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 6px;
    font-size: 14px;
    line-height: 1.35;
  }
  .features li {
    position: relative;
    padding-left: 18px;
  }
  .features li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.5em;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
  }
  .offer {
    display: grid;
    gap: 12px;
  }
  .price {
    margin: 0;
    display: grid;
    gap: 2px;
  }
  .price strong {
    font-size: 20px;
    line-height: 1.2;
  }
  .price span {
    font-size: 13px;
    color: #b5b5b5;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .more {
    font-size: 14px;
    color: #cfcfcf;
  }
  .more:hover {
    color: #fff;
  }

  /* 50% slot: features under the name, then one offer row (price, button), all left-aligned. */
  @container (min-width: 560px) {
    .features {
      display: grid;
    }
    .offer {
      display: flex;
      align-items: center;
      gap: 24px;
    }
  }
  /* 100% row: name + offer on the left, features in their own column on the right. */
  @container (min-width: 900px) {
    .inner {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      grid-template-areas:
        'body features'
        'offer features';
      align-content: center;
      column-gap: 64px;
      row-gap: 36px;
      padding: 12px 28px;
    }
    .body {
      grid-area: body;
      margin-bottom: 0;
    }
    .features {
      grid-area: features;
      align-self: center;
      gap: 14px;
      font-size: 17px;
    }
    .offer {
      grid-area: offer;
    }
    /* Scales with the slot so the longest name (THE BELL.UNLIMITED) stays on one line. */
    h2 {
      font-size: clamp(48px, 6.2cqi, 72px);
    }
    .tagline {
      font-size: 20px;
    }
    .price strong {
      font-size: 26px;
    }
  }
</style>
