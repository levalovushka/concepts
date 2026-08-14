# Склейка — quality evidence

## Primary observations

Apple system sharing не даёт приложению статус доставки: request screen создаёт только карточку. Photos/Files отдают выбранные локальные документы: project показывает источник файла, а не участника. AVFoundation/Vision работают on-device: processing не изображает серверную очередь.

## Product critique

1. «Приглашение» могло маскировать облачный проект — заменено на карточку без получателей и ответов; evidence: invite, share.
2. Автосборка могла скрывать серверный монтаж — UI показывает local files, metadata, Vision и FileManager; evidence: project, processing, draft.
3. Библиотека могла требовать аккаунт — root содержит документы и экспорты этого iPhone; evidence: projects, archive, settings.

## Data provenance по каждому экрану

| Экран | Честный источник данных |
|---|---|
| `projects` | Core Data с локальными описаниями проектов + превью и размеры из FileManager. |
| `archive` | Локальные export-файлы в контейнере приложения; список строится из FileManager. |
| `settings` | Размеры директорий FileManager и локальные флаги настроек; аккаунтного профиля нет. |
| `create` | Ввод пользователя; обложка bundled; после сохранения — новая Core Data запись. |
| `place` | Одноразовый результат Core Location или ручная строка, сохраняемая только в проект. |
| `project` | Core Data + локальные video URLs, Photos asset identifiers и security-scoped Files bookmarks. |
| `invite` | Bundled шаблон карточки + название локального события; списка адресатов и ответов нет. |
| `share` | UIActivityViewController получает готовую карточку и текст; приложение не читает получателей или доставку. |
| `camera` | Live AVFoundation preview; результат записи копируется FileManager в текущий проект. |
| `import` | Только элементы, выбранные пользователем в PHPicker и document picker. |
| `processing` | Локальные URL, ImageIO metadata, AVAsset properties и on-device Vision/Core ML results. |
| `draft` | Локальный composition manifest, proxy-файлы и результаты группировки в Core Data/FileManager. |
| `editor` | Локальный edit history и имена исходных файлов; reorder/delete меняют только manifest. |
| `viewer` | Локальный draft/export URL в AVPlayer; название сцены берётся из manifest. |
| `cast` | Системный route picker и Bonjour в текущей локальной сети; удалённого каталога устройств нет. |
| `background` | Локальный AVPlayer state + MPNowPlayingInfoCenter; сеть не используется. |
| `export` | Локальный composition manifest, оценка AVAssetExportSession и свободное место устройства. |
| `saved` | Результат локального export и, при разрешении, PHPhotoLibrary `performChanges`. |

## Data provenance return reasons

| Причина вернуться | Источник |
|---|---|
| Импортировать новую пачку | Файлы, уже полученные пользователем системным способом и выбранные в Photos/Files; приложение не знает отправителя. |
| Исправить черновик | Сохранённые на этом устройстве manifest, proxy и edit history; удалённой версии нет. |
| Экспортировать повторно | Локальный draft/export URL и выбранный пользователем preset качества; Share Sheet системный. |

Три полных visual pass: 22 найденных и исправленных дефекта, 0 blocker/major. В третьем проходе отдельно проверены consumer-копирайт, реальная карта, библиотека, экран проекта и все системные sheets.
