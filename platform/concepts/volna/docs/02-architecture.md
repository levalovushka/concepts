# Волна — карта экранов и архитектура

Корневые роли `home`, `search`, `library` остаются стабильными. Station/artist/import — push, player — fullscreen, queue — modal, Now Playing — system.

## Информационная архитектура

Дерево выведено из разметки экранов и `concept.json`: вложенность — по `parent`, подпись «открывается» — реальный элемент прототипа. Стартовый узел — `home`; входа по номеру и серверного аккаунта нет.

<!-- @generated:ia-tree -->
```
Главное (home) — tab root · открывается: старт
    └─ В дорогу (station) — push detail · открывается: «В дорогу», «Фокус» …
        └─ Плеер (player) — fullscreen · открывается: «Soft Current», «Current Affairs» … · audio
            ├─ Очередь (queue) — modal · открывается: «Очередь», «Очередь · 4 ближайших»
            └─ Экран погас (background) — system · открывается: «Слушать в фоне» (audio)

Поиск (search) — tab root · открывается: вкладка таб-бара
    └─ Лина Моро (artist) — push detail · открывается: «Лина Моро»

Моя музыка (library) — tab root · открывается: «Все»
    ├─ Still / Moving (album) — push detail · открывается: «Still / Moving», «Red Hours» …
    └─ Добавить музыку (import) — push task · открывается: «Добавить музыку», «Добавить» … · music
```
<!-- @end -->

## Карта экранов

<!-- @generated:screen-map -->
| ID | Название | Тип | Доступы |
|---|---|---|---|
| `home` | Главное | tab root | — |
| `search` | Поиск | tab root | — |
| `library` | Моя музыка | tab root | — |
| `station` | В дорогу | push detail | — |
| `artist` | Лина Моро | push detail | — |
| `album` | Still / Moving | push detail | — |
| `player` | Плеер | fullscreen | audio (activate) |
| `queue` | Очередь | modal | — |
| `background` | Экран погас | system | — |
| `import` | Добавить музыку | push task | music |
<!-- @end -->

## Переходы: откуда куда и чем

Каждая строка — элемент, который есть в прототипе. Вкладки таб-бара опущены: они ведут в корни разделов и одинаковы на всех экранах.

<!-- @generated:transitions -->
| Экран | Что можно сделать | Ведёт на | Доступ | Тип перехода |
|---|---|---|---|---|
| `home` | «Добавить музыку» | `import` | — | переход |
| `home` | «В дорогу», «Фокус» … | `station` | — | переход |
| `home` | «Все» | `library` | — | переход |
| `home` | «Still / Moving», «Red Hours» | `album` | — | переход |
| `home` | «Soft Current» | `player` | — | переход |
| `search` | «Лина Моро» | `artist` | — | переход |
| `search` | «Red Hours» | `album` | — | переход |
| `search` | «Энергично», «Спокойно» … | `station` | — | переход |
| `search` | «Все» | `library` | — | переход |
| `search` | «Soft Current», «Current Affairs» | `player` | — | переход |
| `library` | «Добавить музыку», «Добавить» … | `import` | — | переход |
| `library` | «Still / Moving», «Red Hours» … | `album` | — | переход |
| `library` | «Дорога домой», «Глубокий фокус» … | `station` | — | переход |
| `library` | «Soft Current», «Afterimage» | `player` | — | переход |
| `station` | «Назад на главную» | `home` | — | возврат по IA |
| `station` | «Запустить волну», «Soft Current» … | `player` | — | переход |
| `station` | «Очередь» | `queue` | — | переход |
| `artist` | «Назад к поиску» | `search` | — | возврат по IA |
| `artist` | «Слушать артиста», «1» … | `player` | — | переход |
| `artist` | «В дорогу», «После полуночи» | `station` | — | переход |
| `album` | «Назад в медиатеку» | `library` | — | возврат по IA |
| `album` | «Лина Моро» | `artist` | — | переход |
| `album` | «Слушать», «1» … | `player` | — | переход |
| `player` | «Свернуть плеер» | `station` | — | возврат по IA |
| `player` | «Лина Моро» | `artist` | — | переход |
| `player` | «Очередь · 4 ближайших» | `queue` | — | переход |
| `player` | «Слушать в фоне» | `background` | `UIBackgroundModes: audio` | entitlement, без alert |
| `queue` | «1», «2» … | `player` | — | переход |
| `background` | «Вернуться в плеер» | `player` | — | возврат по IA |
| `import` | «Наза в медиатеку» | `library` | — | возврат по IA |
| `import` | «Локальная медиатека» | `import` | `NSAppleMusicUsageDescription` | доступ разрешён |
<!-- @end -->

## Матрица доступов

<!-- @generated:perm-matrix -->
| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |
|---|---|---|---|---|
| `NSAppleMusicUsageDescription` | «Локальная медиатека» на экране импорта | Добавить музыку | Files и bundled demo pack продолжают работать; доступ можно включить в системных Настройках | **Условный** — MPMediaLibraryAuthorization запрашивается только после явного выбора локальной медиатеки; сетевой Apple Music catalog не используется |
| `UIBackgroundModes: audio` | «Слушать в фоне» в плеере | Плеер | Без capability локальный трек играет, пока «Волна» открыта; состояние очереди не теряется | **Условный** — AVAudioSession .playback активен только во время playback; MPNowPlayingInfoCenter и MPRemoteCommandCenter заполнены metadata локального asset |
<!-- @end -->

## Почему здесь нет бэкенда

<!-- @generated:backendless -->
| Требовало бы сервера | Решение без сервера |
|---|---|
| Музыкальный каталог | UIDocumentPicker security-scoped bookmarks, системная локальная медиатека и bundled demo pack; ни одного network request. |
| Поиск и группировка | Core Data FTS по ID3/MP4 metadata; artist/album/genre/title извлекаются на устройстве. |
| Волны и очередь | AVAudioEngine/Accelerate оценивают tempo/energy; mood tags, skip/save history и ranking хранятся в Core Data. |
| Перенос и аккаунт | Не реализуются: нет SMS, BaaS, CloudKit, iCloud sync и скрытого сервера. Все данные принадлежат этому устройству. |
<!-- @end -->

## Правила IA

Единственная capability — background audio; это entitlement без системного alert. Потеря Files bookmark — не permission denial: плеер сохраняет очередь и предлагает перевыбрать файл.
