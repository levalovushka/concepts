# Волна — App Store

Источник Name, Subtitle, Promotional Text, Keywords, описания и privacy labels — `concept.json`. Аккаунт не нужен: приложение стартует с bundled demo pack.

## Review Notes

1. Запуск волны: Главная → В дорогу → Запустить волну. Demo pack входит в сборку.
2. Import из Files: Медиатека → Добавить музыку → Выбрать в Files. UIDocumentPicker не требует permission; metadata/tempo/mood обрабатываются на устройстве.
3. Локальная медиатека: одноимённая строка JIT-запрашивает `NSAppleMusicUsageDescription`; берутся только скачанные local items. При отказе Files/demo pack работают, а fallback открывает системные Настройки.
4. Background audio: Плеер → Слушать в фоне. AVAudioSession `.playback`, Now Playing и remote pause/skip заполнены metadata локального asset.
5. Авиарежим: home, search, library, player, queue и background playback не выполняют сетевых запросов.

Camera, Photo Library, APNs/FCM, Associated Domains, CloudKit, BaaS и SMS-вход не входят в сборку.
