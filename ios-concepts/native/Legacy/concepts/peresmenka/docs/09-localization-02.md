## Localization string catalog

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| permission.fetch.fallback | Без режима график и подмены обновляются в момент открытия | none | Denied fallback | background | recovery |
| permission.fetch.title | Обновление в фоне | none | System permission pre-prompt title | settings<br>background | permission |
| permission.hotspot.body | Приложение настроит подключение к рабочей сети заведения по параметрам из QR-кода в подсобке. | none | System permission explanation | netqr | permission |
| permission.hotspot.fallback | Имя сети и пароль показываются текстом — вводятся руками в Настройках | none | Denied fallback | netqr | recovery |
| permission.hotspot.title | «Пересменка» подключит вас к сети точки | none | System permission pre-prompt title | netqr | permission |
| permission.keychain.body | Entitlement без системного запроса: одна сессия на приложение, виджет и расширения. | none | System permission explanation | widget<br>shifts | permission |
| permission.keychain.fallback | Без общей группы вход придётся повторять в каждом расширении | none | Denied fallback | shifts | recovery |
| permission.keychain.title | Общая связка ключей | none | System permission pre-prompt title | widget<br>shifts | permission |
| permission.location.body | Чтобы найти заведения вокруг вас и считать, сколько добираться до чужой смены. | none | System permission explanation | join | permission |
| permission.location.fallback | Точка выбирается по коду от управляющего, подмены сортируются по времени начала | none | Denied fallback | join | recovery |
| permission.location.title | «Пересменка» запрашивает доступ к геопозиции | none | System permission pre-prompt title | join | permission |
| permission.mic.body | Чтобы записать брифинг смены голосом: сорок секунд быстрее, чем печатать на баре. | none | System permission explanation | brief<br>record | permission |
| permission.mic.fallback | Брифинг остаётся текстовым — набирается на клавиатуре | none | Denied fallback | record | recovery |
| permission.mic.title | «Пересменка» запрашивает доступ к микрофону | none | System permission pre-prompt title | brief<br>record | permission |
| permission.photos.body | Чтобы найти среди ваших скриншотов присланный график и разобрать его на смены. | none | System permission explanation | shifts<br>import | permission |
| permission.photos.fallback | Смены заводятся вручную или считываются с QR-кода на распечатке графика | none | Denied fallback | import | recovery |
| permission.photos.title | «Пересменка» запрашивает доступ к медиатеке | none | System permission pre-prompt title | shifts<br>import | permission |
| permission.push.body | Пришлём, когда на вашу смену найдётся сменщик или сорвётся уже согласованная подмена. | none | System permission explanation | shift | permission |
| permission.push.fallback | Отклики видны при открытии, на вкладке «Подмены» стоит счётчик | none | Denied fallback | shift | recovery |
| permission.push.title | «Пересменка» запрашивает разрешение на уведомления | none | System permission pre-prompt title | shift | permission |
| permission.remotenotif.body | Entitlement без системного запроса: тихий пуш переписывает смену на виджете, пока приложение закрыто. | none | System permission explanation | shift<br>background | permission |
| permission.remotenotif.fallback | Без режима смена на виджете обновляется только после открытия приложения | none | Denied fallback | background | recovery |
| permission.remotenotif.title | Тихие уведомления | none | System permission pre-prompt title | shift<br>background | permission |
| permission.speech.body | Чтобы рядом с брифингом появилась расшифровка — в зале шумно, наушников может не быть. | none | System permission explanation | brief<br>record | permission |
| permission.speech.fallback | Брифинг отправляется без расшифровки, слушать придётся звуком | none | Denied fallback | record | recovery |
| permission.speech.title | «Пересменка» запрашивает доступ к распознаванию речи | none | System permission pre-prompt title | brief<br>record | permission |
| permission.tracking.body | Тогда в ленте подмен будут объявления работодателей рядом с вами, а не случайные баннеры. | none | System permission explanation | ads<br>menu | permission |
| permission.tracking.fallback | Объявления остаются, но неперсонализированные — не по вашим точкам и специальности | none | Denied fallback | menu | recovery |
| permission.tracking.title | Разрешить «Пересменке» отслеживать действия? | none | System permission pre-prompt title | ads<br>menu | permission |
| permission.voip.body | Entitlement без системного запроса: входящий вызов поднимает приложение через PushKit и показывается в CallKit. | none | System permission explanation | person<br>call | permission |
| permission.voip.fallback | Без режима вызов приходит обычным уведомлением, и на него надо успеть открыть приложение | none | Denied fallback | call | recovery |
| permission.voip.title | Звонок сменщику | none | System permission pre-prompt title | person<br>call | permission |
