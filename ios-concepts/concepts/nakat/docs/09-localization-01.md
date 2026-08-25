## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.lessons.label | Занятия | none | Root tab label | lessons | navigation |
| navigation.tab.menu.label | Ещё | none | Root tab label | menu | navigation |
| navigation.tab.theory.label | Теория | none | Root tab label | theory | navigation |
| permission.appgroups.body | Entitlement без системного запроса: виджет и расширения читают данные приложения. | none | System permission explanation | menu<br>widget | permission |
| permission.appgroups.fallback | Без группы виджет пустой, а автозаполнение не видит записей — не ship | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | menu<br>widget | permission |
| permission.audio.body | Entitlement без системного запроса: разбор билета продолжается, когда экран погас или телефон в кармане. | none | System permission explanation | player<br>background | permission |
| permission.audio.fallback | Без режима звук останавливается вместе с экраном — слушать можно только глядя в телефон | none | Denied fallback | background | recovery |
| permission.audio.title | Звук при погашенном экране | none | System permission pre-prompt title | player<br>background | permission |
| permission.autofill.body | Entitlement без системного запроса: логины учебных сервисов группы подставляются в Safari. | none | System permission explanation | passwords<br>fill | permission |
| permission.autofill.fallback | Пароль остаётся копировать руками из карточки | none | Denied fallback | fill | recovery |
| permission.autofill.title | Автозаполнение паролей | none | System permission pre-prompt title | passwords<br>fill | permission |
| permission.bgtask.body | Entitlement без системного запроса: app.nakat.refresh и app.nakat.audio объявлены в Info.plist и зарегистрированы в коде. | none | System permission explanation | bg<br>theory | permission |
| permission.bgtask.fallback | Незарегистрированный идентификатор — задача не запустится вообще | none | Denied fallback | theory | recovery |
| permission.bgtask.title | Идентификаторы фоновых задач | none | System permission pre-prompt title | bg<br>theory | permission |
| permission.calendar.body | Чтобы поставить занятие в календарь, а при переносе поправить уже созданное событие. | none | System permission explanation | lesson | permission |
| permission.calendar.fallback | Занятие остаётся внутри «Наката», с напоминанием в приложении | none | Denied fallback | lesson | recovery |
| permission.calendar.title | «Накат» запрашивает доступ к календарю | none | System permission pre-prompt title | lesson | permission |
| permission.camera.body | Чтобы считать QR на стекле учебной машины и QR сети класса на стене. | none | System permission explanation | lesson<br>scan | permission |
| permission.camera.fallback | Номер машины вводится руками, начало занятия отмечает инструктор | none | Denied fallback | scan | recovery |
| permission.camera.title | «Накат» запрашивает доступ к камере | none | System permission pre-prompt title | lesson<br>scan | permission |
| permission.commnotif.body | Entitlement без системного запроса: сообщение инструктора приходит с его аватаром. | none | System permission explanation | chat<br>lockscreen | permission |
| permission.commnotif.fallback | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки Focus | none | Denied fallback | lockscreen | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat<br>lockscreen | permission |
| permission.faceid.body | Чтобы закрыть приложение: в нём медсправка, паспортные данные и номер договора. | none | System permission explanation | lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Накат» запрашивает использование Face ID | none | System permission pre-prompt title | lock | permission |
| permission.fetch.body | Entitlement без системного запроса: перенос занятия и освободившиеся слоты подтягиваются к утру. | none | System permission explanation | bg<br>lessons | permission |
| permission.fetch.fallback | Без режима расписание подтягивается в момент открытия приложения | none | Denied fallback | lessons | recovery |
| permission.fetch.title | Обновление в фоне | none | System permission pre-prompt title | bg<br>lessons | permission |
| permission.hotspot.body | Приложение настроит подключение к сети класса по параметрам из QR-кода на стене. | none | System permission explanation | guestnet | permission |
| permission.hotspot.fallback | Имя сети и пароль показываются текстом — вводится руками в Настройках | none | Denied fallback | guestnet | recovery |
