# Такт — App Store

Источник Name, Subtitle, Promotional Text, Keywords, описания и privacy labels — `concept.json`. Аккаунт не нужен: приложение стартует с bundled demo pack.

## Review Notes

1. Запуск волны: Главная → В дорогу → Запустить волну. Demo pack входит в сборку.
2. Import из Files: Медиатека → Добавить музыку → Выбрать в Files. UIDocumentPicker не требует permission; metadata/tempo/mood обрабатываются на устройстве.
3. Локальная медиатека: одноимённая строка JIT-запрашивает `NSAppleMusicUsageDescription`; берутся только скачанные local items. При отказе Files/demo pack работают, а fallback открывает системные Настройки.
4. Background audio: Плеер → Слушать в фоне. AVAudioSession `.playback`, Now Playing и remote pause/skip заполнены metadata локального asset.
5. Авиарежим: home, search, library, player, queue и background playback не выполняют сетевых запросов.

Camera, Photo Library, APNs/FCM, Associated Domains, CloudKit, BaaS и SMS-вход не входят в сборку.

## Метаданные

<!-- @generated:store-meta -->
| Поле | Значение | Знаков |
|---|---|---|
| App Name | Такт — музыка офлайн | 20 / 30 |
| Subtitle | Волны из ваших треков | 21 / 30 |
| Promotional Text | Добавьте музыку из Files, выберите дорогу, работу или тихий вечер — локальная волна запустится сразу. | 101 / 170 |
| Keywords | треки,плеер,станции,файлы,альбом,настроение,дорога,фокус,аудио | 62 / 100 |
| Primary Category | Music | — |
| Secondary Category | Lifestyle | — |
| Age Rating | 13+ | — |
| Price | Бесплатно, без встроенных покупок | — |
| Support URL | https://volna.local/support | — |
| Marketing URL | https://volna.local | — |
| Privacy Policy URL | https://volna.local/privacy | — |
| Encryption | ITSAppUsesNonExemptEncryption = NO — сетевых функций нет | — |
<!-- @end -->

## Privacy-лейблы

<!-- @generated:store-privacy -->
| Что собираем | Тип в App Privacy | Зачем | Связано с пользователем | Трекинг |
|---|---|---|---|---|
| Пользовательский контент | `User Content → Audio Data` | Выбранные аудиофайлы и metadata остаются на устройстве и никуда не передаются | Нет | Нет |
<!-- @end -->

## Заметки для ревью

<!-- @generated:store-review -->
| Ключ | Что написать ревьюеру |
|---|---|
| `NSCameraUsageDescription` | Распознавание текста идёт на устройстве через Vision. Снимок этикетки нигде не сохраняется — только текст, который сразу разбирается на поля metadata. |
<!-- @end -->
