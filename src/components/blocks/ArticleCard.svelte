<script lang="ts">
  import { articles } from '../../lib/data'
  import type { NewsWidget } from '../../lib/types'

  let { config }: { config: NewsWidget } = $props()
  const article = $derived(articles[config.articleIndex])
</script>

{#if article}
  <article class="widget card">
    <img src={article.image} alt="" loading="lazy" />
    <span class="shade" aria-hidden="true"></span>
    <span class="chip light">{article.rubric}</span>
    <h2><a href={article.url} target="_blank" rel="noopener">{article.title}</a></h2>
  </article>
{/if}

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
    background: var(--dark);
    overflow: hidden;
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
  }
  .shade {
    z-index: -1;
    background: linear-gradient(rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.75));
  }
  h2 {
    margin: auto 0 0;
    font: 600 18px/1.3 var(--sans);
  }
  /* The whole card is the link. */
  a {
    color: inherit;
    text-decoration: none;
  }
  a::after {
    content: '';
    position: absolute;
    inset: 0;
  }
  .card {
    isolation: isolate;
  }
  .card:hover h2 {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  @container (min-width: 560px) {
    h2 {
      font-size: 25px;
      line-height: 1.2;
    }
  }
  @container (min-width: 900px) {
    h2 {
      font-size: 46px;
    }
  }
</style>
