<header class="header">
  <div class="inner">
    <a class="logo" href="./" aria-label="The Bell — на главную">The Bell<span>.</span></a>
    <nav class="nav" aria-label="Разделы">
      <span>Новости</span>
      <span>Истории</span>
      <span>Технологии</span>
      <span>Инвестиции</span>
    </nav>
  </div>
</header>

<style>
  .header {
    border-bottom: 1px solid var(--line);
  }
  .inner {
    max-width: 1266px;
    margin: 0 auto;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 40px;
  }
  .logo {
    font: 900 32px/1 var(--display);
    text-transform: uppercase;
    text-decoration: none;
    letter-spacing: 0.01em;
  }
  .logo span {
    color: var(--accent);
  }
  .nav {
    display: flex;
    gap: 24px;
    font-size: 15px;
    color: var(--muted);
  }
  @media (max-width: 639px) {
    .inner {
      padding: 12px 16px;
    }
    .nav {
      display: none;
    }
  }
</style>
