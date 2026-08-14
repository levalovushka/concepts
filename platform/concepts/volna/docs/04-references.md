# Волна — references

## vk-music profile

Приняты три обязательные root-роли, запуск контента за два действия, непрерывный mini-player, контекст станции, queue и background playback.

## Shellac / Set / Radius

- «Шеллак»: библиотека с разными состояниями соседних строк и отдельный fullscreen player.
- «Сет»: смена масштаба композиции и плотный музыкальный playback-слой.
- «Радиус»: явные триггеры системных возможностей, достижимые success/deny пути.
- Apple Music / Spotify: personalized pick, recently played, album rail, mood browse и library filters как композиционная грамматика музыкального сервиса.

Буквально не копируются ни бренд, ни цвет, ни конкретные карточки.

## Pattern → screen → observable behavior

- `audio-library` → `library`: Files, локальная медиатека и demo pack видны как три честных источника; анализ имеет ready/loading/error строки.
- `search-discovery` → `search`: запрос работает только по локальному FTS-индексу и ведёт в артиста/трек из metadata.
- `release-detail` → `album`: artwork, artist/year/format, ordered tracklist, play/shuffle и Files source образуют полноценный локальный релиз.
- `audio-player` → `player`: transport, save, queue и источник файла доступны из одного playback-контекста.
- `background-playback` → `background`: Now Playing получает metadata локального asset и показывает remote pause/skip.
