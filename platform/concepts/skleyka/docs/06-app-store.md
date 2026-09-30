# Склейка — App Store и review notes

Photo & Video. Аккаунт опционален: «Продолжить без аккаунта» сразу открывает проекты. Core loop доступен в авиарежиме.

Заявлены девять достижимых возможностей: Camera, Microphone, Photos read, Photos add, Location When In Use, Local Network/Bonjour, Background Audio, Push (новые шаблоны титров через FCM topic) и ATT (бесплатная версия с рекламой). Associated Domains не заявлен: диплинков нет.

Review route:

1. Главная → «+» → строка «Место» спрашивает геопозицию; отказ оставляет ручной ввод.
2. Проект → «Снять» спрашивает Camera и Microphone; deny оставляет Photos/Files.
3. Проект → «Из Фото» спрашивает Photo Library; «Из Файлов» доступа не требует.
4. «Собрать черновик» показывает on-device stages и ведёт в editor/viewer.
5. Плеер → Cast спрашивает Local Network; «В фоне» включает фоновое аудио и Now Playing.
6. Export → «Сохранить в Фото» спрашивает add-only; Share Sheet и Files остаются fallback.
7. Профиль → «Новые шаблоны титров» спрашивает уведомления; отказ оставляет пометку «новое» в черновике.
8. Главная → рекламная карточка или Профиль → «Реклама» → «Показывать по интересам» показывает ATT; отказ оставляет обычную рекламу.

## Метаданные

<!-- @generated:store-meta -->
| Поле | Значение | Знаков |
|---|---|---|
| App Name | Склейка | 7 / 30 |
| Subtitle | Локальный фильм из ваших видео | 30 / 30 |
| Promotional Text | Соберите фильм из видео друзей: получите ролики через AirDrop или сообщения, импортируйте из «Фото» и «Файлов», поправьте порядок и сохраните. | 142 / 170 |
| Keywords | монтаж,событие,друзья,камера,черновик,видеопроект,поездка,праздник,экспорт | 74 / 100 |
| Primary Category | Photo & Video | — |
| Secondary Category | Lifestyle | — |
| Age Rating | 13+ | — |
| Price | Бесплатно, с рекламой | — |
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
| Идентификатор устройства | `Identifiers → Device ID` | Передаётся рекламному SDK только после согласия в ATT | Нет | **Да** |
| Токен push-уведомлений | `Identifiers → Device ID` | Подписка на тему новых шаблонов титров через FCM | Нет | Нет |
| Номер телефона | `Contact Info → Phone Number` | Опциональные вход, регистрация и восстановление доступа | Да | Нет |
<!-- @end -->

## Заметки для ревью

<!-- @generated:store-review -->
| Ключ | Что написать ревьюеру |
|---|---|
<!-- @end -->
