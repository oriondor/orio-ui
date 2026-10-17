# NavButton

Мінімалістична навігаційна кнопка з прозорим фоном і ефектом наведення лише на тексті — ідеальна для навігаційних меню та бічних панелей.

## Живе демо

<script setup>
import { ref } from 'vue'

const currentPage = ref('home')

function navigate(page) {
  currentPage.value = page
  console.log('Navigating to:', page)
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button
      :active="currentPage === 'home'"
      @click="navigate('home')"
    >
      Головна
    </orio-nav-button>
    <orio-nav-button
      :active="currentPage === 'about'"
      @click="navigate('about')"
    >
      Про нас
    </orio-nav-button>
    <orio-nav-button
      :active="currentPage === 'contact'"
      @click="navigate('contact')"
    >
      Контакти
    </orio-nav-button>
  </div>
</div>

## З іконками

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button icon="home" @click="navigate('home')">Головна</orio-nav-button>
    <orio-nav-button icon="settings" @click="navigate('settings')">Налаштування</orio-nav-button>
    <orio-nav-button icon="user" @click="navigate('profile')">Профіль</orio-nav-button>
  </div>
</div>

## Лише іконка

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button icon="home" @click="navigate('home')" />
    <orio-nav-button icon="settings" @click="navigate('settings')" />
    <orio-nav-button icon="user" @click="navigate('profile')" />
    <orio-nav-button icon="bell" />
  </div>
</div>

## Стани

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button>Звичайна</orio-nav-button>
    <orio-nav-button :active="true">Активна</orio-nav-button>
    <orio-nav-button :disabled="true">Вимкнена</orio-nav-button>
  </div>
</div>

## Як посилання {#as-a-link}

Передайте `to` для справжньої навігації: кнопка отримує справжній `href`, тож працюють пошукові роботи
та «відкрити в новій вкладці», а внутрішні шляхи йдуть через Vue router (без перезавантаження). `active` і далі керує підсвічуванням
та `aria-current`. Поки `disabled`, `href` прибирається, а посилання позначається `aria-disabled`.

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button to="#as-a-link" :active="true">Меню</orio-nav-button>
    <orio-nav-button to="#as-a-link">Про нас</orio-nav-button>
    <orio-nav-button to="#as-a-link" disabled>Незабаром</orio-nav-button>
  </div>
</div>

```vue
<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <nav>
    <orio-nav-button to="/menu" :active="route.path === '/menu'">Menu</orio-nav-button>
    <orio-nav-button to="/about" :active="route.path === '/about'">About</orio-nav-button>
  </nav>
</template>
```

## Використання

### Базова навігація

```vue
<template>
  <nav>
    <orio-nav-button @click="goHome">Home</orio-nav-button>
    <orio-nav-button @click="goAbout">About</orio-nav-button>
    <orio-nav-button @click="goContact">Contact</orio-nav-button>
  </nav>
</template>

<script setup>
function goHome() {
  // Navigate to home
}

function goAbout() {
  // Navigate to about
}

function goContact() {
  // Navigate to contact
}
</script>
```

### З активним станом

```vue
<template>
  <nav>
    <orio-nav-button
      :active="currentRoute === '/'"
      @click="navigate('/')"
    >
      Home
    </orio-nav-button>
    <orio-nav-button
      :active="currentRoute === '/about'"
      @click="navigate('/about')"
    >
      About
    </orio-nav-button>
  </nav>
</template>

<script setup>
const currentRoute = ref('/')

function navigate(route) {
  currentRoute.value = route
  // Router navigation logic
}
</script>
```

### З іконками

```vue
<!-- Icon before text -->
<orio-nav-button icon="home" @click="goHome">Home</orio-nav-button>

<!-- Icon only (automatically rounds to circle) -->
<orio-nav-button icon="settings" @click="goSettings" />
```

### Приклад бічного меню

```vue
<template>
  <aside class="sidebar">
    <orio-nav-button
      icon="dashboard"
      :active="isActive('dashboard')"
      @click="navigate('dashboard')"
    >
      Dashboard
    </orio-nav-button>
    <orio-nav-button
      icon="analytics"
      :active="isActive('analytics')"
      @click="navigate('analytics')"
    >
      Analytics
    </orio-nav-button>
    <orio-nav-button
      icon="settings"
      :active="isActive('settings')"
      @click="navigate('settings')"
    >
      Settings
    </orio-nav-button>
  </aside>
</template>

<script setup>
const route = useRoute()

function isActive(page) {
  return route.path === `/${page}`
}

function navigate(page) {
  navigateTo(`/${page}`)
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}
</style>
```

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `icon` | `string` | `undefined` | Назва іконки з реєстру іконок |
| `disabled` | `boolean` | `false` | Вимикає взаємодію: `aria-disabled`, без `href`, поза порядком табуляції |
| `active` | `boolean` | `false` | Позначає поточну/активну сторінку чи розділ |
| `to` | `RouteLocationRaw` | `undefined` | Рендерити як справжнє `<a href>` (навігація роутером для внутрішніх шляхів); ігнорується, поки `disabled` |

**Примітка:** NavButton завжди рендерить один `<a>`. Без `to` це якір з `role="button"`, тож він ніколи не надсилає форму — для цього використовуйте `<orio-button>`.

## Події

| Подія | Дані | Опис |
|-------|---------|-------------|
| `click` | `PointerEvent` | Генерується під час кліку (коли не вимкнена) |

## Слоти

| Слот | Пропси | Опис |
|------|-------|-------------|
| `default` | - | Текстовий вміст кнопки |
| `icon` | - | Власний вміст іконки |

## Стилізація

NavButton використовує такі CSS-змінні:

```css
--color-text          /* Default text color */
--color-accent        /* Hover and active state color */
--border-radius-md    /* Border radius */
```

## Доступність

- **Клавіатура**: без `to` активується клавішами Enter і Space; з `to` Enter нативно переходить за посиланням
- **Видимий фокус**: під час фокусу з клавіатури з'являється обведення 2px
- **ARIA**: `role="button"` без `to`, `aria-disabled="true"`, коли вимкнена, `aria-current="page"`, коли `active` дорівнює true
- **Семантичний HTML**: один елемент `<a>` — справжнє посилання з `to`, якір з роллю кнопки без нього

## Сценарії використання

### Навігаційні меню
Ідеально для головних навігаційних панелей, де потрібні стримані мінімалістичні кнопки, що не конкурують із вмістом.

### Бічна навігація
Чудово підходить для бічних меню в дашбордах і адмін-панелях, де треба позначати поточний розділ.

### Навігація на кшталт вкладок
Добре працює як альтернатива традиційним вкладкам, коли потрібен стриманіший вигляд.

### Другорядні дії
Використовуйте для менш помітних дій у панелях інструментів чи заголовках, де основні кнопки були б завеликими.

## Нотатки щодо дизайну

NavButton відрізняється від стандартного компонента Button:
- **Без фону**: завжди прозора, ніколи не заповнена
- **Без рамки**: чистий мінімалістичний вигляд
- **Наведення лише на тексті**: під час наведення змінюється лише колір тексту, а не фон
- **Активний стан**: вбудована підтримка позначення поточної сторінки чи розділу
- **Один стиль**: без варіантів — єдиний дизайн, сфокусований на навігації

Використовуйте NavButton, коли потрібні мінімалістичні текстові елементи навігації. Для основних дій, форм та інших інтерактивних елементів, яким потрібна більша візуальна вага, використовуйте стандартний компонент Button.
