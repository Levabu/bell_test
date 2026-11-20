<script lang="ts">
  import { checkout } from '../../lib/checkout.svelte'
  import { LOGIN_URL, OFFER_URL, periods } from '../../lib/data'
  import { availablePeriods, currencies, formatPrice } from '../../lib/logic/pricing'

  const product = $derived(checkout.product)
  const options = $derived(availablePeriods(product, checkout.currency, periods))
  const currencyList = $derived(currencies(product))
  const isTrial = $derived(checkout.period === 'trial')
  const features = $derived(isTrial && product.features.trial ? product.features.trial : product.features.paid)
  const m1 = $derived(product.prices[checkout.currency]?.m1)
  const webinar = $derived(checkout.source?.webinar)
</script>

<h2 id="checkout-title">{product.name}</h2>
{#if webinar}
  <p class="context">
    Вебинар «{webinar.title}» доступен подписчикам {product.name}. Оформите подписку — и ссылка придёт на почту.
  </p>
{:else}
  <p class="context">{product.tagline}</p>
{/if}
<!-- A subscriber who is signed out lands here too: send them to the site's own sign-in instead of a second payment. -->
<p class="login">
  {webinar ? 'Уже подписаны?' : 'Уже есть подписка?'}
  <a href={LOGIN_URL} target="_blank" rel="noopener">Войдите</a>{webinar ? ' — и смотрите вебинар без оплаты.' : ', чтобы читать без оплаты.'}
</p>

{#if currencyList.length > 1}
  <div class="currency" role="radiogroup" aria-label="Валюта оплаты">
    {#each currencyList as c (c)}
      <button
        type="button"
        role="radio"
        aria-checked={checkout.currency === c}
        class:active={checkout.currency === c}
        onclick={() => checkout.setCurrency(c)}
      >
        {c === 'USD' ? 'USD ($)' : 'RUB (₽)'}
      </button>
    {/each}
  </div>
  <p class="hint">
    {checkout.currency === 'USD' ? 'Оплата картой иностранного банка' : 'Оплата картой банка РФ'}{options.length === 1
      ? `, только ${options[0].label.toLowerCase()} тариф`
      : ''}
  </p>
{/if}

<fieldset class="periods">
  <legend class="visually-hidden">Тариф</legend>
  {#each options as p (p.id)}
    {@const price = product.prices[checkout.currency]![p.id]!}
    {@const old = product.oldPrices[checkout.currency]?.[p.id]}
    {@const saving = product.savings?.[checkout.currency]?.[p.id]}
    <label class="option" class:selected={checkout.period === p.id}>
      <input type="radio" name="period" value={p.id} bind:group={checkout.period} />
      <span class="name">
        {p.label}
        {#if p.id === 'trial'}<em class="badge">Только для новых</em>{/if}
        {#if p.id === 'm12'}<em class="badge soft">Выгоднее</em>{/if}
      </span>
      <span class="price">
        {#if old}<s>{formatPrice(old, checkout.currency)}</s>{/if}
        <strong>{formatPrice(price, checkout.currency)}</strong>
        <small>{p.unit}</small>
      </span>
      <span class="billing">
        {#if p.id === 'trial' && m1 !== undefined}
          Затем {formatPrice(m1, checkout.currency)} в месяц, отмена в любой момент
        {:else}
          {p.billing}{saving ? ` · ${saving}` : ''}
        {/if}
      </span>
    </label>
  {/each}
</fieldset>

<h3 class="inc">Что входит</h3>
<ul class="features">
  {#each features as f (f.text)}
    <li class:off={f.included === false}>{f.text}</li>
  {/each}
</ul>

<button class="btn block" type="button" onclick={() => checkout.toPayment()}>
  Продолжить — {formatPrice(checkout.amount, checkout.currency)}
</button>
<p class="legal">
  Нажимая «Продолжить», вы принимаете <a href={OFFER_URL} target="_blank" rel="noopener">оферту</a>. Подписка
  продлевается автоматически, отменить можно в личном кабинете.
</p>

{#if product.id !== 'unlimited'}
  <button class="upsell" type="button" onclick={() => checkout.selectProduct('unlimited')}>
    <strong>The Bell.Unlimited</strong> — все пять рассылок и все вебинары, выгоднее, чем по отдельности →
  </button>
{/if}

<style>
  h2 {
    margin: 0;
    font: 900 40px/1 var(--display);
    text-transform: uppercase;
  }
  .context {
    margin: 8px 0 8px;
    color: var(--muted);
  }
  .login {
    margin: 0 0 20px;
    font-size: 14px;
  }
  .login a {
    color: var(--accent);
    font-weight: 600;
  }
  .currency {
    display: inline-flex;
    padding: 3px;
    border-radius: var(--radius);
    background: var(--soft);
  }
  .currency button {
    min-height: 36px;
    padding: 6px 14px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
  }
  .currency button.active {
    background: #fff;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }
  .hint {
    margin: 6px 0 16px;
    font-size: 13px;
    color: var(--muted);
  }
  .periods {
    display: grid;
    gap: 10px;
    margin: 0 0 20px;
    padding: 0;
    border: 0;
  }
  .option {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'radio name price'
      'radio billing billing';
    align-items: center;
    gap: 2px 12px;
    padding: 14px 16px;
    border: 1.5px solid var(--line);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .option.selected {
    border-color: var(--accent);
    background: #fff8f7;
  }
  .option input {
    grid-area: radio;
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    margin: 0;
  }
  .name {
    grid-area: name;
    font-weight: 600;
  }
  .badge {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--accent);
    color: #fff;
    font-size: 11px;
    font-style: normal;
    font-weight: 600;
    vertical-align: 2px;
  }
  .badge.soft {
    background: #fde7e5;
    color: var(--accent-hover);
  }
  .price {
    grid-area: price;
    text-align: right;
    white-space: nowrap;
  }
  .price s {
    margin-right: 4px;
    color: var(--muted);
    font-size: 13px;
  }
  .price small {
    display: block;
    font-size: 12px;
    color: var(--muted);
  }
  .billing {
    grid-area: billing;
    font-size: 13px;
    color: var(--muted);
  }
  .inc {
    margin: 0 0 8px;
    font-size: 15px;
  }
  .features {
    margin: 0 0 20px;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 6px;
    font-size: 14px;
  }
  .features li::before {
    content: '✓';
    margin-right: 8px;
    color: var(--success);
    font-weight: 700;
  }
  .features li.off {
    color: var(--muted);
    text-decoration: line-through;
  }
  .features li.off::before {
    content: '✕';
    color: var(--muted);
  }
  .legal {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--muted);
  }
  .upsell {
    display: block;
    width: 100%;
    margin-top: 16px;
    padding: 12px 14px;
    border: 1px dashed var(--line);
    border-radius: var(--radius);
    background: transparent;
    text-align: left;
    font-size: 14px;
    cursor: pointer;
  }
  .upsell:hover {
    border-color: var(--text);
  }
  @media (max-width: 639px) {
    h2 {
      font-size: 32px;
    }
  }
</style>
