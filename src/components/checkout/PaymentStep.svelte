<script lang="ts">
  import { checkout } from '../../lib/checkout.svelte'
  import { periods } from '../../lib/data'
  import { formatPrice } from '../../lib/logic/pricing'
  import { validateCard, formatCardNumber, formatExp, type CardErrors } from '../../lib/logic/card'
  import { TEST_CARDS } from '../../lib/payment'

  let number = $state('')
  let exp = $state('')
  let cvc = $state('')
  let errors = $state<CardErrors>({})
  let submitted = $state(false)

  const period = $derived(periods.find((p) => p.id === checkout.period)!)
  const m1 = $derived(checkout.product.prices[checkout.currency]?.m1)

  $effect(() => {
    if (submitted) errors = validateCard({ email: checkout.email, number, exp, cvc }, new Date())
  })

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    submitted = true
    errors = validateCard({ email: checkout.email, number, exp, cvc }, new Date())
    const first = Object.keys(errors)[0]
    if (first) {
      document.getElementById(`pay-${first}`)?.focus()
      return
    }
    await checkout.pay({ number, exp, cvc })
  }
</script>

<h2 id="checkout-title">Оплата</h2>

<div class="summary">
  <div>
    <strong>{checkout.product.name}</strong>
    <span>{period.label} тариф</span>
  </div>
  <div class="sum">
    <strong>{formatPrice(checkout.amount, checkout.currency)}</strong>
    <span>
      {#if checkout.period === 'trial' && m1 !== undefined}
        затем {formatPrice(m1, checkout.currency)} в месяц
      {:else}
        {period.billing.toLowerCase()}
      {/if}
    </span>
  </div>
</div>

<form onsubmit={submit} novalidate>
  <label class="field">
    <span>Email</span>
    <input
      id="pay-email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
      bind:value={checkout.email}
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? 'err-email' : undefined}
      disabled={checkout.processing}
    />
    <small class="note">Сюда придут рассылки и чек. Пароль не нужен.</small>
    {#if errors.email}<small id="err-email" class="err">{errors.email}</small>{/if}
  </label>

  <fieldset class="card">
    <legend>{checkout.currency === 'RUB' ? 'Карта банка РФ' : 'Карта иностранного банка'}</legend>
    <label class="field">
      <span>Номер карты</span>
      <input
        id="pay-number"
        inputmode="numeric"
        autocomplete="cc-number"
        placeholder="0000 0000 0000 0000"
        value={number}
        oninput={(e) => (number = e.currentTarget.value = formatCardNumber(e.currentTarget.value))}
        aria-invalid={!!errors.number}
        aria-describedby={errors.number ? 'err-number' : undefined}
        disabled={checkout.processing}
      />
      {#if errors.number}<small id="err-number" class="err">{errors.number}</small>{/if}
    </label>
    <div class="row">
      <label class="field">
        <span>Срок действия</span>
        <input
          id="pay-exp"
          inputmode="numeric"
          autocomplete="cc-exp"
          placeholder="ММ/ГГ"
          value={exp}
          oninput={(e) => (exp = e.currentTarget.value = formatExp(e.currentTarget.value))}
          aria-invalid={!!errors.exp}
          aria-describedby={errors.exp ? 'err-exp' : undefined}
          disabled={checkout.processing}
        />
        {#if errors.exp}<small id="err-exp" class="err">{errors.exp}</small>{/if}
      </label>
      <label class="field">
        <span>CVC</span>
        <input
          id="pay-cvc"
          inputmode="numeric"
          autocomplete="cc-csc"
          placeholder="123"
          maxlength="4"
          bind:value={cvc}
          aria-invalid={!!errors.cvc}
          aria-describedby={errors.cvc ? 'err-cvc' : undefined}
          disabled={checkout.processing}
        />
        {#if errors.cvc}<small id="err-cvc" class="err">{errors.cvc}</small>{/if}
      </label>
    </div>
  </fieldset>

  {#if checkout.error}
    <p class="alert" role="alert">{checkout.error}</p>
  {/if}

  <button class="btn block" type="submit" disabled={checkout.processing}>
    {#if checkout.processing}
      <span class="spinner" aria-hidden="true"></span> Проводим платёж…
    {:else}
      Оплатить {formatPrice(checkout.amount, checkout.currency)}
    {/if}
  </button>
</form>

<p class="demo">
  Демо-оплата, деньги не списываются. Успех: <code>{TEST_CARDS.success}</code>, отказ банка:
  <code>{TEST_CARDS.declined}</code>, любой будущий срок и CVC.
</p>

<style>
  h2 {
    margin: 0 0 16px;
    font: 900 40px/1 var(--display);
    text-transform: uppercase;
  }
  .summary {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    padding: 14px 16px;
    border-radius: var(--radius);
    background: var(--soft);
  }
  .summary div {
    display: grid;
    gap: 2px;
  }
  .summary span {
    font-size: 13px;
    color: var(--muted);
  }
  .sum {
    text-align: right;
  }
  form {
    display: grid;
    gap: 14px;
  }
  .field {
    display: grid;
    gap: 6px;
    font-size: 14px;
  }
  .field > span {
    font-weight: 600;
  }
  input {
    width: 100%;
    min-height: 46px;
    padding: 10px 12px;
    border: 1.5px solid var(--line);
    border-radius: var(--radius);
    background: #fff;
    font-size: 16px; /* ≥16px: no iOS zoom on focus */
  }
  input:focus {
    border-color: var(--text);
    outline: none;
  }
  input[aria-invalid='true'] {
    border-color: var(--accent);
  }
  .note {
    color: var(--muted);
  }
  .err {
    color: var(--accent-hover);
  }
  .card {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 16px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
  }
  .card legend {
    padding: 0 6px;
    font-size: 13px;
    color: var(--muted);
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .alert {
    margin: 0;
    padding: 12px 14px;
    border-radius: var(--radius);
    background: #fde7e5;
    color: var(--accent-hover);
    font-size: 14px;
  }
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .demo {
    margin: 16px 0 0;
    font-size: 12px;
    color: var(--muted);
  }
  code {
    white-space: nowrap;
  }
  @media (max-width: 639px) {
    h2 {
      font-size: 32px;
    }
  }
</style>
