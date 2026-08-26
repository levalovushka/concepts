## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.messages-list.label | Сообщения | none | Root tab label | messages-list | navigation |
| navigation.tab.nearby-feed.label | Рядом | none | Root tab label | nearby-feed | navigation |
| navigation.tab.profile.label | Профиль | none | Root tab label | profile | navigation |
| permission.appgroups.body | Передать черновик из Share Extension. | none | System permission explanation | share-extension | permission |
| permission.appgroups.fallback | Пользователь копирует текст вручную. | none | Denied fallback | share-extension | recovery |
| permission.appgroups.title | Передать черновик из Share Extension. | none | System permission pre-prompt title | share-extension | permission |
| permission.keychain.body | Разделить действующую сессию с Share Extension. | none | System permission explanation | auth-code | permission |
| permission.keychain.fallback | Расширение предлагает открыть приложение и войти. | none | Denied fallback | auth-code | recovery |
| permission.keychain.title | Разделить действующую сессию с Share Extension. | none | System permission pre-prompt title | auth-code | permission |
| permission.location.body | Преобразовать текущее положение в приблизительный район. | none | System permission explanation | create-post | permission |
| permission.location.fallback | Ручной выбор района. | none | Denied fallback | create-post | recovery |
| permission.location.title | Преобразовать текущее положение в приблизительный район. | none | System permission pre-prompt title | create-post | permission |
| permission.photos.body | Добавить пользовательское фото предмета. | none | System permission explanation | create-post | permission |
| permission.photos.fallback | Карточка создаётся без изображения. | none | Denied fallback | create-post | recovery |
| permission.photos.title | Добавить пользовательское фото предмета. | none | System permission pre-prompt title | create-post | permission |
| permission.push.body | Сообщать о новых ответах и явно сохранённых категориях. | none | System permission explanation | create-post | permission |
| permission.push.fallback | Обновления доступны внутри приложения. | none | Denied fallback | create-post | recovery |
| permission.push.title | Сообщать о новых ответах и явно сохранённых категориях. | none | System permission pre-prompt title | create-post | permission |
| permission.remotenotif.body | Обновить локальный снимок активных карточек. | none | System permission explanation | nearby-feed | permission |
| permission.remotenotif.fallback | Снимок обновляется при запуске. | none | Denied fallback | nearby-feed | recovery |
| permission.remotenotif.title | Обновить локальный снимок активных карточек. | none | System permission pre-prompt title | nearby-feed | permission |
| scenario.f1.failure.name | Откликнуться: ошибка и восстановление | none | Acceptance scenario name | auth-email<br>conversation-detail | acceptance |
| scenario.f1.happy.name | Откликнуться: основной путь | none | Acceptance scenario name | auth-email<br>conversation-detail | acceptance |
| scenario.f1.offline.name | Откликнуться: без сети | none | Acceptance scenario name | auth-email<br>conversation-detail | acceptance |
| scenario.f1.persistence.name | Откликнуться: возврат после перезапуска | none | Acceptance scenario name | auth-email<br>conversation-detail | acceptance |
| scenario.f2.failure.name | Создать карточку: ошибка и восстановление | none | Acceptance scenario name | nearby-feed | acceptance |
| scenario.f2.happy.name | Создать карточку: основной путь | none | Acceptance scenario name | nearby-feed | acceptance |
| scenario.f2.offline.name | Создать карточку: без сети | none | Acceptance scenario name | nearby-feed | acceptance |
| scenario.f2.persistence.name | Создать карточку: возврат после перезапуска | none | Acceptance scenario name | nearby-feed | acceptance |
| scenario.permission.appgroups.denied.name | Передать черновик из Share Extension.: отказ и запасной путь | none | Acceptance scenario name | share-extension | acceptance |
| scenario.permission.keychain.denied.name | Разделить действующую сессию с Share Extension.: отказ и запасной путь | none | Acceptance scenario name | auth-code | acceptance |
| scenario.permission.location.denied.name | Преобразовать текущее положение в приблизительный район.: отказ и запасной путь | none | Acceptance scenario name | nearby-feed | acceptance |
