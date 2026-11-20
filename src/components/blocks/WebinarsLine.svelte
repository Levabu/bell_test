<script lang="ts">
  import { webinars } from '../../lib/data'
  import { demo } from '../../lib/layout.svelte'
  import { selectWebinars } from '../../lib/logic/webinars'
  import { webinarsBasis, WEBINARS_MAX } from '../../lib/logic/lines'
  import { track } from '../../lib/analytics'
  import type { WebinarsBlock } from '../../lib/types'
  import WebinarCard from './WebinarCard.svelte'

  let { config }: { config: WebinarsBlock } = $props()

  // Pick the webinars, then the row shape: a full feed of 4 → 25% row;
  // otherwise large blocks, 3 → 33%, 2 → 50%, 1 → 100%.
  const picked = $derived(
    selectWebinars(webinars, { ...config, limit: Math.min(config.limit, WEBINARS_MAX[config.view]) }, demo.now),
  )
  const basis = $derived(webinarsBasis(config.view, picked.length))
  const items = $derived(basis === 25 ? picked : picked.slice(0, WEBINARS_MAX.blocks))

  $effect(() => {
    if (items.length) track('block_view', { block: 'webinars', view: basis === 25 ? 'feed' : 'blocks', items: items.map((w) => w.id) })
  })
</script>

{#if basis}
  <section class="line" data-basis={basis} aria-label="Вебинары The Bell">
    {#each items as w (w.id)}
      <WebinarCard {w} block="webinars" />
    {/each}
  </section>
{/if}
