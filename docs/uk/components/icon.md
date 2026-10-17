# Icon

Компонент SVG-іконки з вбудованим набором іконок.

## Живе демо

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <h3>Покупки та кошик</h3>
  <div class="demo-row">
    <orio-tooltip text="shopping-cart">
      <orio-icon name="shopping-cart" />
    </orio-tooltip>
    <orio-tooltip text="shopping-bag">
      <orio-icon name="shopping-bag" />
    </orio-tooltip>
    <orio-tooltip text="cart-plus">
      <orio-icon name="cart-plus" />
    </orio-tooltip>
    <orio-tooltip text="cart-remove">
      <orio-icon name="cart-remove" />
    </orio-tooltip>
  </div>

  <h3>Товари та склад</h3>
  <div class="demo-row">
    <orio-tooltip text="tag">
      <orio-icon name="tag" />
    </orio-tooltip>
    <orio-tooltip text="barcode">
      <orio-icon name="barcode" />
    </orio-tooltip>
    <orio-tooltip text="package">
      <orio-icon name="package" />
    </orio-tooltip>
    <orio-tooltip text="gift">
      <orio-icon name="gift" />
    </orio-tooltip>
    <orio-tooltip text="box">
      <orio-icon name="box" />
    </orio-tooltip>
  </div>

  <h3>Користувач і обліковий запис</h3>
  <div class="demo-row">
    <orio-tooltip text="user">
      <orio-icon name="user" />
    </orio-tooltip>
    <orio-tooltip text="heart">
      <orio-icon name="heart" />
    </orio-tooltip>
    <orio-tooltip text="heart-outline">
      <orio-icon name="heart-outline" />
    </orio-tooltip>
    <orio-tooltip text="star">
      <orio-icon name="star" />
    </orio-tooltip>
    <orio-tooltip text="star-outline">
      <orio-icon name="star-outline" />
    </orio-tooltip>
  </div>

  <h3>Оплата</h3>
  <div class="demo-row">
    <orio-tooltip text="credit-card">
      <orio-icon name="credit-card" />
    </orio-tooltip>
    <orio-tooltip text="wallet">
      <orio-icon name="wallet" />
    </orio-tooltip>
    <orio-tooltip text="receipt">
      <orio-icon name="receipt" />
    </orio-tooltip>
  </div>

  <h3>Стрілки — шеврони</h3>
  <div class="demo-row">
    <orio-tooltip text="chevron-up">
      <orio-icon name="chevron-up" />
    </orio-tooltip>
    <orio-tooltip text="chevron-down">
      <orio-icon name="chevron-down" />
    </orio-tooltip>
    <orio-tooltip text="chevron-left">
      <orio-icon name="chevron-left" />
    </orio-tooltip>
    <orio-tooltip text="chevron-right">
      <orio-icon name="chevron-right" />
    </orio-tooltip>
  </div>

  <h3>Стрілки — прямі</h3>
  <div class="demo-row">
    <orio-tooltip text="arrow-up">
      <orio-icon name="arrow-up" />
    </orio-tooltip>
    <orio-tooltip text="arrow-down">
      <orio-icon name="arrow-down" />
    </orio-tooltip>
    <orio-tooltip text="arrow-left">
      <orio-icon name="arrow-left" />
    </orio-tooltip>
    <orio-tooltip text="arrow-right">
      <orio-icon name="arrow-right" />
    </orio-tooltip>
  </div>

  <h3>Стрілки — довгі (з хвостиками)</h3>
  <div class="demo-row">
    <orio-tooltip text="arrow-back">
      <orio-icon name="arrow-back" />
    </orio-tooltip>
    <orio-tooltip text="arrow-forward">
      <orio-icon name="arrow-forward" />
    </orio-tooltip>
    <orio-tooltip text="arrow-upward">
      <orio-icon name="arrow-upward" />
    </orio-tooltip>
    <orio-tooltip text="arrow-downward">
      <orio-icon name="arrow-downward" />
    </orio-tooltip>
  </div>

  <h3>Стрілки — подвійні та розгортання</h3>
  <div class="demo-row">
    <orio-tooltip text="double-arrow-left">
      <orio-icon name="double-arrow-left" />
    </orio-tooltip>
    <orio-tooltip text="double-arrow-right">
      <orio-icon name="double-arrow-right" />
    </orio-tooltip>
    <orio-tooltip text="expand-more">
      <orio-icon name="expand-more" />
    </orio-tooltip>
    <orio-tooltip text="expand-less">
      <orio-icon name="expand-less" />
    </orio-tooltip>
  </div>

  <h3>Навігація та посилання</h3>
  <div class="demo-row">
    <orio-tooltip text="home">
      <orio-icon name="home" />
    </orio-tooltip>
    <orio-tooltip text="menu">
      <orio-icon name="menu" />
    </orio-tooltip>
    <orio-tooltip text="filter">
      <orio-icon name="filter" />
    </orio-tooltip>
    <orio-tooltip text="grid-view">
      <orio-icon name="grid-view" />
    </orio-tooltip>
    <orio-tooltip text="list-view">
      <orio-icon name="list-view" />
    </orio-tooltip>
    <orio-tooltip text="link">
      <orio-icon name="link" />
    </orio-tooltip>
    <orio-tooltip text="external-link">
      <orio-icon name="external-link" />
    </orio-tooltip>
  </div>

  <h3>Зв'язок</h3>
  <div class="demo-row">
    <orio-tooltip text="mail">
      <orio-icon name="mail" />
    </orio-tooltip>
    <orio-tooltip text="message">
      <orio-icon name="message" />
    </orio-tooltip>
    <orio-tooltip text="chat">
      <orio-icon name="chat" />
    </orio-tooltip>
    <orio-tooltip text="phone">
      <orio-icon name="phone" />
    </orio-tooltip>
  </div>

  <h3>Медіа — відтворення</h3>
  <div class="demo-row">
    <orio-tooltip text="play">
      <orio-icon name="play" />
    </orio-tooltip>
    <orio-tooltip text="pause">
      <orio-icon name="pause" />
    </orio-tooltip>
    <orio-tooltip text="stop">
      <orio-icon name="stop" />
    </orio-tooltip>
    <orio-tooltip text="skip-next">
      <orio-icon name="skip-next" />
    </orio-tooltip>
    <orio-tooltip text="skip-previous">
      <orio-icon name="skip-previous" />
    </orio-tooltip>
  </div>

  <h3>Медіа — вміст</h3>
  <div class="demo-row">
    <orio-tooltip text="image">
      <orio-icon name="image" />
    </orio-tooltip>
    <orio-tooltip text="video">
      <orio-icon name="video" />
    </orio-tooltip>
    <orio-tooltip text="camera">
      <orio-icon name="camera" />
    </orio-tooltip>
    <orio-tooltip text="mic">
      <orio-icon name="mic" />
    </orio-tooltip>
    <orio-tooltip text="mic-off">
      <orio-icon name="mic-off" />
    </orio-tooltip>
    <orio-tooltip text="volume">
      <orio-icon name="volume" />
    </orio-tooltip>
    <orio-tooltip text="volume-off">
      <orio-icon name="volume-off" />
    </orio-tooltip>
  </div>

  <h3>Документи</h3>
  <div class="demo-row">
    <orio-tooltip text="file">
      <orio-icon name="file" />
    </orio-tooltip>
    <orio-tooltip text="folder">
      <orio-icon name="folder" />
    </orio-tooltip>
    <orio-tooltip text="folder-open">
      <orio-icon name="folder-open" />
    </orio-tooltip>
    <orio-tooltip text="document">
      <orio-icon name="document" />
    </orio-tooltip>
    <orio-tooltip text="pdf">
      <orio-icon name="pdf" />
    </orio-tooltip>
  </div>

  <h3>Елементи інтерфейсу</h3>
  <div class="demo-row">
    <orio-tooltip text="eye">
      <orio-icon name="eye" />
    </orio-tooltip>
    <orio-tooltip text="eye-off">
      <orio-icon name="eye-off" />
    </orio-tooltip>
    <orio-tooltip text="lock">
      <orio-icon name="lock" />
    </orio-tooltip>
    <orio-tooltip text="unlock">
      <orio-icon name="unlock" />
    </orio-tooltip>
    <orio-tooltip text="copy">
      <orio-icon name="copy" />
    </orio-tooltip>
  </div>

  <h3>Соцмережі</h3>
  <div class="demo-row">
    <orio-tooltip text="github">
      <orio-icon name="github" />
    </orio-tooltip>
    <orio-tooltip text="twitter">
      <orio-icon name="twitter" />
    </orio-tooltip>
    <orio-tooltip text="facebook">
      <orio-icon name="facebook" />
    </orio-tooltip>
    <orio-tooltip text="instagram">
      <orio-icon name="instagram" />
    </orio-tooltip>
    <orio-tooltip text="youtube">
      <orio-icon name="youtube" />
    </orio-tooltip>
    <orio-tooltip text="linkedin">
      <orio-icon name="linkedin" />
    </orio-tooltip>
  </div>

  <h3>Дії</h3>
  <div class="demo-row">
    <orio-tooltip text="edit">
      <orio-icon name="edit" />
    </orio-tooltip>
    <orio-tooltip text="check">
      <orio-icon name="check" />
    </orio-tooltip>
    <orio-tooltip text="plus">
      <orio-icon name="plus" />
    </orio-tooltip>
    <orio-tooltip text="minus">
      <orio-icon name="minus" />
    </orio-tooltip>
    <orio-tooltip text="close">
      <orio-icon name="close" />
    </orio-tooltip>
    <orio-tooltip text="search">
      <orio-icon name="search" />
    </orio-tooltip>
    <orio-tooltip text="upload">
      <orio-icon name="upload" />
    </orio-tooltip>
    <orio-tooltip text="download">
      <orio-icon name="download" />
    </orio-tooltip>
    <orio-tooltip text="delete">
      <orio-icon name="delete" />
    </orio-tooltip>
    <orio-tooltip text="share">
      <orio-icon name="share" />
    </orio-tooltip>
    <orio-tooltip text="refresh">
      <orio-icon name="refresh" />
    </orio-tooltip>
    <orio-tooltip text="settings">
      <orio-icon name="settings" />
    </orio-tooltip>
    <orio-tooltip text="bell">
      <orio-icon name="bell" />
    </orio-tooltip>
    <orio-tooltip text="compare">
      <orio-icon name="compare" />
    </orio-tooltip>
    <orio-tooltip text="discount">
      <orio-icon name="discount" />
    </orio-tooltip>
  </div>

  <h3>Стан та інформація</h3>
  <div class="demo-row">
    <orio-tooltip text="info">
      <orio-icon name="info" />
    </orio-tooltip>
    <orio-tooltip text="warning">
      <orio-icon name="warning" />
    </orio-tooltip>
    <orio-tooltip text="check-circle">
      <orio-icon name="check-circle" />
    </orio-tooltip>
    <orio-tooltip text="error-circle">
      <orio-icon name="error-circle" />
    </orio-tooltip>
    <orio-tooltip text="help">
      <orio-icon name="help" />
    </orio-tooltip>
    <orio-tooltip text="loading-loop">
      <orio-icon name="loading-loop" />
    </orio-tooltip>
  </div>

  <h3>Доставка</h3>
  <div class="demo-row">
    <orio-tooltip text="truck">
      <orio-icon name="truck" />
    </orio-tooltip>
    <orio-tooltip text="location">
      <orio-icon name="location" />
    </orio-tooltip>
    <orio-tooltip text="map-pin">
      <orio-icon name="map-pin" />
    </orio-tooltip>
  </div>

  <h3>Інше</h3>
  <div class="demo-row">
    <orio-tooltip text="calendar">
      <orio-icon name="calendar" />
    </orio-tooltip>
  </div>

  <h3>Власні розміри</h3>
  <div class="demo-row">
    <orio-icon name="shopping-cart" :size="16" />
    <orio-icon name="shopping-cart" :size="24" />
    <orio-icon name="shopping-cart" :size="32" />
    <orio-icon name="shopping-cart" :size="48" />
  </div>

  <h3>Власні кольори</h3>
  <div class="demo-row">
    <orio-icon name="check" color="green" />
    <orio-icon name="close" color="red" />
    <orio-icon name="heart" color="#ff69b4" />
  </div>
</div>

## Використання

```vue
<template>
  <orio-icon name="edit" />
  <orio-icon name="check" :size="32" color="green" />
</template>
```

## Доступні іконки

### Стрілки — шеврони (кутові стрілки)

- `chevron-up` - Шеврон угору
- `chevron-down` - Шеврон униз
- `chevron-left` - Шеврон ліворуч
- `chevron-right` - Шеврон праворуч

### Стрілки — прямі (прості трикутники)

- `arrow-up` - Проста стрілка вгору
- `arrow-down` - Проста стрілка вниз
- `arrow-left` - Проста стрілка ліворуч
- `arrow-right` - Проста стрілка праворуч

### Стрілки — довгі (з хвостиками)

- `arrow-back` - Стрілка навігації назад
- `arrow-forward` - Стрілка навігації вперед
- `arrow-upward` - Стрілка навігації вгору
- `arrow-downward` - Стрілка навігації вниз

### Стрілки — спеціальні

- `double-arrow-left` - Перемотування назад
- `double-arrow-right` - Перемотування вперед
- `expand-more` - Розгорнути/показати більше
- `expand-less` - Згорнути/показати менше

### Навігація та посилання

- `home` - Головна сторінка
- `menu` - Меню-«гамбургер»
- `filter` - Параметри фільтра
- `grid-view` - Подання сіткою
- `list-view` - Подання списком
- `link` - Посилання/ланцюжок
- `external-link` - Зовнішнє посилання/відкрити в новій вкладці

### Зв'язок

- `mail` - Email/конверт
- `message` - Повідомлення/SMS
- `chat` - Чат/розмова
- `phone` - Телефон/дзвінок

### Медіа — відтворення

- `play` - Відтворити
- `pause` - Пауза
- `stop` - Зупинити
- `skip-next` - До наступного
- `skip-previous` - До попереднього

### Медіа — вміст

- `image` - Зображення/фото
- `video` - Відео/камера
- `camera` - Камера/зробити фото
- `mic` - Мікрофон увімкнено
- `mic-off` - Мікрофон вимкнено
- `volume` - Гучність/звук увімкнено
- `volume-off` - Звук вимкнено

### Документи

- `file` - Звичайний файл
- `folder` - Закрита тека
- `folder-open` - Відкрита тека
- `document` - Текстовий документ
- `pdf` - PDF-документ

### Елементи інтерфейсу

- `eye` - Показати/видимий
- `eye-off` - Приховати/невидимий
- `lock` - Заблоковано/захищено
- `unlock` - Розблоковано/незахищено
- `copy` - Копіювати в буфер обміну

### Соцмережі

- `github` - GitHub
- `twitter` - Twitter/X
- `facebook` - Facebook
- `instagram` - Instagram
- `youtube` - YouTube
- `linkedin` - LinkedIn

### Покупки та кошик

- `shopping-cart` - Повний кошик з товарами
- `shopping-bag` - Сумка для покупок
- `cart-plus` - Додати в кошик
- `cart-remove` - Прибрати з кошика

### Товари та склад

- `tag` - Цінник
- `barcode` - Штрихкод товару
- `package` - Посилка/коробка для доставки
- `gift` - Подарунок
- `box` - Коробка для зберігання/складу

### Користувач і обліковий запис

- `user` - Профіль/обліковий запис
- `heart` - Обране/список бажань (заповнене)
- `heart-outline` - Обране/список бажань (контур)
- `star` - Зірка рейтингу (заповнена)
- `star-outline` - Зірка рейтингу (контур)

### Оплата

- `credit-card` - Оплата карткою
- `wallet` - Цифровий гаманець
- `receipt` - Чек/рахунок замовлення

### Дії

- `edit` - Редагувати/олівець
- `check` - Галочка
- `plus` - Плюс/додати
- `close` - Закрити/хрестик
- `search` - Пошук/лупа
- `upload` - Стрілка завантаження на сервер
- `download` - Стрілка завантаження
- `delete` - Видалити/кошик
- `share` - Поділитися товаром/посиланням
- `refresh` - Оновити/перезавантажити
- `settings` - Налаштування/параметри
- `bell` - Сповіщення
- `compare` - Порівняти товари
- `discount` - Знижки/розпродажі

### Стан та інформація

- `loading-loop` - Анімований індикатор завантаження
- `info` - Інформація
- `warning` - Попередження
- `check-circle` - Підтвердження успіху
- `error-circle` - Стан помилки
- `help` - Допомога/підтримка

### Доставка

- `truck` - Доставка
- `location` - Розташування магазину
- `map-pin` - Мітка на мапі

### Інше

- `calendar` - Календар

Докладніше про додавання власних іконок — у [Icon Registry](/uk/utils/icon-registry).

## Пропси

| Проп    | Тип                  | За замовчуванням | Опис                    |
| ------- | -------------------- | ---------------- | ----------------------- |
| `name`  | `IconName \| string` | -                | Назва іконки з реєстру  |
| `size`  | `string \| number`   | `'1em'`          | Розмір іконки (px або em) |
| `color` | `string`             | `'currentColor'` | Колір іконки (CSS-колір) |
