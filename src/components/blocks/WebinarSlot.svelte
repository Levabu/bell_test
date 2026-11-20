<script lang="ts">
  import { webinars } from '../../lib/data'
  import { demo } from '../../lib/layout.svelte'
  import { selectWebinars } from '../../lib/logic/webinars'
  import { track } from '../../lib/analytics'
  import type { WebinarWidget } from '../../lib/types'
  import WebinarCard from './WebinarCard.svelte'

  let { config }: { config: WebinarWidget } = $props()

  // One slot: the nearest upcoming webinar, or the latest recording.
  const w = $derived(selectWebinars(webinars, { ...config, limit: 1 }, demo.now)[0])

  $effect(() => {
    if (w) track('block_view', { block: 'webinar', items: [w.id] })
  })
</script>

{#if w}
  <WebinarCard {w} block="webinar" />
{/if}
