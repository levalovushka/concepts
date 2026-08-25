## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.chats.label | Чаты | none | Root tab label | chats | navigation |
| navigation.tab.home.label | Дом | none | Root tab label | home | navigation |
| navigation.tab.menu.label | Меню | none | Root tab label | menu | navigation |
| navigation.tab.yard.label | Двор | none | Root tab label | yard | navigation |
| permission.appgroups.body | Entitlement без системного запроса: виджет и расширения читают данные приложения. | none | System permission explanation | settings<br>widget | permission |
| permission.appgroups.fallback | Без группы виджет пустой, а пересланное объявление не доходит — не ship | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | settings<br>widget | permission |
| permission.autofill.body | Entitlement без системного запроса: пароли дома подставляются в Safari системным автозаполнением. | none | System permission explanation | passwords<br>fill | permission |
| permission.autofill.fallback | Пароль остаётся копировать руками из карточки | none | Denied fallback | fill | recovery |
| permission.autofill.title | Автозаполнение паролей | none | System permission pre-prompt title | passwords<br>fill | permission |
| permission.bgtask.body | Entitlement без системного запроса: app.dvor.refresh объявлен в Info.plist и зарегистрирован в коде. | none | System permission explanation | background<br>meters | permission |
| permission.bgtask.fallback | Незарегистрированный идентификатор — задача не запустится вообще | none | Denied fallback | meters | recovery |
| permission.bgtask.title | Идентификатор фоновой задачи | none | System permission pre-prompt title | background<br>meters | permission |
| permission.calendar.body | Чтобы добавить собрание и субботник, а при переносе — поправить уже добавленное событие. | none | System permission explanation | events | permission |
| permission.calendar.fallback | Событие остаётся только внутри «Двора», с напоминанием в приложении | none | Denied fallback | events | recovery |
| permission.calendar.title | «Двор» запрашивает доступ к календарю | none | System permission pre-prompt title | events | permission |
| permission.camera.body | Чтобы снять то, что сломалось, и сканировать QR-код гостевой сети двора. | none | System permission explanation | problem<br>shoot | permission |
| permission.camera.fallback | Остаётся фото из медиатеки и ввод имени сети с паролем руками | none | Denied fallback | shoot | recovery |
| permission.camera.title | «Двор» запрашивает доступ к камере | none | System permission pre-prompt title | problem<br>shoot | permission |
| permission.commnotif.body | Entitlement без системного запроса: уведомление о сообщении соседа показывается с его аватаром. | none | System permission explanation | chat<br>lockscreen | permission |
| permission.commnotif.fallback | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки | none | Denied fallback | lockscreen | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat<br>lockscreen | permission |
| permission.contacts.body | Чтобы показать, кто из ваших знакомых уже живёт в этом доме. Книга не покидает устройство. | none | System permission explanation | menu<br>neighbors | permission |
| permission.contacts.fallback | Остаётся поиск по номеру квартиры и по подъезду | none | Denied fallback | neighbors | recovery |
| permission.contacts.title | «Двор» запрашивает доступ к контактам | none | System permission pre-prompt title | menu<br>neighbors | permission |
| permission.faceid.body | Чтобы закрыть приложение: в нём адрес, номера квартир и коды от общих дверей. | none | System permission explanation | settings<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Двор» запрашивает использование Face ID | none | System permission pre-prompt title | settings<br>lock | permission |
| permission.fetch.body | Entitlement без системного запроса: объявления дома и срок передачи показаний подтягиваются к утру. | none | System permission explanation | settings<br>background | permission |
| permission.fetch.fallback | Без режима лента и срок обновляются в момент открытия | none | Denied fallback | background | recovery |
| permission.fetch.title | Обновление в фоне | none | System permission pre-prompt title | settings<br>background | permission |
| permission.hotspot.body | Приложение настроит подключение к гостевой сети двора по параметрам из QR-кода. | none | System permission explanation | guest | permission |
