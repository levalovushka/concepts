## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Первый экран приложения | root | default<br>loading<br>error<br>offline | Открыть «Код из письма» → navigate:code |
| code | OTP · автоподстановка | push | default<br>loading<br>error<br>offline | Открыть «Неверный код» → navigate:codefail |
| codefail | Состояние ошибки OTP | push | default<br>loading<br>error<br>offline | Продолжить → mutate:codefail.completed |
| lessons | Следующее занятие · часы · свободные слоты | tab | default<br>loading<br>error<br>offline | Открыть «Занятие» → navigate:lesson |
| lesson | Инструктор, машина, точка посадки | push | default<br>loading<br>error<br>offline | Открыть «Звонок инструктору» → navigate:call |
| call | CallKit · номера скрыты | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:call.completed |
| pickup | Карта · расстояние · маршруты рядом | push | default<br>loading<br>error<br>offline | Продолжить → mutate:pickup.completed |
| scan | Сканер QR учебной машины | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:scan.completed |
| drive | Часы, отметки, разбор голосом | push | default<br>loading<br>error<br>offline | Открыть «Разбор голосом» → navigate:note |
| note | Запись · расшифровка · привязка к месту | push | default<br>loading<br>error<br>offline | Продолжить → mutate:note.completed |
| reschedule | Свободные слоты · правка события | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:reschedule.completed |
| chat | Переписка по занятию | push | default<br>loading<br>error<br>offline | Открыть «Экран блокировки» → navigate:lockscreen |
| lockscreen | Сообщение с аватаром · режим «За рулём» | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| notif | Что приходит и когда | push | default<br>loading<br>error<br>offline | Продолжить → mutate:notif.completed |
| theory | Билеты · разборы · состояние загрузок | tab | default<br>loading<br>error<br>offline | Открыть «Билет» → navigate:ticket |
| ticket | Вопросы, ошибки, разбор | push | default<br>loading<br>error<br>offline | Открыть «Разбор билета» → navigate:player |
| player | Аудио · ±15 секунд · Now Playing | cover | default<br>loading<br>error<br>offline | Открыть «Экран погас» → navigate:background |
| background | Now Playing на локскрине | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| checklist | Проговаривание · сверка с чек-листом | push | default<br>loading<br>error<br>offline | Продолжить → mutate:checklist.completed |
| classroom | Ведомость часов · отметка присутствия | push | default<br>loading<br>error<br>offline | Открыть «Отметка по сети» → navigate:attend |
| attend | SSID против профиля группы | push | default<br>loading<br>error<br>offline | Продолжить → mutate:attend.completed |
| guestnet | QR со стены · подключение | push | default<br>loading<br>error<br>offline | Открыть «QR со стены» → navigate:scanwifi |
| scanwifi | Сканер QR сети класса | cover | default<br>loading<br>error<br>offline | Продолжить → mutate:scanwifi.completed |
| menu | Документы, доступы, виджет, фон | tab | default<br>loading<br>error<br>offline | Открыть «Уведомления» → navigate:notif |
| docs | Медсправка, договор, съёмка и медиатека | push | default<br>loading<br>error<br>offline | Продолжить → mutate:docs.completed |
| lock | Face ID · код-пароль | push | default<br>loading<br>error<br>offline | Продолжить → mutate:lock.completed |
| passwords | Записи автошколы · автозаполнение | push | default<br>loading<br>error<br>offline | Открыть «Автозаполнение в Safari» → navigate:fill |
| fill | Подстановка логина на сайт тренажёра | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| widget | Следующее занятие · часы | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| bg | Fetch, тихий пуш, идентификаторы задач | push | default<br>loading<br>error<br>offline | Продолжить → mutate:bg.completed |
| ads | Экран-объяснение до ATT | push | default<br>loading<br>error<br>offline | Продолжить → mutate:ads.completed |
