# useLongPress

Розпізнавання довгого натискання для будь-якого елемента. Лежить в основі `<orio-long-press>`;
використовуйте напряму, коли потрібна поведінка без ефекту зменшення, який дає обгортка.

## Живе демо

<script setup>
import { ref } from 'vue'
import { useLongPress } from '../../../src/runtime/composables/useLongPress'

const target = ref(null)
const log = ref([])

const { isPressing, isHolding } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift('start'),
  onCancel: () => log.value.unshift('cancel'),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
})
</script>

<div class="demo-container">
  <div
    ref="target"
    :style="{
      padding: '2rem',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--border-radius-md)',
      userSelect: isHolding ? 'none' : 'auto',
      WebkitUserSelect: isHolding ? 'none' : 'auto',
      WebkitTouchCallout: isHolding ? 'none' : 'default',
      background: isPressing ? 'var(--color-surface)' : 'transparent',
    }"
  >
    <orio-view-text>Утримуйте тут</orio-view-text>
  </div>
  <orio-view-text>{{ log.slice(0, 5).join(' ← ') }}</orio-view-text>
</div>

## Використання

```ts
const target = ref<HTMLElement | null>(null);

const { isPressing, isHolding } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift("start"),
  onCancel: () => log.value.unshift("cancel"),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
});
```

## Опції

| Опція | Тип | За замовчуванням | Опис |
|---|---|---|---|
| `delay` | `MaybeRefOrGetter<number>` | `500` | Час утримання в мс |
| `moveTolerance` | `MaybeRefOrGetter<number>` | `10` | Зсув у px, що скасовує натискання |
| `forceTouch` | `MaybeRefOrGetter<boolean>` | `true` | Force click у Safari спрацьовує одразу |
| `disabled` | `MaybeRefOrGetter<boolean>` | `false` | Ігнорувати натискання; скасовує активне |
| `onStart` | `(event: PointerEvent) => void` | — | Основний вказівник натиснуто |
| `onCancel` | `() => void` | — | Натискання завершилося без спрацювання |
| `onTrigger` | `(event, source: "hold" \| "force") => void` | обов'язкова | Утримання досягло `delay` або стався force click |

## Повертає

| Ключ | Тип | Опис |
|---|---|---|
| `isPressing` | `Readonly<Ref<boolean>>` | `true` від pointerdown до спрацювання або скасування |
| `isHolding` | `Readonly<Ref<boolean>>` | `true` від pointerdown, доки палець не піднято або натискання не скасовано — триває й після спрацювання |

## Примітки

- Клік після спрацювання поглинається (фаза перехоплення на `window`, тож це
  охоплює й відпускання над оверлеєм, який відкрило спрацювання). Кліки з клавіатури
  проходять; Ctrl+клік ніколи не починає натискання.
- Вкладені цілі: натискання обробляє лише найглибша.
- Поки `isHolding`, `selectstart` і `contextmenu` на цілі блокуються; під час
  спрацювання будь-яке виділення всередині цілі знімається. Для iOS прив'яжіть
  `user-select: none` / `-webkit-touch-callout: none` до `isHolding`.
- Не плутайте з `usePressAndHold`, який повторює колбек, поки кнопку утримують.
