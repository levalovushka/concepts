## Localization string catalog

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| permission.wifiinfo.body | Entitlement без системного запроса: имя текущей сети сверяется с сетью, записанной в карточке точки. | none | System permission explanation | checkin | permission |
| permission.wifiinfo.fallback | Остаётся отметка вручную — её подтверждает старший смены, и в табеле она помечена как неподтверждённая | none | Denied fallback | checkin | recovery |
| permission.wifiinfo.title | Чтение имени сети | none | System permission pre-prompt title | checkin | permission |
| scenario.all.failure.name | Весь продукт: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts<br>import<br>shift | acceptance |
| scenario.all.happy.name | Весь продукт: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts<br>import<br>shift | acceptance |
| scenario.all.offline.name | Весь продукт: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts<br>import<br>shift | acceptance |
| scenario.all.persistence.name | Весь продукт: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts<br>import<br>shift | acceptance |
| scenario.permission.appgroups.denied.name | Виджет «Ближайшая смена» и Share Extension видят данные приложения: отказ и запасной путь | none | Acceptance scenario name | settings<br>widget | acceptance |
| scenario.permission.audio.denied.name | Брифинги слушают по дороге на смену: экран в кармане, на локскрине — Now Playing и ±15 секунд: отказ и запасной путь | none | Acceptance scenario name | brief<br>player | acceptance |
| scenario.permission.autofill.denied.name | Логины точки — планшет доставки, табельный портал — подставляются в Safari без пересылки в чат: отказ и запасной путь | none | Acceptance scenario name | passwords<br>fill | acceptance |
| scenario.permission.bgtask.denied.name | Идентификатор app.peresmenka.refresh — под ним планируется обновление графика: отказ и запасной путь | none | Acceptance scenario name | background<br>shifts | acceptance |
| scenario.permission.calendar.denied.name | Смены в системном календаре, с правкой при переносе и удалением при отмене: отказ и запасной путь | none | Acceptance scenario name | shift | acceptance |
| scenario.permission.camera.denied.name | Фото витрины, кассы и холодильника в акт передачи смены плюс сканер QR: отказ и запасной путь | none | Acceptance scenario name | handover<br>shoot | acceptance |
| scenario.permission.commnotif.denied.name | Сообщение сменщика приходит с аватаром и попадает в сводку Focus: отказ и запасной путь | none | Acceptance scenario name | chat<br>lockscreen | acceptance |
| scenario.permission.contacts.denied.name | Кто из ваших контактов уже здесь: с ними подмена закрывается первой: отказ и запасной путь | none | Acceptance scenario name | people<br>mates | acceptance |
| scenario.permission.faceid.denied.name | Замок на разделе «Заработок»: ставка и часы не видны через плечо: отказ и запасной путь | none | Acceptance scenario name | menu<br>lock | acceptance |
| scenario.permission.fetch.denied.name | График и открытые подмены готовы к первому открытию — до смены их читают на ходу: отказ и запасной путь | none | Acceptance scenario name | settings<br>background | acceptance |
| scenario.permission.hotspot.denied.name | Подключение к сети незнакомой точки по QR из подсобки — без него отметка не засчитается: отказ и запасной путь | none | Acceptance scenario name | netqr | acceptance |
| scenario.permission.keychain.denied.name | Одна сессия: из виджета приложение открывается уже войденным: отказ и запасной путь | none | Acceptance scenario name | widget<br>shifts | acceptance |
| scenario.permission.location.denied.name | Точки рядом при устройстве и время в пути до открытой подмены: отказ и запасной путь | none | Acceptance scenario name | join | acceptance |
| scenario.permission.mic.denied.name | Голосовой брифинг смены: что кончилось, что по акции, что передать вечерним: отказ и запасной путь | none | Acceptance scenario name | brief<br>record | acceptance |
| scenario.permission.photos.denied.name | График из скриншота: приложение находит снимки экрана с расписанием и раскладывает их на смены: отказ и запасной путь | none | Acceptance scenario name | shifts<br>import | acceptance |
| scenario.permission.push.denied.name | Уведомление, когда на выставленную смену откликнулись: отказ и запасной путь | none | Acceptance scenario name | shift | acceptance |
| scenario.permission.remotenotif.denied.name | Перенос или отмена смены доезжает до виджета при закрытом приложении: отказ и запасной путь | none | Acceptance scenario name | shift<br>background | acceptance |
| scenario.permission.speech.denied.name | Расшифровка брифинга в текст рядом с записью: отказ и запасной путь | none | Acceptance scenario name | brief<br>record | acceptance |
| scenario.permission.tracking.denied.name | Объявления работодателей вместо платной подписки: отказ и запасной путь | none | Acceptance scenario name | ads<br>menu | acceptance |
| scenario.permission.voip.denied.name | Звонок по смене без обмена номерами: телефон остаётся у владельца: отказ и запасной путь | none | Acceptance scenario name | person<br>call | acceptance |
| scenario.permission.wifiinfo.denied.name | Отметка смены засчитывается сетью заведения, а не словом сотрудника: отказ и запасной путь | none | Acceptance scenario name | checkin | acceptance |
| scenario.shiftday.failure.name | День смены: ошибка и восстановление | none | Acceptance scenario name | shifts<br>shift<br>checkin<br>netqr<br>scan<br>handover<br>shoot<br>brief | acceptance |
| scenario.shiftday.happy.name | День смены: основной путь | none | Acceptance scenario name | shifts<br>shift<br>checkin<br>netqr<br>scan<br>handover<br>shoot<br>brief | acceptance |
| scenario.shiftday.offline.name | День смены: без сети | none | Acceptance scenario name | shifts<br>shift<br>checkin<br>netqr<br>scan<br>handover<br>shoot<br>brief | acceptance |
| scenario.shiftday.persistence.name | День смены: возврат после перезапуска | none | Acceptance scenario name | shifts<br>shift<br>checkin<br>netqr<br>scan<br>handover<br>shoot<br>brief | acceptance |
