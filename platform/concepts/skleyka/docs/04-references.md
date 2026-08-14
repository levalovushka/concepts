# Склейка — primary references

Проверено по первичным материалам, собранным в актуальных концептах Double, Scene и профиле vk-video 14 августа 2026 года.

- [Apple privacy](https://developer.apple.com/design/human-interface-guidelines/privacy): private data запрашивается после пользовательского намерения. Camera, Microphone, Photos, Location и Local Network имеют JIT-trigger и deny fallback.
- [Sharing and actions](https://developer.apple.com/design/human-interface-guidelines/sharing-and-actions): запрос материалов и отправка фильма используют системный Share Sheet без собственного графа получателей.
- [PhotoKit](https://developer.apple.com/documentation/photokit) и [document picker](https://developer.apple.com/documentation/uikit/view_controllers/providing_access_to_directories): пользователь явно выбирает локальные источники; приложение не сканирует удалённую библиотеку.
- [AVFoundation](https://developer.apple.com/av-foundation/) и [Vision](https://developer.apple.com/documentation/vision): длительность, тайминг, ориентация и визуальное сравнение доступны on-device.

Из VK Видео взяты крупный первый видеокадр, плотные метаданные, immersive player, Cast, capture/import и timeline. Не взяты публичная лента, каналы, подписки, реакции, аккаунт и удалённый каталог.

Справки CapCut подтверждают композицию preview над горизонтальным timeline и отдельное намерение export. «Склейка» оставляет только порядок и удаление.
