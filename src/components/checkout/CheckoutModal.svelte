<script lang="ts">
  import { checkout } from '../../lib/checkout.svelte'
  import TariffsStep from './TariffsStep.svelte'
  import PaymentStep from './PaymentStep.svelte'
  import SuccessStep from './SuccessStep.svelte'

  let dialog: HTMLDialogElement | undefined = $state()

  // Native <dialog>: focus trap, Esc, top layer and inert background for free.
  $effect(() => {
    if (!dialog) return
    if (checkout.open && !dialog.open) dialog.showModal()
    if (!checkout.open && dialog.open) dialog.close()
  })

  function onCancel(e: Event) {
    // Esc: don't close while a payment is in flight.
    if (!checkout.close()) e.preventDefault()
  }

  function onBackdrop(e: MouseEvent) {
    if (e.target === dialog) checkout.close()
  }

  const stepLabel = { tariffs: 'Шаг 1 из 2', payment: 'Шаг 2 из 2', success: '' }
</script>

<dialog
  bind:this={dialog}
  class="modal"
  aria-labelledby="checkout-title"
  oncancel={onCancel}
  onclose={() => checkout.close()}
  onclick={onBackdrop}
>
  {#if checkout.open}
    <div class="sheet">
      <div class="bar">
        {#if checkout.step === 'payment'}
          <button class="icon" type="button" onclick={() => checkout.back()} disabled={checkout.processing} aria-label="Назад к тарифам">←</button>
        {/if}
        <span class="step">{stepLabel[checkout.step]}</span>
        <button class="icon close" type="button" onclick={() => checkout.close()} disabled={checkout.processing} aria-label="Закрыть">✕</button>
      </div>

      {#if checkout.step === 'tariffs'}
        <TariffsStep />
      {:else if checkout.step === 'payment'}
        <PaymentStep />
      {:else}
        <SuccessStep />
      {/if}
    </div>
  {/if}
</dialog>

<style>
  .modal {
    width: min(560px, calc(100vw - 32px));
    max-height: calc(100dvh - 48px);
    padding: 0;
    border: 0;
    border-radius: 14px;
    background: #fff;
    color: var(--text);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: auto;
    overscroll-behavior: contain;
  }
  .modal::backdrop {
    background: rgba(0, 0, 0, 0.55);
  }
  .sheet {
    padding: 12px 28px 28px;
  }
  .bar {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 -28px 8px;
    padding: 4px 16px;
    background: #fff;
  }
  .step {
    font-size: 13px;
    color: var(--muted);
    padding-left: 12px;
  }
  .icon {
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
  }
  .icon:hover {
    background: var(--soft);
  }
  .icon:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .close {
    margin-left: auto;
  }

  /* Phone: bottom sheet, full width. */
  @media (max-width: 639px) {
    .modal {
      width: 100vw;
      max-width: 100vw;
      max-height: 94dvh;
      margin: auto 0 0;
      border-radius: 16px 16px 0 0;
    }
    .sheet {
      padding: 8px 20px calc(24px + env(safe-area-inset-bottom));
    }
    .bar {
      margin: 0 -20px 4px;
      padding: 4px 8px;
    }
  }
</style>
