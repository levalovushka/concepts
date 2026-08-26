## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Войти и сохранить связь со своим домом | root | default<br>loading<br>error | Получить код → navigate:code |
| code | Подтвердить вход перед выбором дома | push | default<br>loading<br>error | Продолжить → navigate:join |
| codefail | Объяснить ошибку и вернуть к вводу | push | default<br>loading<br>error | Ввести снова → navigate:code |
| join | Найти дом и начать подтверждение проживания | push | default<br>searching<br>denied | Я рядом — проверить → request<br>Выбрать дом вручную → navigate:manual |
| verify | Сверить присутствие во дворе и домашнюю сеть | sheet | default<br>checking<br>success<br>mismatch<br>denied | Проверить, что я дома → request<br>Подтвердить адрес вручную → navigate:manual |
| manual | Подать адрес на ручное подтверждение | push | default<br>submitted<br>error | Сохранить заявку → mutate:residenceReview |
| home | Открыть социальную ленту своего дома и участвовать в жизни соседей | tab | default<br>empty<br>loading<br>liked<br>poll<br>poll-voted<br>end | Создать публикацию → navigate:createpost<br>Уведомления дома → navigate:notifications<br>Открыть публикацию → navigate:post<br>Поставить отметку «Нравится» → mutate:likedPosts<br>Поделиться публикацией → external |
| createpost | Опубликовать текст, фотографию, вопрос, объявление, событие или проблему в ленте дома | sheet | default<br>error | Опубликовать → mutate:houseFeed<br>Отмена → dismiss<br>Изменить тип публикации → mutate:composerKind<br>Добавить фотографию → request |
| notifications | Понять, что изменилось в доме, и открыть исходное дело, чат или срок | push | default<br>empty | Открыть источник уведомления → navigate:post<br>Прочитать всё → mutate:readNotifications |
| post | Разобраться в одном деле дома и выполнить следующее действие | push | default<br>following<br>resolved | Следить за изменениями → mutate:followingMatters<br>Написать в чат дома → navigate:chat<br>Отправить комментарий → mutate:matterReplies |
| problem | Сообщить о проблеме с местом и доказательством | sheet | default<br>submitting<br>success<br>error | Сообщить → mutate:houseFeed<br>Добавить фото → request<br>Отмена → dismiss |
| shoot | Снять доказательство проблемы | system | default<br>denied | System/contract-owned outcome |
| chronicle | Отобрать снимки своего двора из медиатеки | push | scanning<br>populated<br>selected<br>empty<br>denied | Выбрать фотографии → request<br>Поделиться в ленте дома → mutate:houseFeed |
| chats | Вернуться к разговорам дома и подъезда | tab | default<br>empty<br>loading | Открыть чат → navigate:chat |
| chat | Обсудить дело с подъездом | push | default<br>empty | Отправить сообщение → mutate:conversationMessages<br>Добавить фото → request<br>Записать голосовое → request |
| voice | Записать и расшифровать голосовое сообщение | sheet | recording<br>transcribing<br>ready<br>denied | Отправить голосовое → mutate:conversationMessages<br>Отменить запись → dismiss |
| lockscreen | Показать сообщение соседа как системное общение | system | default<br>fallback | System/contract-owned outcome |
| yard | Открыть инфраструктуру дома одним действием | tab | default | Открыть текущее дело → navigate:post<br>Открыть событие во дворе → navigate:events<br>Открыть гостевую сеть → navigate:guest<br>Открыть счётчики → navigate:meters<br>Открыть события → navigate:events |
| guest | Подключить гостя к сети без ручного ввода | push | default<br>connecting<br>connected<br>error | Подключить это устройство → request<br>Сканировать QR гостя → request |
| scan | Считать QR-код гостевой сети | system | default<br>denied<br>error | System/contract-owned outcome |
| meters | Передать показания вовремя и сохранить черновик локально | push | default<br>editing<br>submitted<br>error | Сохранить показания → mutate:meterReceipt<br>Напомнить о следующем сроке → request |
| background | Проверить свежесть фонового обновления дома | system | current<br>stale<br>error | System/contract-owned outcome |
| events | Увидеть события дома и добавить их в календарь | push | default<br>empty<br>added<br>error | Добавить в календарь → request |
| menu | Открыть сервисы и защищённые данные дома | tab | default | Открыть доступы дома → navigate:passwords<br>Открыть соседей → navigate:neighbors<br>Открыть настройки → navigate:settings |
| passwords | Использовать защищённые доступы дома | push | populated<br>empty<br>locked | Разблокировать доступы → request |
| fill | Подставить доступ дома через системный AutoFill | system | default<br>empty | System/contract-owned outcome |
| neighbors | Найти знакомых среди подтверждённых жильцов локально | push | default<br>empty<br>denied | Найти знакомых в контактах → request<br>Открыть профиль соседа → navigate:profile |
| profile | Связаться с соседом, не раскрывая номер | push | default | Написать → navigate:chat |
| settings | Управлять приватностью, фоновыми функциями и защитой | push | default | Защитить вход → request<br>Настроить предложения → navigate:ads<br>Обновлять дом в фоне → request |
| ads | Объяснить выбор персонализации до системного запроса | sheet | default<br>accepted<br>declined | Учитывать интересы → request<br>Не сейчас → mutate:personalizedServices |
| lock | Защитить адрес, квартиры и коды | system | locked<br>unlocked<br>fallback | System/contract-owned outcome |
| widget | Показать отключения и срок показаний до открытия приложения | system | current<br>stale<br>empty | System/contract-owned outcome |
