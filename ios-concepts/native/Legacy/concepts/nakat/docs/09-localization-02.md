## Localization string catalog

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| permission.hotspot.title | «Накат» подключит вас к сети AVTO4-CLASS | none | System permission pre-prompt title | guestnet | permission |
| permission.keychain.body | Entitlement без системного запроса: одна сессия на приложение, виджет и расширения. | none | System permission explanation | widget<br>lessons | permission |
| permission.keychain.fallback | Без общей группы вход придётся повторять в каждом расширении | none | Denied fallback | lessons | recovery |
| permission.keychain.title | Общая связка ключей | none | System permission pre-prompt title | widget<br>lessons | permission |
| permission.location.body | Чтобы показать, сколько идти до точки посадки, и какие экзаменационные маршруты рядом с вами. | none | System permission explanation | lesson<br>pickup | permission |
| permission.location.fallback | Адрес посадки остаётся текстом, без точки «я» и расстояния | none | Denied fallback | pickup | recovery |
| permission.location.title | «Накат» запрашивает доступ к геопозиции | none | System permission pre-prompt title | lesson<br>pickup | permission |
| permission.mic.body | Чтобы записать разбор занятия голосом сразу после поездки, пока не забылось. | none | System permission explanation | drive<br>note | permission |
| permission.mic.fallback | Заметка к занятию набирается текстом | none | Denied fallback | note | recovery |
| permission.mic.title | «Накат» запрашивает доступ к микрофону | none | System permission pre-prompt title | drive<br>note | permission |
| permission.photos.body | Чтобы добавить в документы уже снятую медсправку — заново её фотографировать не нужно. | none | System permission explanation | docs | permission |
| permission.photos.fallback | Документ остаётся сфотографировать на месте | none | Denied fallback | docs | recovery |
| permission.photos.title | «Накат» запрашивает доступ к медиатеке | none | System permission pre-prompt title | docs | permission |
| permission.push.body | Перенос занятия, освободившийся слот на 7:20 и напоминание за час до выезда. | none | System permission explanation | notif | permission |
| permission.push.fallback | Изменения видны только при открытии приложения | none | Denied fallback | notif | recovery |
| permission.push.title | «Накат» запрашивает разрешение на уведомления | none | System permission pre-prompt title | notif | permission |
| permission.remotenotif.body | Entitlement без системного запроса: тихий пуш обновляет виджет со следующим занятием. | none | System permission explanation | bg<br>widget | permission |
| permission.remotenotif.fallback | Виджет обновляется только при запуске приложения | none | Denied fallback | widget | recovery |
| permission.remotenotif.title | Тихие уведомления | none | System permission pre-prompt title | bg<br>widget | permission |
| permission.speech.body | Чтобы у голосовой заметки появилась расшифровка, а проговоренный алгоритм сверялся с чек-листом. | none | System permission explanation | drive<br>note | permission |
| permission.speech.fallback | Заметка остаётся звуком без текста, пункты чек-листа отмечаются пальцем | none | Denied fallback | note | recovery |
| permission.speech.title | «Накат» запрашивает доступ к распознаванию речи | none | System permission pre-prompt title | drive<br>note | permission |
| permission.tracking.body | Тогда реклама будет про автошколу и дорогу: шины и страховка, а не случайный баннер. | none | System permission explanation | ads<br>menu | permission |
| permission.tracking.fallback | Реклама остаётся, но неперсонализированная — не по интересам | none | Denied fallback | menu | recovery |
| permission.tracking.title | Разрешить «Накату» отслеживать действия? | none | System permission pre-prompt title | ads<br>menu | permission |
| permission.voip.body | Entitlement без системного запроса: входящий вызов поднимает приложение через PushKit и показывается в CallKit. | none | System permission explanation | lesson<br>call | permission |
| permission.voip.fallback | Без режима вызов приходит обычным уведомлением, и на него надо успеть открыть приложение | none | Denied fallback | call | recovery |
| permission.voip.title | Звонок внутри приложения | none | System permission pre-prompt title | lesson<br>call | permission |
| permission.wifiinfo.body | Entitlement без системного запроса: имя текущей сети сверяется с сетью класса из профиля группы. | none | System permission explanation | attend<br>classroom | permission |
| permission.wifiinfo.fallback | Без entitlement отметку ставит преподаватель вручную, по списку | none | Denied fallback | classroom | recovery |
| permission.wifiinfo.title | Чтение имени сети | none | System permission pre-prompt title | attend<br>classroom | permission |
| scenario.all.failure.name | Весь продукт: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons<br>lesson<br>call<br>pickup<br>scan | acceptance |
