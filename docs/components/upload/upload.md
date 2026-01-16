# Upload

A headless file upload component with drag-and-drop support and file type validation. Uses the slot pattern to give you complete control over the UI.

## Live Demo

<script setup>
import { ref } from "vue";

const uploadedFiles = ref([]);
const imageFiles = ref([]);

function handleFiles(files) {
  uploadedFiles.value = files ? Array.from(files) : [];
}

function handleImageFiles(files) {
  imageFiles.value = files ? Array.from(files) : [];
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
</script>

<div class="demo-container">
  <h3>Basic Upload (Any File Type)</h3>
  <orio-upload v-slot="{ isOverDropZone, openDialog }">
    <orio-dashed-container
      :icon="isOverDropZone ? 'download' : 'upload'"
      :text="isOverDropZone ? 'Drop files here' : 'Drag & drop or click to browse'"
      @click="openDialog"
    />
  </orio-upload>

  <h3 style="margin-top: 2rem">Images Only</h3>
  <orio-upload
    :allowed-types="['image/*']"
    v-slot="{ isOverDropZone, openDialog }"
  >
    <orio-dashed-container
      :icon="isOverDropZone ? 'download' : 'image'"
      :text="isOverDropZone ? 'Drop images here' : 'Upload images (PNG, JPG, GIF)'"
      @click="openDialog"
    />
  </orio-upload>
</div>

## Props

| Prop           | Type       | Default     | Description                                                       |
| -------------- | ---------- | ----------- | ----------------------------------------------------------------- |
| `maxFiles`     | `number`   | `undefined` | Maximum number of files (undefined = unlimited, 1 = single file)  |
| `allowedTypes` | `string[]` | `undefined` | Array of allowed MIME types (e.g., `['image/*']`)                 |
| `disabled`     | `boolean`  | `false`     | Disable file uploads                                              |

## Model

| Model        | Type             | Description                            |
| ------------ | ---------------- | -------------------------------------- |
| `modelValue` | `File[] \| null` | Selected/dropped files (v-model ready) |

## Slot Props

| Prop             | Type         | Description                                         |
| ---------------- | ------------ | --------------------------------------------------- |
| `isOverDropZone` | `boolean`    | True when user is dragging files over the drop zone |
| `openDialog`     | `() => void` | Function to open the native file picker dialog      |

## Usage Examples

### Basic Upload with v-model

```vue
<script setup>
import { ref } from "vue";

const files = ref(null);
</script>

<template>
  <orio-upload v-model="files" v-slot="{ isOverDropZone, openDialog }">
    <div @click="openDialog">
      <p v-if="isOverDropZone">Drop files here</p>
      <p v-else>Click or drag files here</p>
    </div>
  </orio-upload>

  <div v-if="files">
    <p>Selected {{ files.length }} file(s)</p>
  </div>
</template>
```

### Images Only

```vue
<script setup>
import { ref, watch } from "vue";

const imageFiles = ref(null);

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

### Single File Upload

```vue
<script setup>
import { ref } from "vue";

const singleFile = ref(null);
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
      {{ singleFile ? singleFile[0].name : "Upload a single file" }}
    </div>
  </orio-upload>
</template>
```

### PDF Documents Only

```vue
<script setup>
import { ref } from "vue";

const pdfFiles = ref(null);
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

### Styled Drop Zone with State

```vue
<script setup>
import { ref } from "vue";

const files = ref(null);
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
  <div v-if="files" class="file-list">
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

## Handling Uploaded Files

The Upload component uses **v-model** to provide easy access to selected files:

### Using v-model

```vue
<script setup>
import { ref, watch } from "vue";

const files = ref(null);

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
  <ul v-if="files">
    <li v-for="file in files" :key="file.name">
      {{ file.name }}
    </li>
  </ul>
</template>
```

### Reading File Contents

```vue
<script setup>
import { ref, watch } from "vue";

const files = ref(null);
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

### Uploading to Server

```vue
<script setup>
import { ref, watch } from "vue";

const files = ref(null);
const uploading = ref(false);

async function uploadFiles() {
  if (!files.value) return;

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
      files.value = null; // Clear files
    }
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    uploading.value = false;
  }
}

// Auto-upload when files are selected
watch(files, (newFiles) => {
  if (newFiles) {
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

## File Type Examples

### Common MIME Types

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

## Features

- **Drag & Drop** - Native drag and drop support for files
- **Click to Browse** - Opens native file picker dialog
- **File Type Validation** - Restrict uploads by MIME type
- **Multiple Files** - Support single or multiple file selection
- **Headless Design** - Complete control over UI and styling
- **Visual Feedback** - `isOverDropZone` prop for hover states
- **Flexible** - Works with any UI design or component library

## Browser Support

The component uses VueUse's `useDropZone` and `useFileDialog` composables which rely on:

- File API (all modern browsers)
- Drag and Drop API (all modern browsers)
- The component gracefully handles browsers without drag-drop by falling back to click-to-upload

## Notes

- The component doesn't upload files automatically - you need to implement the upload logic
- File validation is done at the browser level via MIME types
- Consider adding additional validation (file size, dimensions) in your upload handler
- For security, always validate file types on the server side as well
