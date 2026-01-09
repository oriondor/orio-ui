# NavButton

Minimal navigation button with transparent background and text-only hover effects, perfect for navigation menus and sidebars.

## Live Demo

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
      Home
    </orio-nav-button>
    <orio-nav-button
      :active="currentPage === 'about'"
      @click="navigate('about')"
    >
      About
    </orio-nav-button>
    <orio-nav-button
      :active="currentPage === 'contact'"
      @click="navigate('contact')"
    >
      Contact
    </orio-nav-button>
  </div>
</div>

## With Icons

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button icon="home" @click="navigate('home')">Home</orio-nav-button>
    <orio-nav-button icon="settings" @click="navigate('settings')">Settings</orio-nav-button>
    <orio-nav-button icon="user" @click="navigate('profile')">Profile</orio-nav-button>
  </div>
</div>

## Icon Only

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button icon="home" @click="navigate('home')" />
    <orio-nav-button icon="settings" @click="navigate('settings')" />
    <orio-nav-button icon="user" @click="navigate('profile')" />
    <orio-nav-button icon="bell" />
  </div>
</div>

## States

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button>Default</orio-nav-button>
    <orio-nav-button :active="true">Active</orio-nav-button>
    <orio-nav-button :disabled="true">Disabled</orio-nav-button>
  </div>
</div>

## Usage

### Basic Navigation

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

### With Active State

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

### With Icons

```vue
<!-- Icon before text -->
<orio-nav-button icon="home" @click="goHome">Home</orio-nav-button>

<!-- Icon only (automatically rounds to circle) -->
<orio-nav-button icon="settings" @click="goSettings" />
```

### Sidebar Menu Example

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `undefined` | Icon name from icon registry |
| `disabled` | `boolean` | `false` | Disables button interaction |
| `active` | `boolean` | `false` | Indicates current/active page or section |

**Note:** The native HTML `type` attribute (e.g., `type="button"`) can be used normally via `v-bind` and will be passed through to the underlying `<button>` element.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `PointerEvent` | Emitted on button click (when not disabled) |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | - | Button text content |
| `icon` | - | Custom icon content |

## Styling

The NavButton uses these CSS variables:

```css
--color-text          /* Default text color */
--color-accent        /* Hover and active state color */
--border-radius-md    /* Border radius */
```

## Accessibility

- **Keyboard Support**: Full support for Space and Enter keys
- **Focus Visible**: 2px outline appears on keyboard focus
- **ARIA**: Automatically sets `aria-current="page"` when `active` prop is true
- **Semantic HTML**: Uses proper `<button>` element

## Use Cases

### Navigation Menus
Perfect for main navigation bars where you need subtle, minimal buttons that don't compete with content.

### Sidebar Navigation
Ideal for sidebar menus in dashboards and admin panels where you want to indicate the current section.

### Tab-like Navigation
Works well as an alternative to traditional tabs when you want a more understated look.

### Secondary Actions
Use for less prominent actions in toolbars or headers where primary buttons would be too heavy.

## Design Notes

NavButton differs from the standard Button component:
- **No background**: Always transparent, never filled
- **No border**: Clean, minimal appearance
- **Text-only hover**: Only the text color changes on hover, not the background
- **Active state**: Built-in support for indicating the current page or section
- **Single style**: No variants - one focused design for navigation use cases

Use NavButton when you want minimal, text-focused navigation elements. Use the standard Button component for primary actions, forms, and other interactive elements that need more visual weight.
