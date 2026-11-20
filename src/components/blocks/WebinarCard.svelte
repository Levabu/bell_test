<script lang="ts">
  import { getProduct, WEBINARS_URL } from '../../lib/data'
  import { demo } from '../../lib/layout.svelte'
  import { subscriberAction, type WebinarItem } from '../../lib/logic/webinars'
  import { hasAccess } from '../../lib/logic/showcase'
  import { formatDay, formatTime } from '../../lib/logic/format'
  import { checkout } from '../../lib/checkout.svelte'
  import { track } from '../../lib/analytics'

  /** `block` = analytics name of the placement ('webinars' row or 'webinar' slot). */
  let { w, block }: { w: WebinarItem; block: 'webinars' | 'webinar' } = $props()

  const date = $derived(formatDay(w.startsAt))
  const subscribed = $derived(hasAccess(demo.owned, w.productId))
  const action = $derived(subscriberAction(w, WEBINARS_URL))
  const ctaLabel = $derived(w.status === 'past' ? 'Смотреть запись' : w.status === 'live' ? 'Подключиться' : 'Зарегистрироваться')

  function onCta() {
    track('block_click', { block, webinar: w.id, product: w.productId, status: w.status })
    checkout.start(w.productId, { block, webinar: w })
  }
</script>

<article class="widget webinar" class:past={w.status === 'past'}>
  <img src={w.image} alt="" loading="lazy" />
  <span class="shade" aria-hidden="true"></span>

  <div class="top">
    <span class="chip light">Вебинар</span>
    {#if w.status === 'live'}<span class="live">Идёт сейчас</span>{/if}
    <span class="product">{getProduct(w.productId).name}</span>
  </div>

  <p class="when">
    <time datetime={w.startsAt}>{date.day} {date.month}, {formatTime(w.startsAt)}</time>
  </p>

  <h2>{w.title}</h2>
  <p class="speaker" title="{w.speaker}, {w.speakerRole}">{w.speaker}</p>

  <div class="cta">
    {#if subscribed}
      {#if action.kind === 'link'}
        <a class="btn ghost" href={action.href} target="_blank" rel="noopener">{action.label}</a>
      {:else}
        <span class="soon">{action.text}</span>
      {/if}
    {:else}
      <button class="btn" class:ghost={w.status === 'past'} type="button" onclick={onCta}>{ctaLabel}</button>
    {/if}
  </div>
</article>

<style>
  /* Photo card, like the site's image cards: photo fills the slot, text sits on a gradient.
     Sizes follow the slot width (container queries), so the same card works in a
     25% feed, a 33/50/100% row or a single slot next to news. */
  .webinar {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 300px;
    overflow: hidden;
    isolation: isolate;
    background: var(--dark);
    color: #fff;
  }
  img,
  .shade {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
  img {
    z-index: -2;
    object-fit: cover;
    object-position: center 25%;
    transition: transform 0.3s;
  }
  .webinar:hover img {
    transform: scale(1.03);
  }
  .shade {
    z-index: -1;
    background: linear-gradient(rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.1) 30%, rgba(0, 0, 0, 0.88) 78%);
  }
  .past img {
    filter: grayscale(0.6);
  }
  .top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: auto;
  }
  .live {
    padding: 7px 8px 6px;
    border-radius: var(--radius);
    font: 600 11px/11px var(--sans);
    text-transform: uppercase;
    background: var(--accent);
  }
  .product {
    margin-left: auto;
    font-size: 11px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .when {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }
  h2 {
    margin: 0;
    font: 600 18px/1.3 var(--sans);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .speaker {
    margin: 0;
    font-size: 13px;
    color: #d0d0d0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cta {
    padding-top: 6px;
  }
  .cta .btn {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    font-size: 14px;
    white-space: normal;
  }
  .soon {
    display: block;
    font-size: 13px;
    color: #8fe0b0;
  }
  /* Narrow slot (phone 250×250 swipe card, tablet 25% row): the title wins over
     the speaker line, since the photo already shows who it is. */
  @container (max-width: 260px) {
    h2 {
      font-size: 15px;
      -webkit-line-clamp: 5;
      line-clamp: 5;
    }
    .speaker,
    .live ~ .product {
      display: none;
    }
  }
  /* Large slots (50% / 100% rows): bigger type, like the site's image cards. */
  @container (min-width: 560px) {
    .webinar {
      gap: 8px;
    }
    h2 {
      font-size: 25px;
      line-height: 1.2;
    }
    .when,
    .speaker {
      font-size: 15px;
    }
    .cta .btn {
      width: auto;
      min-width: 220px;
    }
  }
  @container (min-width: 900px) {
    h2 {
      font-size: 40px;
      max-width: 900px;
    }
  }
</style>
