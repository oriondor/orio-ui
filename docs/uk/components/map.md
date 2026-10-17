# Map

Карта з перетягуванням і масштабуванням, що показує одну точку. Тайли беруться з
[OpenFreeMap](https://openfreemap.org) — безкоштовно, без API-ключа, без налаштувань.
Карта підлаштовується під світлий/темний режим і тонує воду та головні дороги
поточним акцентним кольором.

## Живе демо

<script setup>
import { ref } from 'vue'

const places = {
  kyiv: { latitude: 50.4501, longitude: 30.5234 },
  paris: { latitude: 48.8584, longitude: 2.2945 },
  tokyo: { latitude: 35.6586, longitude: 139.7454 },
}
const place = ref('kyiv')
</script>

<div class="demo-container">
  <orio-map :coordinates="places.kyiv" />
</div>

### Переміщення точки

<div class="demo-container">
  <div class="demo-row">
    <orio-button variant="secondary" @click="place = 'kyiv'">Київ</orio-button>
    <orio-button variant="secondary" @click="place = 'paris'">Париж</orio-button>
    <orio-button variant="secondary" @click="place = 'tokyo'">Токіо</orio-button>
  </div>
  <orio-map :coordinates="places[place]" :zoom="12" />
</div>

### Власна мітка

<div class="demo-container">
  <orio-map
    :coordinates="places.paris"
    marker-icon="star"
    marker-color="var(--color-danger)"
  />
</div>

<div class="demo-container">
  <orio-map :coordinates="places.tokyo">
    <template #marker>
      <orio-tag variant="accent" text="Токійська вежа" />
    </template>
  </orio-map>
</div>

## Використання

```vue
<script setup>
import { ref } from "vue";

const places = {
  kyiv: { latitude: 50.4501, longitude: 30.5234 },
  paris: { latitude: 48.8584, longitude: 2.2945 },
  tokyo: { latitude: 35.6586, longitude: 139.7454 },
};
const place = ref("kyiv");
</script>

<template>
  <orio-map :coordinates="places.kyiv" />

  <orio-button variant="secondary" @click="place = 'paris'">Paris</orio-button>
  <orio-map :coordinates="places[place]" :zoom="12" />

  <orio-map
    :coordinates="places.paris"
    marker-icon="star"
    marker-color="var(--color-danger)"
  />

  <orio-map :coordinates="places.tokyo">
    <template #marker>
      <orio-tag variant="accent" text="Tokyo Tower" />
    </template>
  </orio-map>
</template>
```

## Пропси

| Проп          | Тип              | За замовчуванням        | Опис                                                                                      |
| ------------- | ---------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `coordinates` | `MapCoordinates` | -                       | `{ latitude, longitude }` точки. Зміна переміщує мітку й плавно переводить туди карту     |
| `zoom`        | `number`         | `14`                    | Початковий рівень масштабу; далі масштабом керує користувач                               |
| `markerIcon`  | `string`         | `'map-pin'`             | Назва іконки для стандартної мітки                                                        |
| `markerColor` | `string`         | `'var(--color-accent)'` | Будь-який CSS-колір або токен для стандартної мітки                                       |
| `mapStyle`    | `string`         | авто                    | URL стилю MapLibre. Вимикає автоматичний світлий/темний стиль і акцентне тонування        |

## Слоти

| Слот     | Пропси            | Опис                           |
| -------- | ----------------- | ------------------------------ |
| `marker` | `{ coordinates }` | Замінює весь елемент мітки     |

## Розміри

Карта має ширину `100%` і висоту `20rem`. Перевизначте класом або
`style="height: 30rem"` на компоненті.

## Інші постачальники тайлів

`mapStyle` приймає будь-який URL стилю, сумісний з MapLibre, наприклад інші стилі
OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`, `bright`, `fiord`),
MapTiler, Stadia Maps або власний стиль.
