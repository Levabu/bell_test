<script lang="ts">
  import { demo, layout, defaultLayout } from '../lib/layout.svelte'
  import { products } from '../lib/data'
  import { WEBINARS_MAX } from '../lib/logic/lines'
  import type { Basis, ProductId, ProductShowcaseBlock, WebinarsBlock, WebinarWidget, WidgetLine } from '../lib/types'

  let open = $state(false)

  const isShowcase = (w: { type: string }): w is ProductShowcaseBlock => w.type === 'product-showcase'
  const showcaseLine = $derived(
    layout.find((l): l is WidgetLine => l.type === 'line' && l.widgets.some(isShowcase)),
  )
  const showcase = $derived(showcaseLine?.widgets.find(isShowcase))
  const webinarsCfg = $derived(layout.find((l): l is WebinarsBlock => l.type === 'webinars'))

  // Webinars as one slot in a mixed row (demo puts it in the middle of row r6).
  const SLOT_ROW = 'r6'
  const isWebinar = (w: { type: string }): w is WebinarWidget => w.type === 'webinar'
  const webinarSlot = $derived(
    layout.flatMap((l) => (l.type === 'line' ? l.widgets : [])).find(isWebinar),
  )
  const placement = $derived(webinarsCfg ? 'row' : 'slot')

  // Swap between "own row" and "one slot", carrying the shared settings over.
  function setPlacement(to: string) {
    const from = webinarsCfg ?? webinarSlot
    if (!from || to === placement) return
    const { productId, showPast } = from
    const row = layout.find((l) => l.id === SLOT_ROW) as WidgetLine
    const origRow = structuredClone(defaultLayout.find((l) => l.id === SLOT_ROW) as WidgetLine)
    if (to === 'slot') {
      layout.splice(layout.indexOf(webinarsCfg!), 1)
      row.widgets = [origRow.widgets[0], { id: 'webinar', type: 'webinar', productId, showPast }, origRow.widgets[2]]
    } else {
      row.widgets = origRow.widgets
      const def = structuredClone(defaultLayout.find((l) => l.type === 'webinars') as WebinarsBlock)
      layout.splice(defaultLayout.indexOf(defaultLayout.find((l) => l.type === 'webinars')!), 0, { ...def, productId, showPast })
    }
  }

  function setView(view: WebinarsBlock['view']) {
    if (!webinarsCfg) return
    webinarsCfg.view = view
    webinarsCfg.limit = Math.min(webinarsCfg.limit, WEBINARS_MAX[view])
  }

  // Move the showcase between slot sizes: same row, neighbours taken from the default layout.
  function setSlot(basis: Basis) {
    if (!showcaseLine || !showcase) return
    const orig = defaultLayout.find((l) => l.id === showcaseLine.id) as WidgetLine
    const [left, right] = structuredClone(orig.widgets.filter((w) => !isShowcase(w)))
    showcaseLine.basis = basis
    showcaseLine.widgets = basis === 100 ? [showcase] : basis === 50 ? [showcase, right] : [left, showcase, right]
  }

  // <input type="date"> ↔ Date (noon UTC, so the Moscow calendar day matches)
  const dateValue = $derived(demo.now.toISOString().slice(0, 10))
  function setDate(v: string) {
    if (v) demo.now = new Date(`${v}T12:00:00Z`)
  }

  const reader = $derived(demo.owned.length === 0 ? 'guest' : demo.owned.includes('unlimited') ? 'unlimited' : demo.owned[0])
  function setReader(v: string) {
    demo.owned = v === 'guest' ? [] : [v as ProductId]
  }

  function reset() {
    layout.splice(0, layout.length, ...structuredClone(defaultLayout))
    demo.now = new Date()
    demo.owned = []
  }
</script>

<div class="demo" class:open>
  <button class="toggle" type="button" aria-expanded={open} aria-controls="demo-panel" onclick={() => (open = !open)}>
    {open ? '✕ Закрыть' : '⚙ Настройки блоков'}
  </button>

  {#if open}
    <div id="demo-panel" class="panel">
      <p class="hint">Так выглядят настройки блоков в конструкторе. Меняйте — главная перестраивается.</p>

      {#if showcase}
        <fieldset>
          <legend>Витрина продуктов</legend>
          <label>Режим
            <select bind:value={showcase.mode}>
              <option value="rotate">Ротация по дням</option>
              <option value="pinned">Закрепить продукт</option>
            </select>
          </label>
          {#if showcase.mode === 'pinned'}
            <label>Продукт
              <select bind:value={showcase.pinned}>
                {#each products as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
              </select>
            </label>
          {:else}
            <div class="checks">
              {#each products as p (p.id)}
                <label class="check"><input type="checkbox" value={p.id} bind:group={showcase.pool} />{p.name}</label>
              {/each}
            </div>
          {/if}
          <label>Слот в ряду
            <select value={showcaseLine?.basis} onchange={(e) => setSlot(Number(e.currentTarget.value) as Basis)}>
              <option value={33}>Треть ряда (33%)</option>
              <option value={50}>Половина ряда (50%)</option>
              <option value={100}>Весь ряд (100%)</option>
            </select>
          </label>
        </fieldset>
      {/if}

      <fieldset>
        <legend>Вебинары</legend>
        <label>Размещение
          <select value={placement} onchange={(e) => setPlacement(e.currentTarget.value)}>
            <option value="row">Отдельный ряд</option>
            <option value="slot">Слот в ряду с материалами</option>
          </select>
        </label>
        {#if webinarsCfg}
          <label>Вид ряда
            <select value={webinarsCfg.view} onchange={(e) => setView(e.currentTarget.value as WebinarsBlock['view'])}>
              <option value="feed">Лента: 4 в ряд, свайп на телефоне</option>
              <option value="blocks">Крупные блоки: до 3 в ряд</option>
            </select>
          </label>
          {#if webinarsCfg.view === 'feed'}
            <p class="note">Если вебинаров меньше 4, ряд покажется крупными блоками.</p>
          {/if}
          <label>Продукт
            <select bind:value={webinarsCfg.productId}>
              <option value={null}>Все продукты</option>
              {#each products as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
            </select>
          </label>
          <label>Сколько показывать
            <input type="number" min="1" max={WEBINARS_MAX[webinarsCfg.view]} bind:value={webinarsCfg.limit} />
          </label>
          <label class="check"><input type="checkbox" bind:checked={webinarsCfg.showPast} />Добирать прошедшими (записи)</label>
        {:else if webinarSlot}
          <label>Продукт
            <select bind:value={webinarSlot.productId}>
              <option value={null}>Все продукты</option>
              {#each products as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
            </select>
          </label>
          <label class="check"><input type="checkbox" bind:checked={webinarSlot.showPast} />Если нет будущих — последняя запись</label>
        {/if}
      </fieldset>

      <fieldset>
        <legend>Проверка (не в админке)</legend>
        <label>Дата
          <input type="date" value={dateValue} oninput={(e) => setDate(e.currentTarget.value)} />
        </label>
        <label>Читатель
          <select value={reader} onchange={(e) => setReader(e.currentTarget.value)}>
            <option value="guest">Без подписки</option>
            {#each products as p (p.id)}<option value={p.id}>Подписчик {p.name}</option>{/each}
          </select>
        </label>
      </fieldset>

      <button class="reset" type="button" onclick={reset}>Сбросить</button>
    </div>
  {/if}
</div>

<style>
  .demo {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 10;
    font-size: 14px;
  }
  .toggle {
    min-height: 44px;
    padding: 10px 16px;
    border: 0;
    border-radius: 999px;
    background: var(--dark);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }
  .panel {
    position: absolute;
    left: 0;
    bottom: 56px;
    width: min(340px, calc(100vw - 32px));
    max-height: calc(100dvh - 100px);
    overflow: auto;
    padding: 16px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
    display: grid;
    gap: 12px;
  }
  .hint {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
  }
  fieldset {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 10px 12px 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
  }
  legend {
    padding: 0 4px;
    font-weight: 700;
  }
  label {
    display: grid;
    gap: 4px;
    font-size: 13px;
    color: var(--muted);
  }
  label.check {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
  }
  .checks {
    display: grid;
    gap: 4px;
  }
  select,
  input:not([type='checkbox']) {
    min-height: 36px;
    padding: 6px 8px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: #fff;
    color: var(--text);
    font-size: 14px;
  }
  .note {
    margin: 0;
    font-size: 12px;
    color: var(--muted);
  }
  .reset {
    justify-self: start;
    border: 0;
    background: none;
    color: var(--accent);
    cursor: pointer;
    padding: 4px 0;
  }
</style>
