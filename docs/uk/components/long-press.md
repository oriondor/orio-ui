# LongPress

Обгортає будь-який елемент і генерує `trigger` після натискання з утриманням — вебверсія
Haptic Touch. Поки елемент утримують, він повільно зменшується, тож користувач
бачить, що щось відбувається. У Safari на macOS із трекпадом Force Touch
сильний клік спрацьовує одразу.

## Живе демо

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import { useModal } from '../../../src/runtime/composables/useModal'
import { useToast } from '../../../src/runtime/composables/useToast'
import { mountToastHost } from '../../../src/runtime/components/Toast/mount'

const { modalProps, openModal } = useModal()
const { showToast } = useToast()

// These docs are not a Nuxt app, so the toast host is mounted by hand here.
const instance = getCurrentInstance()
onMounted(() => mountToastHost(instance.appContext))

const fileActions = [
  { label: 'Перейменувати', icon: 'edit' },
  { label: 'Дублювати', icon: 'copy' },
  { label: 'Поділитися', icon: 'share' },
  { label: 'Видалити', icon: 'delete' },
]

function runFileAction(action, close) {
  showToast({ message: `${action.label}: report.pdf`, variant: 'info' })
  close()
}

function copyLink(event, source) {
  showToast({ message: `Посилання скопійовано (${source})`, variant: 'success' })
}

function deleteProject() {
  showToast({
    message: 'Проєкт видалено',
    variant: 'danger',
    actions: [{ label: 'Скасувати', onClick: () => showToast({ message: 'Відновлено' }) }],
  })
}

function hintHoldLonger() {
  showToast({ message: 'Утримуйте довше, щоб видалити', variant: 'alert' })
}

const isKeyRevealed = ref(false)

const pikachu = {
  name: 'Pikachu',
  handle: '@pikachu · Lv. 25',
  bio: 'Електричний тип. Накопичує заряд у щоках і вивільняє його, коли злякається.',
  location: 'Смарагдовий ліс',
  badges: ['Електричний', 'Стартовий', 'Талісман'],
  avatar:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
}

function openProfile() {
  alert('Вас буде перенаправлено до профілю')
}
</script>

### Відкрити модальне вікно утриманням

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press @trigger="openModal">
      <orio-button>Утримуй мене</orio-button>
    </orio-long-press>
  </div>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Прихована функція</orio-view-text>
    <orio-view-text>Відкрито довгим натисканням.</orio-view-text>
    <orio-button @click="modalProps.show = false">Закрити</orio-button>
  </orio-modal>
</div>

### Контекстне меню в поповері

Клік відкриває файл, довге натискання — його дії. Розмістіть long press
у слоті за замовчуванням поповера й викликайте `toggle(true)` під час спрацювання.

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="bottom">
      <template #default="{ toggle }">
        <orio-long-press @trigger="toggle(true)">
          <orio-button
            variant="secondary"
            icon="file"
            @click="showToast({ message: 'Відкрито report.pdf' })"
          >
            report.pdf
          </orio-button>
        </orio-long-press>
      </template>
      <template #content="{ toggle }">
        <div
          style="
            display: flex;
            flex-direction: column;
            padding: 0.25rem;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
          "
        >
          <orio-button
            v-for="action in fileActions"
            :key="action.label"
            variant="subdued"
            :icon="action.icon"
            @click="runFileAction(action, () => toggle(false))"
          >
            {{ action.label }}
          </orio-button>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

### Картка користувача з попереднім переглядом

Клікніть картку, щоб відкрити профіль; утримайте, щоб спершу зазирнути.

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="bottom">
      <template #default="{ toggle }">
        <orio-long-press @trigger="toggle(true)">
          <button
            type="button"
            style="
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding: 0.5rem 1rem 0.5rem 0.5rem;
              background: var(--color-surface);
              border: 1px solid var(--color-border);
              border-radius: var(--border-radius-pill);
              color: var(--color-text);
              font: inherit;
              cursor: pointer;
            "
            @click="openProfile"
          >
            <img
              :src="pikachu.avatar"
              :alt="pikachu.name"
              draggable="false"
              style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
                background: var(--color-bg);
                border: 2px solid var(--color-accent);
              "
            />
            <orio-view-text type="subtitle">{{ pikachu.name }}</orio-view-text>
          </button>
        </orio-long-press>
      </template>
      <template #content>
        <div
          style="
            min-width: 240px;
            padding: 1rem;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
          "
        >
          <orio-view-text type="title">{{ pikachu.name }}</orio-view-text>
          <orio-view-text type="italics">{{ pikachu.handle }}</orio-view-text>
          <orio-view-text>{{ pikachu.bio }}</orio-view-text>
          <orio-view-text icon="map-pin">{{ pikachu.location }}</orio-view-text>
          <div class="demo-row" style="margin-top: 0.5rem; gap: 0.5rem;">
            <orio-tag
              v-for="badge in pikachu.badges"
              :key="badge"
              :text="badge"
              variant="accent"
            />
          </div>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

### Швидка дія зі сповіщенням

`source` відрізняє утримання від force click у Safari.

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press @trigger="copyLink">
      <orio-button variant="secondary" icon="link">Утримуйте, щоб скопіювати посилання</orio-button>
    </orio-long-press>
  </div>
</div>

### Утримання для підтвердження

Довший `delay` і глибший `scale` для руйнівних дій. `press-cancel`
пояснює, що пішло не так, коли користувач відпускає зарано.

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press
      :delay="1500"
      :scale="0.85"
      @trigger="deleteProject"
      @press-cancel="hintHoldLonger"
    >
      <orio-button icon="delete">Утримуйте, щоб видалити проєкт</orio-button>
    </orio-long-press>
  </div>
</div>

### Показати приховане значення

<div class="demo-container">
  <div class="demo-row">
    <orio-view-text>API-ключ</orio-view-text>
    <orio-long-press @trigger="isKeyRevealed = !isKeyRevealed">
      <orio-button variant="subdued" :icon="isKeyRevealed ? 'eye-off' : 'eye'">
        {{ isKeyRevealed ? 'Мій пароль' : '••••••••••••••••' }}
      </orio-button>
    </orio-long-press>
  </div>
</div>

## Використання

```vue
<template>
  <orio-long-press @trigger="openModal">
    <orio-button>Hold me</orio-button>
  </orio-long-press>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Контекстне меню в поповері

```vue
<template>
  <orio-popover position="bottom">
    <template #default="{ toggle }">
      <orio-long-press @trigger="toggle(true)">
        <orio-button variant="secondary" icon="file" @click="openFile">
          report.pdf
        </orio-button>
      </orio-long-press>
    </template>
    <template #content="{ toggle }">
      <div class="menu-panel">
        <orio-button
          v-for="action in fileActions"
          :key="action.label"
          variant="subdued"
          :icon="action.icon"
          @click="runFileAction(action, () => toggle(false))"
        >
          {{ action.label }}
        </orio-button>
      </div>
    </template>
  </orio-popover>
</template>
```

### Картка користувача з попереднім переглядом

```vue
<template>
  <orio-popover position="bottom">
    <template #default="{ toggle }">
      <orio-long-press @trigger="toggle(true)">
        <button type="button" class="user-card" @click="openProfile">
          <img :src="user.avatar" :alt="user.name" draggable="false" />
          <orio-view-text type="subtitle">{{ user.name }}</orio-view-text>
        </button>
      </orio-long-press>
    </template>
    <template #content>
      <div class="user-peek">
        <orio-view-text type="title">{{ user.name }}</orio-view-text>
        <orio-view-text type="italics">{{ user.handle }}</orio-view-text>
        <orio-view-text>{{ user.bio }}</orio-view-text>
        <orio-view-text icon="map-pin">{{ user.location }}</orio-view-text>
      </div>
    </template>
  </orio-popover>
</template>
```

### Утримання для підтвердження

```vue
<template>
  <orio-long-press
    :delay="1500"
    :scale="0.85"
    @trigger="deleteProject"
    @press-cancel="hintHoldLonger"
  >
    <orio-button icon="delete">Hold to delete project</orio-button>
  </orio-long-press>
</template>
```

## Пропси

| Проп            | Тип       | За замовчуванням | Опис                                                  |
| --------------- | --------- | ------- | -------------------------------------------------------------- |
| `delay`         | `number`  | `500`   | Час утримання в мс до `trigger`                                |
| `scale`         | `number`  | `0.95`  | Масштаб у момент спрацювання                                   |
| `forceTouch`    | `boolean` | `true`  | Force click у Safari спрацьовує одразу й блокує Look Up        |
| `disabled`      | `boolean` | `false` | Без відгуку й подій; звичайні кліки працюють                   |
| `moveTolerance` | `number`  | `10`    | Зсув вказівника в px, що скасовує натискання                   |

## Події

| Подія          | Дані                                                             | Опис                                 |
| -------------- | ---------------------------------------------------------------- | ------------------------------------ |
| `trigger`      | `(event: PointerEvent \| MouseEvent, source: "hold" \| "force")` | Утримання досягло `delay` або стався force click |
| `press-start`  | `(event: PointerEvent)`                                          | Основний вказівник натиснуто         |
| `press-cancel` | —                                                                | Натискання завершилося без спрацювання |

`trigger` передає оригінальну подію, тож `@trigger="openModal"` анімує
модальне вікно з натиснутого елемента.

## Поведінка

- Клік, що йде після спрацювання, поглинається — обгорнута кнопка не
  активується вдруге. Коротке натискання — це звичайний клік.
- Активація з клавіатури (Enter / Space) ніколи не поглинається.
- Враховується лише ліва кнопка / основний вказівник. Ctrl+клік (жест
  контекстного меню в macOS) ігнорується.
- Зсув понад `moveTolerance`, вихід за межі елемента чи прокручування дотиком скасовують натискання.
- Поки палець натиснуто — зокрема після `trigger`, до відпускання, —
  виділення тексту, виноска iOS і нативне контекстне меню заблоковані.
  Решту часу текст усередині обгортки можна виділяти.
- З `prefers-reduced-motion: reduce` масштабування пропускається; `trigger` усе одно спрацьовує.

## Підтримка браузерів

Довге натискання працює всюди. Force click використовує пропрієтарні події Safari
`webkitmouseforce*` — Chrome, Firefox та iOS не надають даних про силу натискання на трекпад
чи екран, тож там це звичайне довге натискання.

## Доступність

Довге натискання не має клавіатурного відповідника. Переконайтеся, що дія за
`trigger` доступна й іншим способом (кнопка меню, гаряча клавіша).
