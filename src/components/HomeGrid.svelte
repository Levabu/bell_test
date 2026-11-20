<script lang="ts">
  import { layout } from '../lib/layout.svelte'
  import WidgetLine from './WidgetLine.svelte'
  import WebinarsLine from './blocks/WebinarsLine.svelte'
</script>

<!-- Renders the rows the builder stored, top to bottom. -->
<div class="lines">
  {#each layout as line (line.id)}
    {#if line.type === 'line'}
      <WidgetLine {line} />
    {:else if line.type === 'webinars'}
      <WebinarsLine config={line} />
    {/if}
  {/each}
</div>
