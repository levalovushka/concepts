## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Войти | root | default<br>loading<br>error<br>offline | Продолжить с почтой → navigate:code |
| code | Подтвердить вход | push | default<br>loading<br>error<br>offline | Продолжить → navigate:codefail |
| codefail | Показать ошибку OTP и вернуть к вводу | push | default<br>loading<br>error<br>offline | Продолжить → mutate:codefail.completed |
| home | Отметить желание и окно времени | tab | default<br>empty<br>loading<br>error<br>offline | Показать совпадения → navigate:match |
| match | Проверить совпадение с другом | push | default<br>loading<br>error<br>offline | Собрать план → mutate:match.completed |
| nearby | Найти совпадение среди близких друзей | tab | default<br>empty<br>loading<br>error<br>offline | Открыть «План» → navigate:plan |
| plan | Встретиться | push | default<br>loading<br>error<br>offline | Подтвердить план → navigate:onway |
| create | Пригласить друзей в приватный план | tab | default<br>error<br>success<br>loading<br>offline | Отправить приглашение → navigate:camera |
| camera | Снять обложку плана | cover | default<br>denied<br>loading<br>error<br>offline | Продолжить → mutate:camera.completed |
| media | Выбрать фото | push | default<br>loading<br>error<br>offline | Продолжить → mutate:media.completed |
| groups | Управлять близкими друзьями | push | default<br>empty<br>loading<br>error<br>offline | Продолжить → mutate:groups.completed |
| chats | Вернуться к активным планам | tab | default<br>empty<br>loading<br>error<br>offline | Открыть «Группа плана» → navigate:chat |
| chat | Договориться | push | default<br>loading<br>error<br>offline | Открыть «Голосовое» → navigate:voice |
| voice | Записать голос | sheet | default<br>denied<br>loading<br>error<br>offline | Отправить → mutate:voice.completed |
| profile | Управлять профилем | tab | default<br>loading<br>error<br>offline | Открыть «Настройки» → navigate:settings |
| settings | Держать доступы и системные функции под рукой | push | default<br>loading<br>error<br>offline | Обновлять планы в фоне → navigate:widget |
| widget | Поставить виджет ближайшего плана на экран «Домой» | cover | default<br>loading<br>error<br>offline | Открыть «Сегодня» → mutate:widget.completed |
| fill | Войти на сайт сохранённым в «Сегодня» входом | cover | default<br>loading<br>error<br>offline | Войти → mutate:fill.completed |
| refresh | Проверить, что фоновое обновление работает | push | default<br>loading<br>error<br>offline | Проверить задачу → mutate:refresh.completed |
| mates | Найти своих среди тех, кто уже здесь | push | default<br>empty<br>denied<br>loading<br>error<br>offline | Продолжить → mutate:mates.completed |
| ads | Объяснить обмен до системного запроса ATT | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:ads.completed |
| lock | Закрыть планы и окна свободного времени биометрией | push | default<br>denied<br>loading<br>error<br>offline | Замок Face ID → mutate:lock.completed |
| sayplan | Разобрать сказанное вслух на время и место | push | default<br>error<br>success<br>loading<br>offline | Собрать план → mutate:sayplan.completed |
| onway | Слушать голосовые участников подряд, не разблокируя телефон | push | default<br>loading<br>error<br>offline | Слушать подряд → navigate:background |
| background | Показать, что очередь голосовых играет при погашенном экране | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:background.completed |
| call | Договориться на ходу, не раскрывая номер | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:call.completed |
| netqr | Подключиться к гостевой сети места встречи | sheet | default<br>error<br>loading<br>offline | Подключиться → mutate:netqr.completed |
| shareext | Принять место или ссылку из другого приложения в план | sheet | default<br>success<br>loading<br>error<br>offline | Добавить в план → mutate:shareext.completed |
