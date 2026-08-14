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
