<script lang="ts">
  import { headlines } from '../../lib/data'
  import type { HeadlineWidget } from '../../lib/types'

  let { config }: { config: HeadlineWidget } = $props()
  const h = $derived(headlines[config.headlineIndex])
</script>

{#if h}
  <article class="widget headline">
    <h2><a href={h.url} target="_blank" rel="noopener">{h.title}</a></h2>
    <time>{h.time}</time>
  </article>
{/if}

<style>
  .headline {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  h2 {
    margin: 0;
    font: 400 18px/1.3 var(--sans);
  }
  a {
    text-decoration: none;
  }
  a::after {
    content: '';
    position: absolute;
    inset: 0;
  }
  .headline:hover h2 {
    color: var(--accent);
  }
  time {
    margin-top: auto;
    font-size: 11px;
    line-height: 1;
    text-transform: uppercase;
    color: #9e9e9e;
  }
</style>
