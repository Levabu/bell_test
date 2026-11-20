<script lang="ts">
  import { articles, headlines, webinars } from '../lib/data'
  import { demo } from '../lib/layout.svelte'
  import { pickShowcaseProduct } from '../lib/logic/showcase'
  import { resolveBasis, SLOTS } from '../lib/logic/lines'
  import { selectWebinars } from '../lib/logic/webinars'
  import type { Widget, WidgetLine } from '../lib/types'
  import ArticleCard from './blocks/ArticleCard.svelte'
  import HeadlineCard from './blocks/HeadlineCard.svelte'
  import ProductShowcase from './blocks/ProductShowcase.svelte'
  import WebinarSlot from './blocks/WebinarSlot.svelte'

  let { line }: { line: WidgetLine } = $props()

  function shows(w: Widget): boolean {
    switch (w.type) {
      case 'news':
        return articles[w.articleIndex] !== undefined
      case 'headline':
        return headlines[w.headlineIndex] !== undefined
      case 'product-showcase':
        return pickShowcaseProduct(w, demo.now, demo.owned) !== null
      case 'webinar':
        return selectWebinars(webinars, { ...w, limit: 1 }, demo.now).length > 0
    }
  }

  // Widgets that have something to show; the row re-splits if one drops out.
  const visible = $derived(line.widgets.filter(shows).slice(0, SLOTS[25]))
  const basis = $derived(resolveBasis(line.basis, visible.length))
</script>

{#if basis}
  <div class="line" data-basis={basis}>
    {#each visible as w (w.id)}
      {#if w.type === 'news'}
        <ArticleCard config={w} />
      {:else if w.type === 'headline'}
        <HeadlineCard config={w} />
      {:else if w.type === 'product-showcase'}
        <ProductShowcase config={w} />
      {:else if w.type === 'webinar'}
        <WebinarSlot config={w} />
      {/if}
    {/each}
  </div>
{/if}
