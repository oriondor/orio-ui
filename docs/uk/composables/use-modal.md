# useModal

Композабл для керування станом модального вікна з відстеженням точки початку анімації.

## Живе демо

<script setup>
import { useModal } from '../../../src/runtime/composables/useModal'

const { modalProps, openModal } = useModal()
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="openModal()">
      Відкрити (без анімації)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Вміст вікна</h2>
    <p>Зверніть увагу, як по-різному з'являється вікно!</p>
    <orio-button @click="modalProps.show = false">Закрити</orio-button>
  </orio-modal>
</div>

<div class="demo-container">
  <div class="demo-row">
    <orio-button variant="secondary" @click="openModal">
      Відкрити (з анімацією)
    </orio-button>
  </div>
</div>

## Базове використання

```vue
<template>
  <div>
    <orio-button @click="openModal">Open Modal</orio-button>

    <orio-modal v-bind="modalProps">
      <h2>Modal Content</h2>
      <p>This is a modal dialog.</p>
      <orio-button @click="modalProps.show = false"> Close </orio-button>
    </orio-modal>
  </div>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

## Керування анімацією

Функція `openModal` приймає необов'язковий параметр події. Від способу виклику залежить поведінка анімації:

### З анімацією (рекомендовано)

Передайте подію, щоб отримати анімацію перетворення з натиснутого елемента:

```vue
<template>
  <!-- Vue automatically passes the event -->
  <orio-button @click="openModal"> Open Modal (Animated) </orio-button>

  <!-- Or explicitly pass $event -->
  <orio-button @click="openModal($event)"> Open Modal (Animated) </orio-button>

  <orio-modal v-bind="modalProps">
    <p>Modal morphs from the button you clicked!</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Без анімації

Викличте функцію з порожніми дужками, щоб пропустити анімацію:

```vue
<template>
  <orio-button @click="openModal()"> Open Modal (Simple Fade) </orio-button>

  <orio-modal v-bind="modalProps">
    <p>Modal fades in at center</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Порівняння

```vue
<template>
  <div class="demo-row">
    <!-- No animation - () calls function without event -->
    <orio-button @click="openModal()"> Simple Fade-In </orio-button>

    <!-- With animation - Vue passes event automatically -->
    <orio-button @click="openModal"> Morphing Animation </orio-button>

    <!-- With animation - Explicit event passing -->
    <orio-button @click="openModal($event)">
      Morphing Animation (Explicit)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Modal Content</h2>
  </orio-modal>
</template>
```

**Як це працює:**

- `@click="openModal()"` → виклик без події → вікно плавно з'являється по центру
- `@click="openModal"` → Vue передає подію → вікно виростає з позиції кнопки
- `@click="openModal($event)"` → явна подія → вікно виростає з позиції кнопки

## Значення, що повертаються

| Властивість  | Тип                            | Опис                                       |
| ------------ | ------------------------------ | ------------------------------------------ |
| `modalProps` | `Ref<ModalProps>`              | Об'єкт пропсів для розгортання на `<orio-modal>` |
| `openModal`  | `(event?: MouseEvent) => void` | Функція, що відкриває вікно                |

## Тип ModalProps

```typescript
interface ModalProps {
  show: Boolean;
  origin: OriginRect | null;
  "onUpdate:show": (state: boolean) => void;
}

interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Приклади

### Діалог підтвердження

```vue
<template>
  <orio-button variant="primary" @click="confirmDelete($event)">
    Delete Item
  </orio-button>

  <orio-modal v-bind="deleteModal">
    <h3>Confirm Delete</h3>
    <p>Are you sure you want to delete this item?</p>

    <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
      <orio-button variant="secondary" @click="deleteModal.show = false">
        Cancel
      </orio-button>
      <orio-button variant="primary" @click="handleDelete"> Delete </orio-button>
    </div>
  </orio-modal>
</template>

<script setup>
const { modalProps: deleteModal, openModal } = useModal();

function confirmDelete(event) {
  openModal(event);
}

function handleDelete() {
  // Perform delete
  deleteModal.value.show = false;
}
</script>
```

### Кілька модальних вікон

```vue
<template>
  <div>
    <orio-button @click="openEditModal($event)">Edit</orio-button>
    <orio-button @click="openDeleteModal($event)">Delete</orio-button>

    <orio-modal v-bind="editModal">
      <h3>Edit Form</h3>
      <!-- Edit form -->
    </orio-modal>

    <orio-modal v-bind="deleteModal">
      <h3>Confirm Delete</h3>
      <!-- Confirmation -->
    </orio-modal>
  </div>
</template>

<script setup>
const { modalProps: editModal, openModal: openEditModal } = useModal();
const { modalProps: deleteModal, openModal: openDeleteModal } = useModal();
</script>
```

### Форма в модальному вікні

```vue
<template>
  <orio-button @click="openFormModal($event)"> Add User </orio-button>

  <orio-modal v-bind="formModal">
    <h2>New User</h2>

    <form @submit.prevent="handleSubmit">
      <orio-input v-model="form.name" label="Name" required />
      <orio-input v-model="form.email" type="email" label="Email" required />

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
        <orio-button variant="secondary" @click="formModal.show = false">
          Cancel
        </orio-button>
        <orio-button variant="primary" :loading="submitting"> Save </orio-button>
      </div>
    </form>
  </orio-modal>
</template>

<script setup>
const { modalProps: formModal, openModal: openFormModal } = useModal();

const form = reactive({
  name: "",
  email: "",
});

const submitting = ref(false);

async function handleSubmit() {
  submitting.value = true;
  await api.createUser(form);
  submitting.value = false;
  formModal.value.show = false;

  // Reset form
  form.name = "";
  form.email = "";
}
</script>
```

## Подробиці анімації

### Як працює анімація

Коли `openModal(event)` викликається з MouseEvent:

1. **Фіксація точки появи** — зчитується прямокутник натиснутого елемента (`getBoundingClientRect()`)
2. **Старт з малого** — вікно починає з позиції й розміру кнопки з низькою непрозорістю
3. **Перетворення до центру** — вікно анімовано переходить у центр екрана на повний розмір і непрозорість
4. **Результат** — плавний ефект «розгортання з точки», що відчувається чуйним і пов'язаним

Без події (`openModal()`):

- Вікно просто плавно з'являється по центру
- Без анімації перетворення
- Простіше й швидше для програмного відкриття

### Коли що використовувати

**З анімацією (передавайте подію):**

- Дії, ініційовані користувачем (кліки, дотики)
- Створення візуального зв'язку між тригером і вікном
- Покращення досвіду завдяки плавним переходам

**Без анімації (без події):**

- Програмне відкриття (таймери, відповіді API)
- Вікна, відкриті не візуальними тригерами
- Сценарії, критичні до швидкодії
- Коли позиція елемента-тригера не має сенсу як точка появи

## Використання з компонентом Modal

Цей композабл призначений для роботи з `<orio-modal>`:

```vue
<orio-modal v-bind="modalProps">
  <!-- Content -->
</orio-modal>
```

`v-bind="modalProps"` розгортає всі потрібні пропси:

- `show` — керує видимістю
- `origin` — прямокутник точки початку анімації
- `onUpdate:show` — оновлює стан show, коли вікно закривається

## Швидкий довідник

```vue
<script setup>
const { modalProps, openModal } = useModal();
</script>

<template>
  <!-- Simple fade-in (no animation) -->
  <orio-button @click="openModal()">Open</orio-button>

  <!-- Morphing animation from button -->
  <orio-button @click="openModal">Open with Animation</orio-button>

  <!-- Programmatic open after some action -->
  <orio-button
    @click="
      async () => {
        await saveData();
        openModal(); // No animation for programmatic opens
      }
    "
  >
    Save & Open
  </orio-button>

  <!-- The modal itself -->
  <orio-modal v-bind="modalProps">
    <h2>Title</h2>
    <p>Content</p>
    <orio-button variant="secondary" @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>
```

## Поширені патерни

### Підтвердження перед дією

```vue
<script setup>
const { modalProps: confirmModal, openModal: openConfirm } = useModal();

async function handleDangerousAction(event) {
  openModal(event);
}

async function proceedWithAction() {
  await performAction();
  confirmModal.value.show = false;
}
</script>

<template>
  <orio-button variant="primary" @click="handleDangerousAction">
    Delete
  </orio-button>

  <orio-modal v-bind="confirmModal">
    <h3>Are you sure?</h3>
    <p>This action cannot be undone.</p>
    <div class="demo-row">
      <orio-button variant="secondary" @click="confirmModal.show = false">
        Cancel
      </orio-button>
      <orio-button variant="primary" @click="proceedWithAction">
        Confirm
      </orio-button>
    </div>
  </orio-modal>
</template>
```

### Програмне відкриття (без анімації)

```vue
<script setup>
const { modalProps, openModal } = useModal();

async function loadAndShowDetails(id) {
  const data = await api.fetch(id);
  // No animation - triggered by data fetch, not user click
  openModal();
}
</script>
```

## Див. також

- [Компонент Modal](/uk/components/modal)
