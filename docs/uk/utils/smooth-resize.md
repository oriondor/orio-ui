# Плавна зміна розміру

Анімація висоти для всієї сторінки. Будь-який елемент з `data-smooth-resize`
анімує висоту, коли його вміст росте чи зменшується — перемкнені вкладки,
розгорнуті секції, асинхронний вміст. Без композаблів і коду в кожному
компоненті. `<orio-modal>` має цей атрибут, тож зміни вмісту у відкритому
модальному вікні плавно змінюють розмір.

## Живе демо

<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<div class="demo-container">
  <orio-button @click="expanded = !expanded">
    {{ expanded ? 'Менше' : 'Більше' }}
  </orio-button>
  <div data-smooth-resize :style="{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)' }">
    <div :style="{ padding: '1rem' }">
      <orio-view-text>Перший рядок завжди тут.</orio-view-text>
      <template v-if="expanded">
        <orio-view-text>Другий рядок.</orio-view-text>
        <orio-view-text>Третій рядок.</orio-view-text>
        <orio-view-text>Четвертий рядок.</orio-view-text>
      </template>
    </div>
  </div>
</div>

## Використання

```vue
<div data-smooth-resize>
  <div>…вміст, що змінюється…</div>
</div>
```

Модуль Nuxt запускає спостерігач на клієнті. Без Nuxt запустіть його один
раз:

```ts
import { startSmoothResize } from "orio-ui/runtime";

startSmoothResize();
```

## Примітки

- Вимірюється **перший дочірній елемент**, анімується елемент з атрибутом.
  Дочірній елемент має зберігати природну висоту — без розміру від
  контейнера (без `height: 100%`, без flex-shrink).
- Лише висота. Зміна ширини відбувається миттєво.
- `overflow: hidden` діє лише під час анімації.
- Перший розмір нового елемента (монтування, заміна дочірнього через
  `v-if`) не анімується. Зміна посеред анімації продовжується з поточної
  висоти.
- 250 мс, вимикається при `prefers-reduced-motion: reduce`.
- Один `ResizeObserver` і один `MutationObserver` на всю сторінку;
  елементи, додані чи видалені пізніше, підхоплюються автоматично.
