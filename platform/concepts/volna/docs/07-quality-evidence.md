# Такт — quality evidence

## Первичные наблюдения

- `vk-music.json`: два действия до playback, разные роли root-экранов, непрерывный player.
- «Сет»: смена масштаба медиа и отдельный playback-слой.
- «Шеллак»: смешанные состояния соседних строк библиотеки.
- «Радиус»: достижимая цепочка от UI-триггера системной возможности до success/degraded состояния.
- Apple Music / Spotify: personalized hero, recently played, album rails, mood browse и library filters создают узнаваемую service-композицию.

## Product critique

Закрыты четыре риска: пустой first run без каталога, плейлист под другим именем, декоративные search/artist без сервера и слабо доказанный background mode. Решения и evidence screens зафиксированы в `readiness.productCritique`.

## Visual passes

Pass 1: 10 экранов, 6 найдено / 6 исправлено. Pass 2: 10 экранов, 4 найдено / 4 исправлено. Pass 3: 10 экранов, 3 найдено / 3 исправлено с отдельным polish fullscreen player. Blocker/major: 0. Проверка включает типичные, длинные, пустые, loading, error, offline, denied-media и degraded-background случаи.

## Interaction pass

Пройдены root tabs, push/back, fullscreen player, modal queue, Files/import actions, JIT grant/deny локальной медиатеки, save track/station, локальный search, transport controls и entitlement-активация background audio. При отказе от медиатеки видны Files/demo и переход в Настройки. Background audio не показывает фиктивный permission alert: это JIT-активация `AVAudioSession .playback`; при недоступности UI оставляет foreground playback и сохраняет очередь. Camera/photo/push действий в сборке нет.
