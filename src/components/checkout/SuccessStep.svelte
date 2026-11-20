<script lang="ts">
  import { checkout } from '../../lib/checkout.svelte'
  import { formatDay, formatTime } from '../../lib/logic/format'
  import { subscriberAction, webinarStatus } from '../../lib/logic/webinars'
  import { demo } from '../../lib/layout.svelte'
  import { WEBINARS_URL } from '../../lib/data'

  const webinar = $derived(checkout.source?.webinar)
  // Same rule as the card: upcoming → registered, link by email; live/past → the stream or recording link.
  const action = $derived(webinar ? subscriberAction({ ...webinar, status: webinarStatus(webinar, demo.now) }, WEBINARS_URL) : null)

  let done: HTMLButtonElement | undefined = $state()
  $effect(() => done?.focus())
</script>

<div class="success" role="status">
  <div class="check" aria-hidden="true">✓</div>
  <h2 id="checkout-title">Подписка оформлена</h2>
  <p class="lead">
    Вы подписались на {checkout.product.name}. Чек и доступ отправили на <strong>{checkout.email}</strong>.
  </p>

  <ul class="next">
    {#if webinar && action}
      {#if action.kind === 'link'}
        <li>
          Вебинар «{webinar.title}» уже доступен:
          <a href={action.href} target="_blank" rel="noopener">{action.label.toLowerCase()}</a>.
        </li>
      {:else}
        {@const d = formatDay(webinar.startsAt)}
        <li>
          Вы зарегистрированы на вебинар «{webinar.title}» — {d.day}
          {d.month}, {formatTime(webinar.startsAt)}. Ссылку пришлём на почту накануне.
        </li>
      {/if}
    {/if}
    <li>Первое письмо придёт в ближайший выпуск рассылки.</li>
    <li>Управлять подпиской и отменить её можно в личном кабинете.</li>
  </ul>

  <p class="order">Номер заказа: {checkout.orderId}</p>

  <button bind:this={done} class="btn block" type="button" onclick={() => checkout.close()}>Вернуться к чтению</button>
</div>

<style>
  .success {
    text-align: center;
    padding-top: 8px;
  }
  .check {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: var(--success);
    color: #fff;
    font-size: 32px;
    font-weight: 700;
  }
  h2 {
    margin: 0;
    font: 900 40px/1 var(--display);
    text-transform: uppercase;
  }
  .lead {
    margin: 12px 0 20px;
  }
  .next {
    margin: 0 0 16px;
    padding: 16px 16px 16px 36px;
    border-radius: var(--radius);
    background: var(--soft);
    text-align: left;
    font-size: 14px;
    display: grid;
    gap: 8px;
  }
  .order {
    margin: 0 0 20px;
    font-size: 12px;
    color: var(--muted);
  }
  @media (max-width: 639px) {
    h2 {
      font-size: 32px;
    }
  }
</style>
