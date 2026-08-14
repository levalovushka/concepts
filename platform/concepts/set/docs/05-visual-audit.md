# Визуальный аудит

## До переработки

- Primary CTA на `studio`, `result` и `deeplink` визуально исчезали на фоне.
- «Добавить сет» был заявлен корневой вкладкой, хотя tab bar его не содержал.
- Главная начиналась с крупной hero-карточки и показывала мало контекста до сгиба.
- Библиотека повторяла одни и те же карточки в сетке; длинные подписи терялись.
- Плеер имитировал waveform декоративными столбиками вместо ясного прогресса.
- Документация не фиксировала маршруты, системные fallback и источники решений.
- Автоматический аудит находил 20 подписей tab bar мельче допустимого порога; lint находил битую ссылку и неиспользуемый atlas.

## После переработки

Все 16 экранов пересняты под viewport 376×812 и просмотрены по одному в полном размере. Проверены сетка, safe area, заголовки, CTA, tab bar, прокрутка, hit targets, системный picker, fullscreen camera/player, lock screen и необязательный вход по номеру.

Ручной pointer-проход в Chromium дополнительно нашёл дефект, которого не было видно на PNG и не поймал штатный flow test: слой camera preview перехватывал shutter, а общий pressed-transform сдвигал абсолютно центрированную кнопку между `pointerdown` и `pointerup`. Декоративные слои исключены из hit-testing, а shutter получил собственный pressed-state. После исправления обычный клик переводит `capture → result`.

Проверенные маршруты:

- `home → detail → player → background`, entitlement без системного alert;
- `profile → phone → code → profile`, вход не блокирует основной продукт;
- `home → library → studio → camera grant → capture → result → library`;
- `studio → photo grant → pick → result`;
- camera deny и photo deny возвращают на `studio` с видимым fallback;
- push deny возвращает на `profile` с видимым fallback;
- `profile → deeplink → detail`, entitlement без alert;
- back-переходы и все декларативные `data-go`/`data-back` проверены по IA.

Финальный приёмочный цикл:

```text
npm run proof -- set  → 1/1
npm run build -- set  → 16 экранов, 4 прототипа, 5 доступов
npm run shots -- set  → 16/16 PNG, 376×812
npm run test -- set   → 35/35
npm run lint -- set   → расхождений нет
npm run audit -- set  → чисто
```
