<script lang="ts">
  import Header from './components/Header.svelte'
  import HomeGrid from './components/HomeGrid.svelte'
  import CheckoutModal from './components/checkout/CheckoutModal.svelte'
  import DemoPanel from './components/DemoPanel.svelte'
</script>

<Header />
<main class="page">
  <h1 class="visually-hidden">The Bell — деловые новости и аналитика</h1>
  <HomeGrid />
</main>
<footer class="footer">
  <p>Демо-стенд блоков подписки для главной The Bell. Данные — снимок thebell.io и the-chat.io на 19.11.2026, оплата имитируется.</p>
</footer>

<CheckoutModal />
<DemoPanel />

<style>
  .page {
    max-width: 1266px;
    margin: 0 auto;
    padding: 10px 16px 64px;
  }
  .footer {
    border-top: 1px solid var(--line);
    padding: 24px 32px 96px;
    color: var(--muted);
    font-size: 13px;
    text-align: center;
  }
  @media (max-width: 767px) {
    .page {
      padding: 8px 4px 48px;
    }
    .footer {
      padding: 20px 16px 96px;
    }
  }
</style>
