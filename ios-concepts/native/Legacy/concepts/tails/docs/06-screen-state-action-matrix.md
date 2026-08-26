## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Войти | root | default<br>loading<br>error<br>offline | Продолжить с почтой → navigate:code |
| code | Подтвердить вход | push | default<br>loading<br>error<br>offline | Войти → navigate:codefail |
| codefail | Показать ошибку OTP и вернуть к вводу | push | default<br>loading<br>error<br>offline | Войти → mutate:codefail.completed |
| home | Смотреть друзей | tab | default<br>empty<br>loading<br>error<br>offline | Открыть «Профиль питомца» → navigate:pet |
| pet | Познакомиться | push | default<br>loading<br>error<br>offline | Написать → navigate:vetnote |
| nearby | Найти прогулку | tab | default<br>empty<br>loading<br>error<br>offline | Открыть «Прогулка» → navigate:walk |
| walk | Встретиться | push | default<br>loading<br>error<br>offline | Открыть «Сеть площадки по QR» → navigate:netqr |
| create | Опубликовать момент | tab | default<br>error<br>success<br>loading<br>offline | Снять → navigate:camera |
| camera | Снять момент | cover | default<br>denied<br>loading<br>error<br>offline | Продолжить → mutate:camera.completed |
| media | Выбрать фото | push | default<br>loading<br>error<br>offline | Продолжить → mutate:media.completed |
| places | Выбрать площадку для прогулки | push | default<br>empty<br>loading<br>error<br>offline | Лопухинский сад → mutate:places.completed |
| chats | Вернуться к диалогам | tab | default<br>empty<br>loading<br>error<br>offline | Открыть «Чат» → navigate:chat |
| chat | Договориться | push | default<br>loading<br>error<br>offline | Открыть «Голосовое» → navigate:voice |
| voice | Записать голос | sheet | default<br>denied<br>loading<br>error<br>offline | Отправить → mutate:voice.completed |
| profile | Показать профиль питомца и его прогулки | tab | default<br>loading<br>error<br>offline | Редактировать → navigate:settings |
| settings | Держать доступы и системные функции под рукой | push | default<br>loading<br>error<br>offline | Обновлять ленту в фоне → navigate:widget |
| widget | Поставить виджет ближайшей прогулки на экран «Домой» | cover | default<br>loading<br>error<br>offline | Открыть «Хвосты» → mutate:widget.completed |
| fill | Войти на сайт сохранённым в «Хвостах» входом | cover | default<br>loading<br>error<br>offline | Войти → mutate:fill.completed |
| refresh | Проверить, что фоновое обновление работает | push | default<br>loading<br>error<br>offline | Проверить задачу → mutate:refresh.completed |
| mates | Найти знакомых среди тех, кто уже гуляет рядом | push | default<br>empty<br>denied<br>loading<br>error<br>offline | Продолжить → mutate:mates.completed |
| ads | Объяснить обмен до системного запроса ATT | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:ads.completed |
| lock | Закрыть ветпаспорт и адрес выгула биометрией | push | default<br>denied<br>loading<br>error<br>offline | Замок Face ID → mutate:lock.completed |
| vetnote | Надиктовать наблюдение и положить его в карточку питомца | push | default<br>error<br>success<br>loading<br>offline | Сохранить в карточку → mutate:vetnote.completed |
| course | Слушать занятие и продолжать при погашенном экране | push | default<br>loading<br>error<br>offline | Слушать → navigate:background |
| background | Показать, что занятие продолжается при погашенном экране | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:background.completed |
| call | Договориться о передержке, не раскрывая номер | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:call.completed |
| vaccine | Собрать сроки прививок и положить их в календарь | push | default<br>loading<br>error<br>offline | Добавить в Календарь → mutate:vaccine.completed |
| netqr | Подключиться к гостевой сети дог-парка | sheet | default<br>error<br>loading<br>offline | Подключиться → mutate:netqr.completed |
| shareext | Принять ссылку или кадр из другого приложения в черновик | sheet | default<br>success<br>loading<br>error<br>offline | Сохранить в черновик → mutate:shareext.completed |
