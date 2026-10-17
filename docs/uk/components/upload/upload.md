# Upload

Безголовий (headless) компонент завантаження файлів із підтримкою drag-and-drop і перевіркою типу файлів. Використовує патерн слотів, щоб дати вам повний контроль над інтерфейсом.

## Живе демо

<script setup>
import { ref } from "vue";

const uploadedFiles = ref([]);
const imageFiles = ref([]);
const cappedFiles = ref([]);
</script>

<div class="demo-container">
  <h3>Базове завантаження (будь-який тип файлів)</h3>
  <orio-upload v-model="uploadedFiles" v-slot="{ isOverDropZone, openDialog }">
    <orio-dashed-container
      :icon="isOverDropZone ? 'download' : 'upload'"
      :text="isOverDropZone ? 'Відпустіть файли тут' : 'Перетягніть або клікніть, щоб обрати'"
      @click="openDialog"
    />
  </orio-upload>
  <orio-view-text size="small">
    Вибрано файлів: {{ uploadedFiles.length }}
  </orio-view-text>

  <h3 style="margin-top: 2rem">Лише зображення</h3>
  <orio-upload
    v-model="imageFiles"
    :allowed-types="['image/*']"
    v-slot="{ isOverDropZone, openDialog }"
  >
    <orio-dashed-container
      :icon="isOverDropZone ? 'download' : 'image'"
      :text="isOverDropZone ? 'Відпустіть зображення тут' : 'Завантажте зображення (PNG, JPG, GIF)'"
      @click="openDialog"
    />
  </orio-upload>
  <orio-view-text size="small">
    Вибрано зображень: {{ imageFiles.length }}
  </orio-view-text>

  <h3 style="margin-top: 2rem">Не більше 2 файлів</h3>
  <orio-upload v-model="cappedFiles" :max-files="2" v-slot="{ isOverDropZone, openDialog }">
    <orio-dashed-container
      :icon="isOverDropZone ? 'download' : 'upload'"
      :text="isOverDropZone ? 'Відпустіть файли тут' : 'Оберіть до 2 файлів'"
      @click="openDialog"
    />
  </orio-upload>
  <orio-view-text size="small">
    Вибрано {{ cappedFiles.length }} з 2 файлів
  </orio-view-text>
</div>

## Пропси

| Проп           | Тип        | За замовчуванням | Опис                                                        |
| -------------- | ---------- | ----------- | ---------------------------------------------------------------- |
| `maxFiles`     | `number`   | `undefined` | Максимальна кількість файлів (`undefined` = без обмежень). Нові файли додаються в кінець, а після досягнення ліміту найстаріші витісняються, тож `1` працює як проста заміна |
| `allowedTypes` | `string[]` | `undefined` | Масив дозволених MIME-типів (наприклад, `['image/*']`)           |
| `disabled`     | `boolean`  | `false`     | Вимкнути завантаження файлів                                     |

## Модель

| Модель       | Тип                     | Опис                                                                               |
| ------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| `modelValue` | `File[]` (за замовчуванням `[]`) | Вибрані/перетягнуті файли (готово для v-model). Поточну кількість дає `files.length`. |

## Пропси слоту

| Проп             | Тип          | Опис                                                |
| ---------------- | ------------ | --------------------------------------------------- |
| `isOverDropZone` | `boolean`    | True, коли користувач перетягує файли над зоною     |
| `openDialog`     | `() => void` | Функція, що відкриває нативний діалог вибору файлів |

## Приклади використання

### Базове завантаження з v-model

```vue
<script setup>
import { ref } from "vue";

const files = ref([]);
</script>

<template>
  <orio-upload v-model="files" v-slot="{ isOverDropZone, openDialog }">
    <div @click="openDialog">
      <p v-if="isOverDropZone">Drop files here</p>
      <p v-else>Click or drag files here</p>
    </div>
  </orio-upload>

  <div v-if="files.length">
    <p>Selected {{ files.length }} file(s)</p>
  </div>
</template>
```

### Лише зображення

```vue
<script setup>
import { ref, watch } from "vue";

const imageFiles = ref([]);

watch(imageFiles, (files) => {
  if (files) {
    console.log("Images uploaded:", files);
  }
});
</script>

<template>
  <orio-upload
    v-model="imageFiles"
    :allowed-types="['image/png', 'image/jpeg', 'image/gif']"
    v-slot="{ openDialog }"
  >
    <orio-button @click="openDialog">Upload Images</orio-button>
  </orio-upload>
</template>
```

### Завантаження одного файлу

```vue
<script setup>
import { ref } from "vue";

const singleFile = ref([]);
</script>

<template>
  <orio-upload
    v-model="singleFile"
    :max-files="1"
    v-slot="{ isOverDropZone, openDialog }"
  >
    <div
      class="upload-zone"
      :class="{ 'is-over': isOverDropZone }"
      @click="openDialog"
    >
      {{ singleFile.length ? singleFile[0].name : "Upload a single file" }}
    </div>
  </orio-upload>
</template>
```

### Лише PDF-документи

```vue
<script setup>
import { ref } from "vue";

const pdfFiles = ref([]);
</script>

<template>
  <orio-upload
    v-model="pdfFiles"
    :allowed-types="['application/pdf']"
    v-slot="{ openDialog }"
  >
    <orio-button icon="pdf" @click="openDialog">
      Upload PDF ({{ pdfFiles?.length || 0 }} selected)
    </orio-button>
  </orio-upload>
</template>
```

### Стилізована зона зі станом

```vue
<script setup>
import { ref } from "vue";

const files = ref([]);
</script>

<template>
  <orio-upload v-model="files" v-slot="{ isOverDropZone, openDialog }">
    <orio-dashed-container
      :icon="isOverDropZone ? 'download' : 'upload'"
      :text="isOverDropZone ? 'Drop here!' : 'Drag & drop or click'"
      @click="openDialog"
    />
  </orio-upload>

  <!-- Display selected files -->
  <div v-if="files.length" class="file-list">
    <p v-for="file in files" :key="file.name">
      {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
    </p>
  </div>
</template>

<style scoped>
.file-list {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}
</style>
```

## Обробка завантажених файлів

Компонент Upload використовує **v-model**, щоб дати зручний доступ до вибраних файлів:

### Через v-model

```vue
<script setup>
import { ref, watch } from "vue";

const files = ref([]);

// React to file changes
watch(files, (newFiles) => {
  if (newFiles) {
    console.log("Files selected:", newFiles);

    // Process each file
    newFiles.forEach((file) => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    });
  }
});
</script>

<template>
  <orio-upload v-model="files" v-slot="{ openDialog }">
    <orio-button @click="openDialog">Upload Files</orio-button>
  </orio-upload>

  <!-- Display selected files -->
  <ul v-if="files.length">
    <li v-for="file in files" :key="file.name">
      {{ file.name }}
    </li>
  </ul>
</template>
```

### Читання вмісту файлів

```vue
<script setup>
import { ref, watch } from "vue";

const files = ref([]);
const fileContents = ref([]);

watch(files, async (newFiles) => {
  if (!newFiles) {
    fileContents.value = [];
    return;
  }

  // Read file contents
  const contents = await Promise.all(
    newFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({
            name: file.name,
            content: e.target?.result,
          });
        reader.readAsText(file);
      });
    }),
  );

  fileContents.value = contents;
});
</script>

<template>
  <orio-upload v-model="files" v-slot="{ openDialog }">
    <orio-button @click="openDialog">Upload Text Files</orio-button>
  </orio-upload>

  <div v-for="item in fileContents" :key="item.name">
    <h3>{{ item.name }}</h3>
    <pre>{{ item.content }}</pre>
  </div>
</template>
```

### Завантаження на сервер

```vue
<script setup>
import { ref, watch } from "vue";

const files = ref([]);
const uploading = ref(false);

async function uploadFiles() {
  if (!files.value.length) return;

  uploading.value = true;

  const formData = new FormData();
  files.value.forEach((file, index) => {
    formData.append(`file_${index}`, file);
  });

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("Upload successful!");
      files.value = []; // Clear files
    }
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    uploading.value = false;
  }
}

// Auto-upload when files are selected
watch(files, (newFiles) => {
  // Clearing the array below re-triggers this watcher — bail on empty.
  if (newFiles.length) {
    uploadFiles();
  }
});
</script>

<template>
  <orio-upload v-model="files" v-slot="{ openDialog }">
    <orio-button @click="openDialog" :disabled="uploading" :loading="uploading">
      {{ uploading ? "Uploading..." : "Select Files" }}
    </orio-button>
  </orio-upload>
</template>
```

## Приклади типів файлів

### Поширені MIME-типи

```vue
<!-- Images -->
<orio-upload :allowed-types="['image/*']" />
<orio-upload :allowed-types="['image/png', 'image/jpeg']" />

<!-- Documents -->
<orio-upload :allowed-types="['application/pdf']" />
<orio-upload :allowed-types="['application/pdf', 'application/msword']" />

<!-- Videos -->
<orio-upload :allowed-types="['video/*']" />
<orio-upload :allowed-types="['video/mp4', 'video/quicktime']" />

<!-- Audio -->
<orio-upload :allowed-types="['audio/*']" />

<!-- Text files -->
<orio-upload :allowed-types="['text/plain', 'text/csv']" />

<!-- Archives -->
<orio-upload :allowed-types="['application/zip', 'application/x-rar']" />
```

## Можливості

- **Drag & Drop** — нативна підтримка перетягування файлів
- **Клік для вибору** — відкриває нативний діалог вибору файлів
- **Перевірка типу файлів** — обмеження завантажень за MIME-типом
- **Кілька файлів** — вибір одного чи кількох файлів
- **Headless-дизайн** — повний контроль над інтерфейсом і стилями
- **Візуальний відгук** — проп `isOverDropZone` для стану наведення
- **Гнучкість** — працює з будь-яким дизайном чи бібліотекою компонентів

## Підтримка браузерів

Компонент використовує композабли VueUse `useDropZone` і `useFileDialog`, які спираються на:

- File API (усі сучасні браузери)
- Drag and Drop API (усі сучасні браузери)
- У браузерах без drag-and-drop компонент коректно переходить на завантаження кліком

## Примітки

- Компонент не завантажує файли автоматично — логіку завантаження треба реалізувати самостійно
- Перевірка файлів виконується на рівні браузера за MIME-типами
- Варто додати додаткові перевірки (розмір файлу, розміри зображення) у ваш обробник
- З міркувань безпеки завжди перевіряйте типи файлів і на сервері
