# Склейка — App Store и review notes

Photo & Video. Аккаунта и demo credentials нет: приложение сразу открывает локальные проекты. Core loop доступен в авиарежиме.

Заявлены семь достижимых возможностей: Camera, Microphone, Photos read, Photos add, Location When In Use, Local Network/Bonjour и Background Audio. ATT, APNs и Associated Domains не заявлены: трекинга, удалённых событий и universal links нет. Это честное расхождение с формальным preset vk-video; добавлять сервер ради покрытия набора нельзя.

Review route:

1. «Создать событие» → при желании «Моё местоположение».
2. Проект → «Снять» спрашивает Camera и Microphone; deny оставляет Photos/Files.
3. Проект → «Из Photos» спрашивает Photo Library; Files permission не требует.
4. «Собрать черновик» показывает on-device stages и ведёт в editor/viewer.
5. Viewer → Cast спрашивает Local Network; фон показывает Now Playing.
6. Export → «Сохранить в Фото» спрашивает add-only; Share Sheet и Files остаются fallback.

## Метаданные

<!-- @generated:store-meta -->
| Поле | Значение | Знаков |
|---|---|---|
| App Name | Склейка | 7 / 30 |
| Subtitle | Локальный фильм из ваших видео | 30 / 30 |
| Promotional Text | Получите ролики через AirDrop или сообщения, импортируйте их из Photos и Files и соберите локальный черновик без аккаунта, облака и сети. | 137 / 170 |
| Keywords | монтаж,событие,друзья,камера,черновик,видеопроект,поездка,праздник,экспорт | 74 / 100 |
| Primary Category | Photo & Video | — |
| Secondary Category | Lifestyle | — |
| Age Rating | 4+ | — |
| Price | Бесплатно, без рекламы и аккаунта | — |
| Support URL | https://skleyka.video/support | — |
| Marketing URL | https://skleyka.video | — |
| Privacy Policy URL | https://skleyka.video/privacy | — |
| Encryption | ITSAppUsesNonExemptEncryption = NO — только HTTPS-загрузка контента | — |
<!-- @end -->

## Privacy-лейблы

<!-- @generated:store-privacy -->
| Что собираем | Тип в App Privacy | Зачем | Связано с пользователем | Трекинг |
|---|---|---|---|---|
| Фото и видео | `User Content → Photos or Videos` | Совместный приватный видеопроект | Нет | Нет |
| Геопозиция | `Location → Coarse Location` | Место события; только после явного выбора | Нет | Нет |
<!-- @end -->

## Заметки для ревью

<!-- @generated:store-review -->
| Ключ | Что написать ревьюеру |
|---|---|
<!-- @end -->
