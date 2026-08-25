## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.chats.label | Планы | none | Root tab label | chats | navigation |
| navigation.tab.create.label | Создать | none | Root tab label | create | navigation |
| navigation.tab.home.label | Сегодня | none | Root tab label | home | navigation |
| navigation.tab.nearby.label | Вместе | none | Root tab label | nearby | navigation |
| navigation.tab.profile.label | Вы | none | Root tab label | profile | navigation |
| permission.appgroups.body | Виджет показывает следующий приватный план. | none | System permission explanation | settings<br>widget | permission |
| permission.appgroups.fallback | План остаётся внутри приложения | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | settings<br>widget | permission |
| permission.audio.body | Голосовые из плана продолжат играть, когда экран погаснет. | none | System permission explanation | onway<br>background | permission |
| permission.audio.fallback | Без entitlement очередь обрывается на первом сообщении — не ship | none | Denied fallback | background | recovery |
| permission.audio.title | Фоновое аудио | none | System permission pre-prompt title | onway<br>background | permission |
| permission.autofill.body | Системное автозаполнение подставит сохранённый аккаунт на сайте. | none | System permission explanation | settings<br>fill | permission |
| permission.autofill.fallback | Вход вручную почтой и паролем | none | Denied fallback | fill | recovery |
| permission.autofill.title | Вход на today.place | none | System permission pre-prompt title | settings<br>fill | permission |
| permission.bgtask.body | app.today.refresh зарегистрирована для обновления планов. | none | System permission explanation | refresh<br>home | permission |
| permission.bgtask.fallback | Без задачи обновление только вручную | none | Denied fallback | home | recovery |
| permission.bgtask.title | Фоновая задача | none | System permission pre-prompt title | refresh<br>home | permission |
| permission.calendar.body | Чтобы подтверждённый план попал в календарь и сдвинулся, если время перенесут. | none | System permission explanation | plan | permission |
| permission.calendar.fallback | Время остаётся в карточке плана и в напоминании приложения | none | Denied fallback | plan | recovery |
| permission.calendar.title | «Сегодня» запрашивает доступ к календарю | none | System permission pre-prompt title | plan | permission |
| permission.camera.body | Чтобы снять необязательную обложку приватного плана. | none | System permission explanation | create<br>camera | permission |
| permission.camera.fallback | Можно выбрать готовый снимок | none | Denied fallback | camera | recovery |
| permission.camera.title | «Сегодня» запрашивают доступ к камере | none | System permission pre-prompt title | create<br>camera | permission |
| permission.commnotif.body | Сообщение приходит с аватаром друга и учитывает Focus. | none | System permission explanation | chat | permission |
| permission.commnotif.fallback | Обычное уведомление без аватара | none | Denied fallback | chat | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat | permission |
| permission.contacts.body | Чтобы показать, кто из ваших контактов уже здесь. | none | System permission explanation | profile<br>mates | permission |
| permission.contacts.fallback | Остаётся поиск по имени и ссылка-приглашение | none | Denied fallback | mates | recovery |
| permission.contacts.title | «Сегодня» запрашивает доступ к контактам | none | System permission pre-prompt title | profile<br>mates | permission |
| permission.faceid.body | Чтобы планы и окна свободного времени открывались только вам. | none | System permission explanation | settings<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Сегодня» запрашивает доступ к Face ID | none | System permission pre-prompt title | settings<br>lock | permission |
