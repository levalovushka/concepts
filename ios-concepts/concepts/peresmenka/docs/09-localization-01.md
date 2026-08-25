## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.menu.label | Меню | none | Root tab label | menu | navigation |
| navigation.tab.people.label | Люди | none | Root tab label | people | navigation |
| navigation.tab.shifts.label | Смены | none | Root tab label | shifts | navigation |
| navigation.tab.swaps.label | Подмены | none | Root tab label | swaps | navigation |
| permission.appgroups.body | Entitlement без системного запроса: виджет и расширения читают данные приложения. | none | System permission explanation | settings<br>widget | permission |
| permission.appgroups.fallback | Без группы виджет пустой, а пересланная в рабочий чат смена не доходит — не ship | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | settings<br>widget | permission |
| permission.audio.body | Entitlement без системного запроса: брифинг продолжает играть с погашенным экраном и управляется с локскрина. | none | System permission explanation | brief<br>player | permission |
| permission.audio.fallback | Без режима звук обрывается при блокировке — брифинг придётся слушать с открытым экраном | none | Denied fallback | player | recovery |
| permission.audio.title | Фоновое воспроизведение | none | System permission pre-prompt title | brief<br>player | permission |
| permission.autofill.body | Entitlement без системного запроса: рабочие логины точки подставляются в Safari системным автозаполнением. | none | System permission explanation | passwords<br>fill | permission |
| permission.autofill.fallback | Логин остаётся копировать руками из карточки точки | none | Denied fallback | fill | recovery |
| permission.autofill.title | Автозаполнение паролей | none | System permission pre-prompt title | passwords<br>fill | permission |
| permission.bgtask.body | Entitlement без системного запроса: app.peresmenka.refresh объявлен в Info.plist и зарегистрирован в коде. | none | System permission explanation | background<br>shifts | permission |
| permission.bgtask.fallback | Незарегистрированный идентификатор — задача не запустится вообще | none | Denied fallback | shifts | recovery |
| permission.bgtask.title | Идентификатор фоновой задачи | none | System permission pre-prompt title | background<br>shifts | permission |
| permission.calendar.body | Чтобы положить смены в календарь, а при переносе — поправить уже добавленное событие. | none | System permission explanation | shift | permission |
| permission.calendar.fallback | Смена остаётся внутри «Пересменки», с напоминанием за час в приложении | none | Denied fallback | shift | recovery |
| permission.calendar.title | «Пересменка» запрашивает доступ к календарю | none | System permission pre-prompt title | shift | permission |
| permission.camera.body | Чтобы снять зал и витрину при сдаче смены и считать QR рабочей сети. | none | System permission explanation | handover<br>shoot | permission |
| permission.camera.fallback | Акт передачи заполняется галочками без снимков, сеть вводится руками | none | Denied fallback | shoot | recovery |
| permission.camera.title | «Пересменка» запрашивает доступ к камере | none | System permission pre-prompt title | handover<br>shoot | permission |
| permission.commnotif.body | Entitlement без системного запроса: сообщение сменщика показывается с его аватаром. | none | System permission explanation | chat<br>lockscreen | permission |
| permission.commnotif.fallback | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки | none | Denied fallback | lockscreen | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat<br>lockscreen | permission |
| permission.contacts.body | Чтобы показать, с кем из ваших знакомых вы уже работали. Книга не покидает устройство. | none | System permission explanation | people<br>mates | permission |
| permission.contacts.fallback | Остаётся поиск по точке и по общим сменам | none | Denied fallback | mates | recovery |
| permission.contacts.title | «Пересменка» запрашивает доступ к контактам | none | System permission pre-prompt title | people<br>mates | permission |
| permission.faceid.body | Чтобы закрыть раздел заработка: там ставка за час, отработанные часы и долги по сменам. | none | System permission explanation | menu<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Пересменка» запрашивает использование Face ID | none | System permission pre-prompt title | menu<br>lock | permission |
| permission.fetch.body | Entitlement без системного запроса: график на неделю и свежие подмены подтягиваются к утру. | none | System permission explanation | settings<br>background | permission |
