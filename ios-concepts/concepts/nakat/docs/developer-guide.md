# Накат: developer product guide

> Generated from Product Contract `product-2dc843d470e949f2` and the compiled native manifest. Do not edit by hand.
> UX Specification: `ux-5ac01f78bbc9c54c`; source: `explicit-product-delivery`.
> Contract status: `mature`; maturity floor: `3/4`.

## Product vision and scope

**Thesis.** «Накат» связывает билет, аудио-разбор, занятие и перенос в конечный путь ученика до экзамена.

**Audience.** Взрослые ученики автошколы на курсе категории B: работают, ездят на занятия до смены или после неё

**Situation.** Занятие в 7:20 до работы: разбор слушают в метро по дороге, а у машины смотреть в экран уже нельзя; половина обучения проходит там, где на экран смотреть нельзя по закону, а расписание переносят ежедневно, и держится оно на личном номере инструктора

**Job.** Взрослые ученики автошколы на курсе категории B: работают, ездят на занятия до смены или после неё wants to Не терять прогресс между билетами, дорогой и переносами занятий so that Закрыть следующий обязательный учебный шаг и понимать прогресс до экзамена.

**Wedge.** Учебный шаг связывает ошибочный билет, аудио-разбор, слот практики и подтверждённый перенос

**Observable differentiation.** Ученик дослушивает разбор, приходит на слот или переносит его без обмена личными номерами; measured by Доля обязательных учебных шагов, закрытых до внутреннего экзамена; threshold: Не менее 30% активированных участников завершают основной исход в пилоте.

**In scope**

- Учебный шаг
- Звонок инструктору по учебной группе, а не на номер: телефоны сторон не видны
- Разбор билета и вчерашней поездки в наушниках с погашенным экраном
- Перенос занятия и свободные окна готовы к первому открытию
- Реклама автосервисов и страховых вместо платной подписки
- QR на стекле машины отмечает начало занятия, QR со стены даёт параметры сети класса
- Медсправка и договор из медиатеки в раздел документов
- Голосовая заметка об ошибке сразу после занятия, руки только что были на руле
- Расшифровка заметки и сверка проговоренного алгоритма перекрёстка с чек-листом
- Точка посадки с расстоянием и экзаменационные маршруты рядом
- Занятие в системном календаре, при переносе правится то же событие
- Присутствие на теории подтверждается сетью класса — часы идут в ведомость
- Подключение к сети класса по QR со стены — без него отметка не проходит
- Замок на приложении: документы ученика и номер договора
- Логины тренажёра билетов и кабинета группы подставляются в Safari без копирования
- Перенос занятия и освободившийся слот приходят уведомлением
- Сообщение инструктора приходит с аватаром и проходит через режим «За рулём»
- Тихий пуш обновляет виджет и счётчик часов при закрытом приложении
- Два идентификатора: обновление расписания и догрузка аудио-разборов
- Виджет «Следующее занятие · 34 из 56 часов» и расширение автозаполнения видят данные приложения
- Одна сессия: из виджета приложение открывается уже войденным

**Non-goals**

- Лента, подписки и соцграф: учебная группа — 24 человека, а не сеть
- Покупки внутри: курс оплачивается в кассе автошколы
- Интерфейс инструктора
- Видео за рулём

## Domain glossary

| Term | Definition |
|---|---|
| Курс | Конечная программа ученика до допуска к экзамену. |
| Учебный шаг | Следующее обязательное действие в теории или практике. |
| Занятие | Слот практики ученика с инструктором. |
| Ошибка билета | Неверный ответ, требующий разбора и повторной проверки. |

## Personas and jobs

| Persona | Context | Job |
|---|---|---|
| Основной участник | Занятие в 7:20 до работы: разбор слушают в метро по дороге, а у машины смотреть в экран уже нельзя | Закрыть следующий обязательный учебный шаг и понимать прогресс до экзамена |
| Контрагент | Ученик и инструктор связаны ограниченным сроком курса и конкретными занятиями | Ответить на учебный шаг и закрыть следующий шаг |
| Возвращающийся участник | Дослушать разбор темы, на которой срезался дважды, по дороге на занятие | Продолжить незавершённый учебный шаг |

## Core loop and critical flows

**Core loop:** Ошибка в билете или изменение ближайшего занятия → Закрыть разбор ошибки и подтвердить следующий слот практики → Закрыть следующий обязательный учебный шаг и понимать прогресс до экзамена → Зафиксировать ошибку или завершённое занятие для следующего шага.
**Habit loop:** Ошибка в билете или изменение ближайшего занятия → Закрыть разбор ошибки и подтвердить следующий слот практики → Закрыть следующий обязательный учебный шаг и понимать прогресс до экзамена; cadence: Несколько раз в неделю на срок курса.
**Activation:** Ученик дослушал разбор ошибки и подтвердил следующий слот; signal: finite-driving-course_activated; window: Первые семь дней.

| Flow | Trigger | Steps | Outcome |
|---|---|---|---|
| Весь продукт | phone | phone<br>code<br>codefail<br>lessons<br>lesson<br>call<br>pickup<br>scan | Все 30 экранов и все 20 доступов набора |
| Вход по номеру | phone | phone<br>code<br>codefail<br>lessons | Номер и код из SMS: доступов на этих экранах нет |
| Утреннее занятие | lessons | lessons<br>lesson<br>call<br>pickup<br>scan<br>drive<br>note<br>chat | Звонок без номеров, точка посадки, QR на стекле, разбор голосом |

## Information architecture and navigation

**Navigation model.** Продукт сохраняет идентифицированные связи и коммуникацию, но строит собственную задачно-ориентированную навигацию.
**Reference fit.** Идентифицированная связь ученика и инструктора использует сообщения и вызовы, но собственная навигация остаётся учебной, без социальной ленты.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| lessons | tab | — | tab:lessons<br>permission:bg.fetch<br>permission:widget.keychain | present:null<br>navigate:open-lesson | session.authenticated<br>capability.fetch.requested<br>capability.keychain.requested | none:none |
| lesson | push | lessons | parent:lessons<br>action:lessons.open-lesson<br>permission:lesson.calendar | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-call<br>permission:voip<br>permission:camera<br>permission:location<br>permission:calendar | always<br>capability.calendar.requested | pop:lessons |
| call | cover | lesson | parent:lesson<br>action:lesson.open-call<br>permission:lesson.voip | mutate:complete-call | always<br>capability.voip.requested | dismiss:lesson; interactive-or-action:lesson |
| pickup | push | lesson | parent:lesson<br>permission:lesson.location | mutate:complete-pickup | capability.location.requested | pop:lesson |
| scan | cover | lesson | parent:lesson<br>permission:lesson.camera | mutate:complete-scan | capability.camera.requested | dismiss:lesson; interactive-or-action:lesson |
| drive | push | lesson | parent:lesson | present:null<br>navigate:open-note<br>permission:mic<br>permission:speech | none | pop:lesson |
| note | push | drive | parent:drive<br>action:drive.open-note<br>permission:drive.mic<br>permission:drive.speech | mutate:complete-note | always<br>capability.mic.requested<br>capability.speech.requested | pop:drive |
| reschedule | sheet | lesson | parent:lesson | mutate:complete-reschedule | none | dismiss:lesson; interactive-or-action:lesson |
| chat | push | lesson | parent:lesson | present:null<br>navigate:open-lockscreen<br>permission:commnotif | none | pop:lesson |
| lockscreen | system | chat | parent:chat<br>action:chat.open-lockscreen<br>permission:chat.commnotif |  | always<br>capability.commnotif.requested | system-return:chat |
| notif | push | menu | parent:menu<br>action:menu.open-notif<br>permission:notif.push | mutate:complete-notif<br>permission:push | always<br>capability.push.requested | pop:menu |
| theory | tab | — | tab:theory<br>permission:bg.bgtask | present:null<br>present:null<br>present:null<br>navigate:open-ticket | session.authenticated<br>capability.bgtask.requested | none:none |
| ticket | push | theory | parent:theory<br>action:theory.open-ticket | present:null<br>navigate:open-player | always | pop:theory |
| player | cover | ticket | parent:ticket<br>action:ticket.open-player | present:null<br>navigate:open-background<br>permission:audio | always | dismiss:ticket; interactive-or-action:ticket |
| background | system | player | parent:player<br>action:player.open-background<br>permission:player.audio |  | always<br>capability.audio.requested | system-return:player |
| checklist | push | theory | parent:theory | mutate:complete-checklist | none | pop:theory |
| classroom | push | theory | parent:theory<br>permission:attend.wifiinfo | present:null<br>present:null<br>navigate:open-attend | capability.wifiinfo.requested | pop:theory |
| attend | push | classroom | parent:classroom<br>action:classroom.open-attend | mutate:complete-attend<br>permission:wifiinfo | always | pop:classroom |
| guestnet | push | classroom | parent:classroom<br>permission:guestnet.hotspot | present:null<br>navigate:open-scanwifi<br>permission:hotspot | capability.hotspot.requested | pop:classroom |
| scanwifi | cover | guestnet | parent:guestnet<br>action:guestnet.open-scanwifi | mutate:complete-scanwifi | always | dismiss:guestnet; interactive-or-action:guestnet |
| menu | tab | — | tab:menu<br>permission:ads.tracking | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-notif<br>permission:appgroups | session.authenticated<br>capability.tracking.requested | none:none |
| docs | push | menu | parent:menu<br>permission:docs.photos | mutate:complete-docs<br>permission:photos | capability.photos.requested | pop:menu |
| lock | push | menu | parent:menu<br>permission:lock.faceid | mutate:complete-lock<br>permission:faceid | capability.faceid.requested | pop:menu |
| passwords | push | menu | parent:menu | present:null<br>navigate:open-fill<br>permission:autofill | none | pop:menu |
| fill | system | passwords | parent:passwords<br>action:passwords.open-fill<br>permission:passwords.autofill |  | always<br>capability.autofill.requested | system-return:passwords |
| widget | system | menu | parent:menu<br>permission:bg.remotenotif<br>permission:menu.appgroups | permission:keychain | capability.remotenotif.requested<br>capability.appgroups.requested | system-return:menu |
| bg | push | menu | parent:menu | mutate:complete-bg<br>permission:fetch<br>permission:remotenotif<br>permission:bgtask | none | pop:menu |
| ads | push | menu | parent:menu | mutate:complete-ads<br>permission:tracking | none | pop:menu |

## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Первый экран приложения | root | default<br>loading<br>error<br>offline | Открыть code → navigate:code |
| code | OTP · автоподстановка | push | default<br>loading<br>error<br>offline | Открыть codefail → navigate:codefail |
| codefail | Состояние ошибки OTP | push | default<br>loading<br>error<br>offline | Продолжить: Неверный код → mutate:codefail.completed |
| lessons | Следующее занятие · часы · свободные слоты | tab | default<br>loading<br>error<br>offline | Открыть lesson → navigate:lesson |
| lesson | Инструктор, машина, точка посадки | push | default<br>loading<br>error<br>offline | Открыть call → navigate:call |
| call | CallKit · номера скрыты | cover | default<br>loading<br>error<br>offline | Продолжить: Звонок инструктору → mutate:call.completed |
| pickup | Карта · расстояние · маршруты рядом | push | default<br>loading<br>error<br>offline | Продолжить: Точка посадки → mutate:pickup.completed |
| scan | Сканер QR учебной машины | cover | default<br>loading<br>error<br>offline | Продолжить: QR на стекле → mutate:scan.completed |
| drive | Часы, отметки, разбор голосом | push | default<br>loading<br>error<br>offline | Открыть note → navigate:note |
| note | Запись · расшифровка · привязка к месту | push | default<br>loading<br>error<br>offline | Продолжить: Разбор голосом → mutate:note.completed |
| reschedule | Свободные слоты · правка события | sheet | default<br>loading<br>error<br>offline | Продолжить: Перенос занятия → mutate:reschedule.completed |
| chat | Переписка по занятию | push | default<br>loading<br>error<br>offline | Открыть lockscreen → navigate:lockscreen |
| lockscreen | Сообщение с аватаром · режим «За рулём» | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| notif | Что приходит и когда | push | default<br>loading<br>error<br>offline | Продолжить: Уведомления → mutate:notif.completed |
| theory | Билеты · разборы · состояние загрузок | tab | default<br>loading<br>error<br>offline | Открыть ticket → navigate:ticket |
| ticket | Вопросы, ошибки, разбор | push | default<br>loading<br>error<br>offline | Открыть player → navigate:player |
| player | Аудио · ±15 секунд · Now Playing | cover | default<br>loading<br>error<br>offline | Открыть background → navigate:background |
| background | Now Playing на локскрине | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| checklist | Проговаривание · сверка с чек-листом | push | default<br>loading<br>error<br>offline | Продолжить: Алгоритм вслух → mutate:checklist.completed |
| classroom | Ведомость часов · отметка присутствия | push | default<br>loading<br>error<br>offline | Открыть attend → navigate:attend |
| attend | SSID против профиля группы | push | default<br>loading<br>error<br>offline | Продолжить: Отметка по сети → mutate:attend.completed |
| guestnet | QR со стены · подключение | push | default<br>loading<br>error<br>offline | Открыть scanwifi → navigate:scanwifi |
| scanwifi | Сканер QR сети класса | cover | default<br>loading<br>error<br>offline | Продолжить: QR со стены → mutate:scanwifi.completed |
| menu | Документы, доступы, виджет, фон | tab | default<br>loading<br>error<br>offline | Открыть notif → navigate:notif |
| docs | Медсправка, договор, съёмка и медиатека | push | default<br>loading<br>error<br>offline | Продолжить: Документы → mutate:docs.completed |
| lock | Face ID · код-пароль | push | default<br>loading<br>error<br>offline | Продолжить: Замок приложения → mutate:lock.completed |
| passwords | Записи автошколы · автозаполнение | push | default<br>loading<br>error<br>offline | Открыть fill → navigate:fill |
| fill | Подстановка логина на сайт тренажёра | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| widget | Следующее занятие · часы | system | default<br>loading<br>error<br>offline | System/contract-owned outcome |
| bg | Fetch, тихий пуш, идентификаторы задач | push | default<br>loading<br>error<br>offline | Продолжить: Фоновые обновления → mutate:bg.completed |
| ads | Экран-объяснение до ATT | push | default<br>loading<br>error<br>offline | Продолжить: Почему реклама → mutate:ads.completed |

## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | open-code | open-code:navigate→code | screen.phone.state.loading.recovery | fixture.nakat.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | open-code | open-code:navigate→code | screen.phone.state.populated-default.recovery | fixture.nakat.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | open-code | open-code:navigate→code | screen.phone.state.error.recovery | fixture.nakat.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | open-code | open-code:navigate→code | screen.phone.state.offline.recovery | fixture.nakat.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.loading.recovery | fixture.nakat.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.populated-default.recovery | fixture.nakat.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.error.recovery | fixture.nakat.code.error |
| code | offline | yes | screen.code.state.offline.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.offline.recovery | fixture.nakat.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.loading.recovery | fixture.nakat.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.populated-default.recovery | fixture.nakat.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.error.recovery | fixture.nakat.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.offline.recovery | fixture.nakat.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lessons | loading | yes | screen.lessons.state.loading.body | open-lesson | open-lesson:navigate→lesson | screen.lessons.state.loading.recovery | fixture.nakat.lessons.loading |
| lessons | populated/default | yes | screen.lessons.state.populated-default.body | open-lesson | open-lesson:navigate→lesson | screen.lessons.state.populated-default.recovery | fixture.nakat.lessons.default |
| lessons | empty | yes | screen.lessons.state.empty.body | open-lesson | open-lesson:navigate→lesson | screen.lessons.state.empty.recovery | fixture.nakat.lessons.empty |
| lessons | error | yes | screen.lessons.state.error.body | open-lesson | open-lesson:navigate→lesson | screen.lessons.state.error.recovery | fixture.nakat.lessons.error |
| lessons | offline | yes | screen.lessons.state.offline.body | open-lesson | open-lesson:navigate→lesson | screen.lessons.state.offline.recovery | fixture.nakat.lessons.offline |
| lessons | permission-needed | yes | screen.lessons.state.permission-needed.body | open-lesson<br>permission.fetch.fallback<br>permission.keychain.fallback | open-lesson:navigate→lesson | screen.lessons.state.permission-needed.recovery | fixture.nakat.lessons.permission-needed |
| lessons | permission-denied | yes | screen.lessons.state.permission-denied.body | open-lesson<br>permission.fetch.fallback<br>permission.keychain.fallback | open-lesson:navigate→lesson | screen.lessons.state.permission-denied.recovery | fixture.nakat.lessons.permission-denied |
| lessons | permission-restricted | yes | screen.lessons.state.permission-restricted.body | open-lesson<br>permission.fetch.fallback<br>permission.keychain.fallback | open-lesson:navigate→lesson | screen.lessons.state.permission-restricted.recovery | fixture.nakat.lessons.permission-restricted |
| lessons | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lesson | loading | yes | screen.lesson.state.loading.body | open-call | open-call:navigate→call | screen.lesson.state.loading.recovery | fixture.nakat.lesson.loading |
| lesson | populated/default | yes | screen.lesson.state.populated-default.body | open-call | open-call:navigate→call | screen.lesson.state.populated-default.recovery | fixture.nakat.lesson.default |
| lesson | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lesson | error | yes | screen.lesson.state.error.body | open-call | open-call:navigate→call | screen.lesson.state.error.recovery | fixture.nakat.lesson.error |
| lesson | offline | yes | screen.lesson.state.offline.body | open-call | open-call:navigate→call | screen.lesson.state.offline.recovery | fixture.nakat.lesson.offline |
| lesson | permission-needed | yes | screen.lesson.state.permission-needed.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-needed.recovery | fixture.nakat.lesson.permission-needed |
| lesson | permission-denied | yes | screen.lesson.state.permission-denied.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-denied.recovery | fixture.nakat.lesson.permission-denied |
| lesson | permission-restricted | yes | screen.lesson.state.permission-restricted.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-restricted.recovery | fixture.nakat.lesson.permission-restricted |
| lesson | permission-limited | yes | screen.lesson.state.permission-limited.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-limited.recovery | fixture.nakat.lesson.permission-limited |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.nakat.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.nakat.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.nakat.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.nakat.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.nakat.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.nakat.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.nakat.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| pickup | loading | yes | screen.pickup.state.loading.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.loading.recovery | fixture.nakat.pickup.loading |
| pickup | populated/default | yes | screen.pickup.state.populated-default.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.populated-default.recovery | fixture.nakat.pickup.default |
| pickup | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| pickup | error | yes | screen.pickup.state.error.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.error.recovery | fixture.nakat.pickup.error |
| pickup | offline | yes | screen.pickup.state.offline.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.offline.recovery | fixture.nakat.pickup.offline |
| pickup | permission-needed | yes | screen.pickup.state.permission-needed.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-needed.recovery | fixture.nakat.pickup.permission-needed |
| pickup | permission-denied | yes | screen.pickup.state.permission-denied.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-denied.recovery | fixture.nakat.pickup.permission-denied |
| pickup | permission-restricted | yes | screen.pickup.state.permission-restricted.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-restricted.recovery | fixture.nakat.pickup.permission-restricted |
| pickup | permission-limited | yes | screen.pickup.state.permission-limited.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-limited.recovery | fixture.nakat.pickup.permission-limited |
| scan | loading | yes | screen.scan.state.loading.body | complete-scan | complete-scan:mutate | screen.scan.state.loading.recovery | fixture.nakat.scan.loading |
| scan | populated/default | yes | screen.scan.state.populated-default.body | complete-scan | complete-scan:mutate | screen.scan.state.populated-default.recovery | fixture.nakat.scan.default |
| scan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scan | error | yes | screen.scan.state.error.body | complete-scan | complete-scan:mutate | screen.scan.state.error.recovery | fixture.nakat.scan.error |
| scan | offline | yes | screen.scan.state.offline.body | complete-scan | complete-scan:mutate | screen.scan.state.offline.recovery | fixture.nakat.scan.offline |
| scan | permission-needed | yes | screen.scan.state.permission-needed.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-needed.recovery | fixture.nakat.scan.permission-needed |
| scan | permission-denied | yes | screen.scan.state.permission-denied.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-denied.recovery | fixture.nakat.scan.permission-denied |
| scan | permission-restricted | yes | screen.scan.state.permission-restricted.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-restricted.recovery | fixture.nakat.scan.permission-restricted |
| scan | permission-limited | yes | screen.scan.state.permission-limited.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-limited.recovery | fixture.nakat.scan.permission-limited |
| drive | loading | yes | screen.drive.state.loading.body | open-note | open-note:navigate→note | screen.drive.state.loading.recovery | fixture.nakat.drive.loading |
| drive | populated/default | yes | screen.drive.state.populated-default.body | open-note | open-note:navigate→note | screen.drive.state.populated-default.recovery | fixture.nakat.drive.default |
| drive | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| drive | error | yes | screen.drive.state.error.body | open-note | open-note:navigate→note | screen.drive.state.error.recovery | fixture.nakat.drive.error |
| drive | offline | yes | screen.drive.state.offline.body | open-note | open-note:navigate→note | screen.drive.state.offline.recovery | fixture.nakat.drive.offline |
| drive | permission-needed | yes | screen.drive.state.permission-needed.body | open-note<br>permission.mic.fallback<br>permission.speech.fallback | open-note:navigate→note | screen.drive.state.permission-needed.recovery | fixture.nakat.drive.permission-needed |
| drive | permission-denied | yes | screen.drive.state.permission-denied.body | open-note<br>permission.mic.fallback<br>permission.speech.fallback | open-note:navigate→note | screen.drive.state.permission-denied.recovery | fixture.nakat.drive.permission-denied |
| drive | permission-restricted | yes | screen.drive.state.permission-restricted.body | open-note<br>permission.mic.fallback<br>permission.speech.fallback | open-note:navigate→note | screen.drive.state.permission-restricted.recovery | fixture.nakat.drive.permission-restricted |
| drive | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| note | loading | yes | screen.note.state.loading.body | complete-note | complete-note:mutate | screen.note.state.loading.recovery | fixture.nakat.note.loading |
| note | populated/default | yes | screen.note.state.populated-default.body | complete-note | complete-note:mutate | screen.note.state.populated-default.recovery | fixture.nakat.note.default |
| note | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| note | error | yes | screen.note.state.error.body | complete-note | complete-note:mutate | screen.note.state.error.recovery | fixture.nakat.note.error |
| note | offline | yes | screen.note.state.offline.body | complete-note | complete-note:mutate | screen.note.state.offline.recovery | fixture.nakat.note.offline |
| note | permission-needed | yes | screen.note.state.permission-needed.body | complete-note<br>permission.mic.fallback<br>permission.speech.fallback | complete-note:mutate | screen.note.state.permission-needed.recovery | fixture.nakat.note.permission-needed |
| note | permission-denied | yes | screen.note.state.permission-denied.body | complete-note<br>permission.mic.fallback<br>permission.speech.fallback | complete-note:mutate | screen.note.state.permission-denied.recovery | fixture.nakat.note.permission-denied |
| note | permission-restricted | yes | screen.note.state.permission-restricted.body | complete-note<br>permission.mic.fallback<br>permission.speech.fallback | complete-note:mutate | screen.note.state.permission-restricted.recovery | fixture.nakat.note.permission-restricted |
| note | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| reschedule | loading | yes | screen.reschedule.state.loading.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.loading.recovery | fixture.nakat.reschedule.loading |
| reschedule | populated/default | yes | screen.reschedule.state.populated-default.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.populated-default.recovery | fixture.nakat.reschedule.default |
| reschedule | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| reschedule | error | yes | screen.reschedule.state.error.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.error.recovery | fixture.nakat.reschedule.error |
| reschedule | offline | yes | screen.reschedule.state.offline.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.offline.recovery | fixture.nakat.reschedule.offline |
| reschedule | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| reschedule | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| reschedule | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| reschedule | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.loading.recovery | fixture.nakat.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.populated-default.recovery | fixture.nakat.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.error.recovery | fixture.nakat.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.offline.recovery | fixture.nakat.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-needed.recovery | fixture.nakat.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-denied.recovery | fixture.nakat.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-restricted.recovery | fixture.nakat.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lockscreen | loading | yes | screen.lockscreen.state.loading.body |  |  | screen.lockscreen.state.loading.recovery | fixture.nakat.lockscreen.loading |
| lockscreen | populated/default | yes | screen.lockscreen.state.populated-default.body |  |  | screen.lockscreen.state.populated-default.recovery | fixture.nakat.lockscreen.default |
| lockscreen | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lockscreen | error | yes | screen.lockscreen.state.error.body |  |  | screen.lockscreen.state.error.recovery | fixture.nakat.lockscreen.error |
| lockscreen | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| lockscreen | permission-needed | yes | screen.lockscreen.state.permission-needed.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-needed.recovery | fixture.nakat.lockscreen.permission-needed |
| lockscreen | permission-denied | yes | screen.lockscreen.state.permission-denied.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-denied.recovery | fixture.nakat.lockscreen.permission-denied |
| lockscreen | permission-restricted | yes | screen.lockscreen.state.permission-restricted.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-restricted.recovery | fixture.nakat.lockscreen.permission-restricted |
| lockscreen | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| notif | loading | yes | screen.notif.state.loading.body | complete-notif | complete-notif:mutate | screen.notif.state.loading.recovery | fixture.nakat.notif.loading |
| notif | populated/default | yes | screen.notif.state.populated-default.body | complete-notif | complete-notif:mutate | screen.notif.state.populated-default.recovery | fixture.nakat.notif.default |
| notif | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| notif | error | yes | screen.notif.state.error.body | complete-notif | complete-notif:mutate | screen.notif.state.error.recovery | fixture.nakat.notif.error |
| notif | offline | yes | screen.notif.state.offline.body | complete-notif | complete-notif:mutate | screen.notif.state.offline.recovery | fixture.nakat.notif.offline |
| notif | permission-needed | yes | screen.notif.state.permission-needed.body | complete-notif<br>permission.push.fallback | complete-notif:mutate | screen.notif.state.permission-needed.recovery | fixture.nakat.notif.permission-needed |
| notif | permission-denied | yes | screen.notif.state.permission-denied.body | complete-notif<br>permission.push.fallback | complete-notif:mutate | screen.notif.state.permission-denied.recovery | fixture.nakat.notif.permission-denied |
| notif | permission-restricted | yes | screen.notif.state.permission-restricted.body | complete-notif<br>permission.push.fallback | complete-notif:mutate | screen.notif.state.permission-restricted.recovery | fixture.nakat.notif.permission-restricted |
| notif | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| theory | loading | yes | screen.theory.state.loading.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.loading.recovery | fixture.nakat.theory.loading |
| theory | populated/default | yes | screen.theory.state.populated-default.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.populated-default.recovery | fixture.nakat.theory.default |
| theory | empty | yes | screen.theory.state.empty.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.empty.recovery | fixture.nakat.theory.empty |
| theory | error | yes | screen.theory.state.error.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.error.recovery | fixture.nakat.theory.error |
| theory | offline | yes | screen.theory.state.offline.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.offline.recovery | fixture.nakat.theory.offline |
| theory | permission-needed | yes | screen.theory.state.permission-needed.body | open-ticket<br>permission.bgtask.fallback | open-ticket:navigate→ticket | screen.theory.state.permission-needed.recovery | fixture.nakat.theory.permission-needed |
| theory | permission-denied | yes | screen.theory.state.permission-denied.body | open-ticket<br>permission.bgtask.fallback | open-ticket:navigate→ticket | screen.theory.state.permission-denied.recovery | fixture.nakat.theory.permission-denied |
| theory | permission-restricted | yes | screen.theory.state.permission-restricted.body | open-ticket<br>permission.bgtask.fallback | open-ticket:navigate→ticket | screen.theory.state.permission-restricted.recovery | fixture.nakat.theory.permission-restricted |
| theory | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ticket | loading | yes | screen.ticket.state.loading.body | open-player | open-player:navigate→player | screen.ticket.state.loading.recovery | fixture.nakat.ticket.loading |
| ticket | populated/default | yes | screen.ticket.state.populated-default.body | open-player | open-player:navigate→player | screen.ticket.state.populated-default.recovery | fixture.nakat.ticket.default |
| ticket | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ticket | error | yes | screen.ticket.state.error.body | open-player | open-player:navigate→player | screen.ticket.state.error.recovery | fixture.nakat.ticket.error |
| ticket | offline | yes | screen.ticket.state.offline.body | open-player | open-player:navigate→player | screen.ticket.state.offline.recovery | fixture.nakat.ticket.offline |
| ticket | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| ticket | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| ticket | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| ticket | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| player | loading | yes | screen.player.state.loading.body | open-background | open-background:navigate→background | screen.player.state.loading.recovery | fixture.nakat.player.loading |
| player | populated/default | yes | screen.player.state.populated-default.body | open-background | open-background:navigate→background | screen.player.state.populated-default.recovery | fixture.nakat.player.default |
| player | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| player | error | yes | screen.player.state.error.body | open-background | open-background:navigate→background | screen.player.state.error.recovery | fixture.nakat.player.error |
| player | offline | yes | screen.player.state.offline.body | open-background | open-background:navigate→background | screen.player.state.offline.recovery | fixture.nakat.player.offline |
| player | permission-needed | yes | screen.player.state.permission-needed.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.player.state.permission-needed.recovery | fixture.nakat.player.permission-needed |
| player | permission-denied | yes | screen.player.state.permission-denied.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.player.state.permission-denied.recovery | fixture.nakat.player.permission-denied |
| player | permission-restricted | yes | screen.player.state.permission-restricted.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.player.state.permission-restricted.recovery | fixture.nakat.player.permission-restricted |
| player | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body |  |  | screen.background.state.loading.recovery | fixture.nakat.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body |  |  | screen.background.state.populated-default.recovery | fixture.nakat.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body |  |  | screen.background.state.error.recovery | fixture.nakat.background.error |
| background | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| background | permission-needed | yes | screen.background.state.permission-needed.body | permission.audio.fallback |  | screen.background.state.permission-needed.recovery | fixture.nakat.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | permission.audio.fallback |  | screen.background.state.permission-denied.recovery | fixture.nakat.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | permission.audio.fallback |  | screen.background.state.permission-restricted.recovery | fixture.nakat.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| checklist | loading | yes | screen.checklist.state.loading.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.loading.recovery | fixture.nakat.checklist.loading |
| checklist | populated/default | yes | screen.checklist.state.populated-default.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.populated-default.recovery | fixture.nakat.checklist.default |
| checklist | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| checklist | error | yes | screen.checklist.state.error.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.error.recovery | fixture.nakat.checklist.error |
| checklist | offline | yes | screen.checklist.state.offline.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.offline.recovery | fixture.nakat.checklist.offline |
| checklist | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| checklist | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| checklist | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| checklist | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| classroom | loading | yes | screen.classroom.state.loading.body | open-attend | open-attend:navigate→attend | screen.classroom.state.loading.recovery | fixture.nakat.classroom.loading |
| classroom | populated/default | yes | screen.classroom.state.populated-default.body | open-attend | open-attend:navigate→attend | screen.classroom.state.populated-default.recovery | fixture.nakat.classroom.default |
| classroom | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| classroom | error | yes | screen.classroom.state.error.body | open-attend | open-attend:navigate→attend | screen.classroom.state.error.recovery | fixture.nakat.classroom.error |
| classroom | offline | yes | screen.classroom.state.offline.body | open-attend | open-attend:navigate→attend | screen.classroom.state.offline.recovery | fixture.nakat.classroom.offline |
| classroom | permission-needed | yes | screen.classroom.state.permission-needed.body | open-attend<br>permission.wifiinfo.fallback | open-attend:navigate→attend | screen.classroom.state.permission-needed.recovery | fixture.nakat.classroom.permission-needed |
| classroom | permission-denied | yes | screen.classroom.state.permission-denied.body | open-attend<br>permission.wifiinfo.fallback | open-attend:navigate→attend | screen.classroom.state.permission-denied.recovery | fixture.nakat.classroom.permission-denied |
| classroom | permission-restricted | yes | screen.classroom.state.permission-restricted.body | open-attend<br>permission.wifiinfo.fallback | open-attend:navigate→attend | screen.classroom.state.permission-restricted.recovery | fixture.nakat.classroom.permission-restricted |
| classroom | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| attend | loading | yes | screen.attend.state.loading.body | complete-attend | complete-attend:mutate | screen.attend.state.loading.recovery | fixture.nakat.attend.loading |
| attend | populated/default | yes | screen.attend.state.populated-default.body | complete-attend | complete-attend:mutate | screen.attend.state.populated-default.recovery | fixture.nakat.attend.default |
| attend | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| attend | error | yes | screen.attend.state.error.body | complete-attend | complete-attend:mutate | screen.attend.state.error.recovery | fixture.nakat.attend.error |
| attend | offline | yes | screen.attend.state.offline.body | complete-attend | complete-attend:mutate | screen.attend.state.offline.recovery | fixture.nakat.attend.offline |
| attend | permission-needed | yes | screen.attend.state.permission-needed.body | complete-attend<br>permission.wifiinfo.fallback | complete-attend:mutate | screen.attend.state.permission-needed.recovery | fixture.nakat.attend.permission-needed |
| attend | permission-denied | yes | screen.attend.state.permission-denied.body | complete-attend<br>permission.wifiinfo.fallback | complete-attend:mutate | screen.attend.state.permission-denied.recovery | fixture.nakat.attend.permission-denied |
| attend | permission-restricted | yes | screen.attend.state.permission-restricted.body | complete-attend<br>permission.wifiinfo.fallback | complete-attend:mutate | screen.attend.state.permission-restricted.recovery | fixture.nakat.attend.permission-restricted |
| attend | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| guestnet | loading | yes | screen.guestnet.state.loading.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.loading.recovery | fixture.nakat.guestnet.loading |
| guestnet | populated/default | yes | screen.guestnet.state.populated-default.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.populated-default.recovery | fixture.nakat.guestnet.default |
| guestnet | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| guestnet | error | yes | screen.guestnet.state.error.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.error.recovery | fixture.nakat.guestnet.error |
| guestnet | offline | yes | screen.guestnet.state.offline.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.offline.recovery | fixture.nakat.guestnet.offline |
| guestnet | permission-needed | yes | screen.guestnet.state.permission-needed.body | open-scanwifi<br>permission.hotspot.fallback | open-scanwifi:navigate→scanwifi | screen.guestnet.state.permission-needed.recovery | fixture.nakat.guestnet.permission-needed |
| guestnet | permission-denied | yes | screen.guestnet.state.permission-denied.body | open-scanwifi<br>permission.hotspot.fallback | open-scanwifi:navigate→scanwifi | screen.guestnet.state.permission-denied.recovery | fixture.nakat.guestnet.permission-denied |
| guestnet | permission-restricted | yes | screen.guestnet.state.permission-restricted.body | open-scanwifi<br>permission.hotspot.fallback | open-scanwifi:navigate→scanwifi | screen.guestnet.state.permission-restricted.recovery | fixture.nakat.guestnet.permission-restricted |
| guestnet | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| scanwifi | loading | yes | screen.scanwifi.state.loading.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.loading.recovery | fixture.nakat.scanwifi.loading |
| scanwifi | populated/default | yes | screen.scanwifi.state.populated-default.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.populated-default.recovery | fixture.nakat.scanwifi.default |
| scanwifi | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scanwifi | error | yes | screen.scanwifi.state.error.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.error.recovery | fixture.nakat.scanwifi.error |
| scanwifi | offline | yes | screen.scanwifi.state.offline.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.offline.recovery | fixture.nakat.scanwifi.offline |
| scanwifi | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scanwifi | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scanwifi | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scanwifi | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| menu | loading | yes | screen.menu.state.loading.body | open-notif | open-notif:navigate→notif | screen.menu.state.loading.recovery | fixture.nakat.menu.loading |
| menu | populated/default | yes | screen.menu.state.populated-default.body | open-notif | open-notif:navigate→notif | screen.menu.state.populated-default.recovery | fixture.nakat.menu.default |
| menu | empty | yes | screen.menu.state.empty.body | open-notif | open-notif:navigate→notif | screen.menu.state.empty.recovery | fixture.nakat.menu.empty |
| menu | error | yes | screen.menu.state.error.body | open-notif | open-notif:navigate→notif | screen.menu.state.error.recovery | fixture.nakat.menu.error |
| menu | offline | yes | screen.menu.state.offline.body | open-notif | open-notif:navigate→notif | screen.menu.state.offline.recovery | fixture.nakat.menu.offline |
| menu | permission-needed | yes | screen.menu.state.permission-needed.body | open-notif<br>permission.tracking.fallback<br>permission.appgroups.fallback | open-notif:navigate→notif | screen.menu.state.permission-needed.recovery | fixture.nakat.menu.permission-needed |
| menu | permission-denied | yes | screen.menu.state.permission-denied.body | open-notif<br>permission.tracking.fallback<br>permission.appgroups.fallback | open-notif:navigate→notif | screen.menu.state.permission-denied.recovery | fixture.nakat.menu.permission-denied |
| menu | permission-restricted | yes | screen.menu.state.permission-restricted.body | open-notif<br>permission.tracking.fallback<br>permission.appgroups.fallback | open-notif:navigate→notif | screen.menu.state.permission-restricted.recovery | fixture.nakat.menu.permission-restricted |
| menu | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| docs | loading | yes | screen.docs.state.loading.body | complete-docs | complete-docs:mutate | screen.docs.state.loading.recovery | fixture.nakat.docs.loading |
| docs | populated/default | yes | screen.docs.state.populated-default.body | complete-docs | complete-docs:mutate | screen.docs.state.populated-default.recovery | fixture.nakat.docs.default |
| docs | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| docs | error | yes | screen.docs.state.error.body | complete-docs | complete-docs:mutate | screen.docs.state.error.recovery | fixture.nakat.docs.error |
| docs | offline | yes | screen.docs.state.offline.body | complete-docs | complete-docs:mutate | screen.docs.state.offline.recovery | fixture.nakat.docs.offline |
| docs | permission-needed | yes | screen.docs.state.permission-needed.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-needed.recovery | fixture.nakat.docs.permission-needed |
| docs | permission-denied | yes | screen.docs.state.permission-denied.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-denied.recovery | fixture.nakat.docs.permission-denied |
| docs | permission-restricted | yes | screen.docs.state.permission-restricted.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-restricted.recovery | fixture.nakat.docs.permission-restricted |
| docs | permission-limited | yes | screen.docs.state.permission-limited.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-limited.recovery | fixture.nakat.docs.permission-limited |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.nakat.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.nakat.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.nakat.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.nakat.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.nakat.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.nakat.lock.permission-denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.nakat.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| passwords | loading | yes | screen.passwords.state.loading.body | open-fill | open-fill:navigate→fill | screen.passwords.state.loading.recovery | fixture.nakat.passwords.loading |
| passwords | populated/default | yes | screen.passwords.state.populated-default.body | open-fill | open-fill:navigate→fill | screen.passwords.state.populated-default.recovery | fixture.nakat.passwords.default |
| passwords | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| passwords | error | yes | screen.passwords.state.error.body | open-fill | open-fill:navigate→fill | screen.passwords.state.error.recovery | fixture.nakat.passwords.error |
| passwords | offline | yes | screen.passwords.state.offline.body | open-fill | open-fill:navigate→fill | screen.passwords.state.offline.recovery | fixture.nakat.passwords.offline |
| passwords | permission-needed | yes | screen.passwords.state.permission-needed.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-needed.recovery | fixture.nakat.passwords.permission-needed |
| passwords | permission-denied | yes | screen.passwords.state.permission-denied.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-denied.recovery | fixture.nakat.passwords.permission-denied |
| passwords | permission-restricted | yes | screen.passwords.state.permission-restricted.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-restricted.recovery | fixture.nakat.passwords.permission-restricted |
| passwords | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | yes | screen.fill.state.loading.body |  |  | screen.fill.state.loading.recovery | fixture.nakat.fill.loading |
| fill | populated/default | yes | screen.fill.state.populated-default.body |  |  | screen.fill.state.populated-default.recovery | fixture.nakat.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | yes | screen.fill.state.error.body |  |  | screen.fill.state.error.recovery | fixture.nakat.fill.error |
| fill | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | permission.autofill.fallback |  | screen.fill.state.permission-needed.recovery | fixture.nakat.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | permission.autofill.fallback |  | screen.fill.state.permission-denied.recovery | fixture.nakat.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | permission.autofill.fallback |  | screen.fill.state.permission-restricted.recovery | fixture.nakat.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | yes | screen.widget.state.loading.body |  |  | screen.widget.state.loading.recovery | fixture.nakat.widget.loading |
| widget | populated/default | yes | screen.widget.state.populated-default.body |  |  | screen.widget.state.populated-default.recovery | fixture.nakat.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | yes | screen.widget.state.error.body |  |  | screen.widget.state.error.recovery | fixture.nakat.widget.error |
| widget | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | permission.remotenotif.fallback<br>permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-needed.recovery | fixture.nakat.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | permission.remotenotif.fallback<br>permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-denied.recovery | fixture.nakat.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | permission.remotenotif.fallback<br>permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-restricted.recovery | fixture.nakat.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| bg | loading | yes | screen.bg.state.loading.body | complete-bg | complete-bg:mutate | screen.bg.state.loading.recovery | fixture.nakat.bg.loading |
| bg | populated/default | yes | screen.bg.state.populated-default.body | complete-bg | complete-bg:mutate | screen.bg.state.populated-default.recovery | fixture.nakat.bg.default |
| bg | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| bg | error | yes | screen.bg.state.error.body | complete-bg | complete-bg:mutate | screen.bg.state.error.recovery | fixture.nakat.bg.error |
| bg | offline | yes | screen.bg.state.offline.body | complete-bg | complete-bg:mutate | screen.bg.state.offline.recovery | fixture.nakat.bg.offline |
| bg | permission-needed | yes | screen.bg.state.permission-needed.body | complete-bg<br>permission.fetch.fallback<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | complete-bg:mutate | screen.bg.state.permission-needed.recovery | fixture.nakat.bg.permission-needed |
| bg | permission-denied | yes | screen.bg.state.permission-denied.body | complete-bg<br>permission.fetch.fallback<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | complete-bg:mutate | screen.bg.state.permission-denied.recovery | fixture.nakat.bg.permission-denied |
| bg | permission-restricted | yes | screen.bg.state.permission-restricted.body | complete-bg<br>permission.fetch.fallback<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | complete-bg:mutate | screen.bg.state.permission-restricted.recovery | fixture.nakat.bg.permission-restricted |
| bg | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.nakat.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.nakat.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.nakat.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.nakat.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.nakat.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.nakat.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.nakat.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |

## Design tokens and semantic component roles

**SwiftUI environment:** `NativeVisualLanguage`. SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.

| Token | Value |
|---|---|
| accent | #1e56a0 |
| background | #FFFFFF |
| groupedBackground | #F2F3F5 |
| fill | #E7E8EC |
| separator | #D7D8DC |
| textPrimary | #000000 |
| textSecondary | #818C99 |
| badge | #FF3347 |

| Surface | Semantic component roles |
|---|---|
| phone | auth-form<br>primary-action |
| code | auth-form<br>primary-action |
| codefail | auth-form<br>primary-action |
| lessons | collection<br>filters |
| lesson | summary<br>content<br>next-action |
| call | chat<br>message-list<br>composer |
| pickup | summary<br>content<br>next-action |
| scan | task-intro<br>form<br>primary-action |
| drive | summary<br>content<br>next-action |
| note | task-intro<br>form<br>primary-action |
| reschedule | task-intro<br>form<br>primary-action |
| chat | chat<br>message-list<br>composer |
| lockscreen | summary<br>content<br>next-action |
| notif | summary<br>content<br>next-action |
| theory | collection<br>filters |
| ticket | summary<br>content<br>next-action |
| player | summary<br>content<br>next-action |
| background | summary<br>content<br>next-action |
| checklist | summary<br>content<br>next-action |
| classroom | summary<br>content<br>next-action |
| attend | summary<br>content<br>next-action |
| guestnet | summary<br>content<br>next-action |
| scanwifi | task-intro<br>form<br>primary-action |
| menu | collection<br>filters |
| docs | summary<br>content<br>next-action |
| lock | summary<br>content<br>next-action |
| passwords | summary<br>content<br>next-action |
| fill | summary<br>content<br>next-action |
| widget | summary<br>content<br>next-action |
| bg | summary<br>content<br>next-action |
| ads | summary<br>content<br>next-action |

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
| scenario.all.happy.name | Весь продукт: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons<br>lesson<br>call<br>pickup<br>scan | acceptance |
| scenario.all.offline.name | Весь продукт: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons<br>lesson<br>call<br>pickup<br>scan | acceptance |
| scenario.all.persistence.name | Весь продукт: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons<br>lesson<br>call<br>pickup<br>scan | acceptance |
| scenario.drive.failure.name | Утреннее занятие: ошибка и восстановление | none | Acceptance scenario name | lessons<br>lesson<br>call<br>pickup<br>scan<br>drive<br>note<br>chat | acceptance |
| scenario.drive.happy.name | Утреннее занятие: основной путь | none | Acceptance scenario name | lessons<br>lesson<br>call<br>pickup<br>scan<br>drive<br>note<br>chat | acceptance |
| scenario.drive.offline.name | Утреннее занятие: без сети | none | Acceptance scenario name | lessons<br>lesson<br>call<br>pickup<br>scan<br>drive<br>note<br>chat | acceptance |
| scenario.drive.persistence.name | Утреннее занятие: возврат после перезапуска | none | Acceptance scenario name | lessons<br>lesson<br>call<br>pickup<br>scan<br>drive<br>note<br>chat | acceptance |
| scenario.permission.appgroups.denied.name | Виджет «Следующее занятие · 34 из 56 часов» и расширение автозаполнения видят данные приложения: отказ и запасной путь | none | Acceptance scenario name | menu<br>widget | acceptance |
| scenario.permission.audio.denied.name | Разбор билета и вчерашней поездки в наушниках с погашенным экраном: отказ и запасной путь | none | Acceptance scenario name | player<br>background | acceptance |
| scenario.permission.autofill.denied.name | Логины тренажёра билетов и кабинета группы подставляются в Safari без копирования: отказ и запасной путь | none | Acceptance scenario name | passwords<br>fill | acceptance |
| scenario.permission.bgtask.denied.name | Два идентификатора: обновление расписания и догрузка аудио-разборов: отказ и запасной путь | none | Acceptance scenario name | bg<br>theory | acceptance |
| scenario.permission.calendar.denied.name | Занятие в системном календаре, при переносе правится то же событие: отказ и запасной путь | none | Acceptance scenario name | lesson | acceptance |
| scenario.permission.camera.denied.name | QR на стекле машины отмечает начало занятия, QR со стены даёт параметры сети класса: отказ и запасной путь | none | Acceptance scenario name | lesson<br>scan | acceptance |
| scenario.permission.commnotif.denied.name | Сообщение инструктора приходит с аватаром и проходит через режим «За рулём»: отказ и запасной путь | none | Acceptance scenario name | chat<br>lockscreen | acceptance |
| scenario.permission.faceid.denied.name | Замок на приложении: документы ученика и номер договора: отказ и запасной путь | none | Acceptance scenario name | lock | acceptance |
| scenario.permission.fetch.denied.name | Перенос занятия и свободные окна готовы к первому открытию: отказ и запасной путь | none | Acceptance scenario name | bg<br>lessons | acceptance |
| scenario.permission.hotspot.denied.name | Подключение к сети класса по QR со стены — без него отметка не проходит: отказ и запасной путь | none | Acceptance scenario name | guestnet | acceptance |
| scenario.permission.keychain.denied.name | Одна сессия: из виджета приложение открывается уже войденным: отказ и запасной путь | none | Acceptance scenario name | widget<br>lessons | acceptance |
| scenario.permission.location.denied.name | Точка посадки с расстоянием и экзаменационные маршруты рядом: отказ и запасной путь | none | Acceptance scenario name | lesson<br>pickup | acceptance |
| scenario.permission.mic.denied.name | Голосовая заметка об ошибке сразу после занятия, руки только что были на руле: отказ и запасной путь | none | Acceptance scenario name | drive<br>note | acceptance |
| scenario.permission.photos.denied.name | Медсправка и договор из медиатеки в раздел документов: отказ и запасной путь | none | Acceptance scenario name | docs | acceptance |
| scenario.permission.push.denied.name | Перенос занятия и освободившийся слот приходят уведомлением: отказ и запасной путь | none | Acceptance scenario name | notif | acceptance |
| scenario.permission.remotenotif.denied.name | Тихий пуш обновляет виджет и счётчик часов при закрытом приложении: отказ и запасной путь | none | Acceptance scenario name | bg<br>widget | acceptance |
| scenario.permission.speech.denied.name | Расшифровка заметки и сверка проговоренного алгоритма перекрёстка с чек-листом: отказ и запасной путь | none | Acceptance scenario name | drive<br>note | acceptance |
| scenario.permission.tracking.denied.name | Реклама автосервисов и страховых вместо платной подписки: отказ и запасной путь | none | Acceptance scenario name | ads<br>menu | acceptance |
| scenario.permission.voip.denied.name | Звонок инструктору по учебной группе, а не на номер: телефоны сторон не видны: отказ и запасной путь | none | Acceptance scenario name | lesson<br>call | acceptance |
| scenario.permission.wifiinfo.denied.name | Присутствие на теории подтверждается сетью класса — часы идут в ведомость: отказ и запасной путь | none | Acceptance scenario name | attend<br>classroom | acceptance |
| scenario.signin.failure.name | Вход по номеру: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons | acceptance |
| scenario.signin.happy.name | Вход по номеру: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons | acceptance |
| scenario.signin.offline.name | Вход по номеру: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons | acceptance |
| scenario.signin.persistence.name | Вход по номеру: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>lessons | acceptance |
| screen.ads.action.complete-ads.label | Продолжить: Почему реклама | none | Action label | ads | control |
| screen.ads.purpose | Экран-объяснение до ATT | none | Product task | ads | accessibility-and-docs |
| screen.ads.state.error.body | Не удалось обновить «Почему реклама». Введённые данные сохранены; повторите попытку. | none | State copy: error | ads | state-body |
| screen.ads.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ads | recovery |
| screen.ads.state.loading.body | Обновляем данные раздела «Почему реклама»; текущий контекст остаётся доступен. | none | State copy: loading | ads | state-body |
| screen.ads.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | ads | recovery |
| screen.ads.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | ads | state-body |
| screen.ads.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | ads | recovery |
| screen.ads.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | ads | state-body |
| screen.ads.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | ads | recovery |
| screen.ads.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | ads | state-body |
| screen.ads.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | ads | recovery |
| screen.ads.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | ads | state-body |
| screen.ads.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | ads | recovery |
| screen.ads.state.populated-default.body | Актуальные данные раздела «Почему реклама» готовы к следующему действию. | none | State copy: populated/default | ads | state-body |
| screen.ads.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | ads | recovery |
| screen.ads.title | Почему реклама | none | Surface title | ads | navigation-title |
| screen.attend.action.complete-attend.label | Продолжить: Отметка по сети | none | Action label | attend | control |
| screen.attend.purpose | SSID против профиля группы | none | Product task | attend | accessibility-and-docs |
| screen.attend.state.error.body | Не удалось обновить «Отметка по сети». Введённые данные сохранены; повторите попытку. | none | State copy: error | attend | state-body |
| screen.attend.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | attend | recovery |
| screen.attend.state.loading.body | Обновляем данные раздела «Отметка по сети»; текущий контекст остаётся доступен. | none | State copy: loading | attend | state-body |
| screen.attend.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | attend | recovery |
| screen.attend.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | attend | state-body |
| screen.attend.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | attend | recovery |
| screen.attend.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | attend | state-body |
| screen.attend.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | attend | recovery |
| screen.attend.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | attend | state-body |
| screen.attend.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | attend | recovery |
| screen.attend.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | attend | state-body |
| screen.attend.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | attend | recovery |
| screen.attend.state.populated-default.body | Актуальные данные раздела «Отметка по сети» готовы к следующему действию. | none | State copy: populated/default | attend | state-body |
| screen.attend.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | attend | recovery |
| screen.attend.title | Отметка по сети | none | Surface title | attend | navigation-title |
| screen.background.purpose | Now Playing на локскрине | none | Product task | background | accessibility-and-docs |
| screen.background.state.error.body | Не удалось обновить «Экран погас». Введённые данные сохранены; повторите попытку. | none | State copy: error | background | state-body |
| screen.background.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | background | recovery |
| screen.background.state.loading.body | Обновляем данные раздела «Экран погас»; текущий контекст остаётся доступен. | none | State copy: loading | background | state-body |
| screen.background.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | background | recovery |
| screen.background.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | background | state-body |
| screen.background.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | background | recovery |
| screen.background.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | background | state-body |
| screen.background.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | background | recovery |
| screen.background.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | background | state-body |
| screen.background.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | background | recovery |
| screen.background.state.populated-default.body | Актуальные данные раздела «Экран погас» готовы к следующему действию. | none | State copy: populated/default | background | state-body |
| screen.background.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | background | recovery |
| screen.background.title | Экран погас | none | Surface title | background | navigation-title |
| screen.bg.action.complete-bg.label | Продолжить: Фоновые обновления | none | Action label | bg | control |
| screen.bg.purpose | Fetch, тихий пуш, идентификаторы задач | none | Product task | bg | accessibility-and-docs |
| screen.bg.state.error.body | Не удалось обновить «Фоновые обновления». Введённые данные сохранены; повторите попытку. | none | State copy: error | bg | state-body |
| screen.bg.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | bg | recovery |
| screen.bg.state.loading.body | Обновляем данные раздела «Фоновые обновления»; текущий контекст остаётся доступен. | none | State copy: loading | bg | state-body |
| screen.bg.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | bg | recovery |
| screen.bg.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | bg | state-body |
| screen.bg.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | bg | recovery |
| screen.bg.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | bg | state-body |
| screen.bg.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | bg | recovery |
| screen.bg.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | bg | state-body |
| screen.bg.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | bg | recovery |
| screen.bg.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | bg | state-body |
| screen.bg.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | bg | recovery |
| screen.bg.state.populated-default.body | Актуальные данные раздела «Фоновые обновления» готовы к следующему действию. | none | State copy: populated/default | bg | state-body |
| screen.bg.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | bg | recovery |
| screen.bg.title | Фоновые обновления | none | Surface title | bg | navigation-title |
| screen.call.action.complete-call.label | Продолжить: Звонок инструктору | none | Action label | call | control |
| screen.call.purpose | CallKit · номера скрыты | none | Product task | call | accessibility-and-docs |
| screen.call.state.error.body | Не удалось обновить «Звонок инструктору». Введённые данные сохранены; повторите попытку. | none | State copy: error | call | state-body |
| screen.call.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | call | recovery |
| screen.call.state.loading.body | Обновляем данные раздела «Звонок инструктору»; текущий контекст остаётся доступен. | none | State copy: loading | call | state-body |
| screen.call.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | call | recovery |
| screen.call.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | call | state-body |
| screen.call.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | call | recovery |
| screen.call.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | call | state-body |
| screen.call.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | call | recovery |
| screen.call.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | call | state-body |
| screen.call.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | call | recovery |
| screen.call.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | call | state-body |
| screen.call.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | call | recovery |
| screen.call.state.populated-default.body | Актуальные данные раздела «Звонок инструктору» готовы к следующему действию. | none | State copy: populated/default | call | state-body |
| screen.call.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | call | recovery |
| screen.call.title | Звонок инструктору | none | Surface title | call | navigation-title |
| screen.chat.action.open-lockscreen.label | Открыть lockscreen | none | Action label | chat | control |
| screen.chat.purpose | Переписка по занятию | none | Product task | chat | accessibility-and-docs |
| screen.chat.state.error.body | Не удалось обновить «Инструктор». Введённые данные сохранены; повторите попытку. | none | State copy: error | chat | state-body |
| screen.chat.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chat | recovery |
| screen.chat.state.loading.body | Обновляем данные раздела «Инструктор»; текущий контекст остаётся доступен. | none | State copy: loading | chat | state-body |
| screen.chat.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chat | recovery |
| screen.chat.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | chat | state-body |
| screen.chat.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chat | recovery |
| screen.chat.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chat | state-body |
| screen.chat.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chat | recovery |
| screen.chat.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chat | state-body |
| screen.chat.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chat | recovery |
| screen.chat.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chat | state-body |
| screen.chat.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chat | recovery |
| screen.chat.state.populated-default.body | Актуальные данные раздела «Инструктор» готовы к следующему действию. | none | State copy: populated/default | chat | state-body |
| screen.chat.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chat | recovery |
| screen.chat.title | Инструктор | none | Surface title | chat | navigation-title |
| screen.checklist.action.complete-checklist.label | Продолжить: Алгоритм вслух | none | Action label | checklist | control |
| screen.checklist.purpose | Проговаривание · сверка с чек-листом | none | Product task | checklist | accessibility-and-docs |
| screen.checklist.state.error.body | Не удалось обновить «Алгоритм вслух». Введённые данные сохранены; повторите попытку. | none | State copy: error | checklist | state-body |
| screen.checklist.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | checklist | recovery |
| screen.checklist.state.loading.body | Обновляем данные раздела «Алгоритм вслух»; текущий контекст остаётся доступен. | none | State copy: loading | checklist | state-body |
| screen.checklist.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | checklist | recovery |
| screen.checklist.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | checklist | state-body |
| screen.checklist.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | checklist | recovery |
| screen.checklist.state.populated-default.body | Актуальные данные раздела «Алгоритм вслух» готовы к следующему действию. | none | State copy: populated/default | checklist | state-body |
| screen.checklist.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | checklist | recovery |
| screen.checklist.title | Алгоритм вслух | none | Surface title | checklist | navigation-title |
| screen.classroom.action.open-attend.label | Открыть attend | none | Action label | classroom | control |
| screen.classroom.purpose | Ведомость часов · отметка присутствия | none | Product task | classroom | accessibility-and-docs |
| screen.classroom.state.error.body | Не удалось обновить «Теория в классе». Введённые данные сохранены; повторите попытку. | none | State copy: error | classroom | state-body |
| screen.classroom.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | classroom | recovery |
| screen.classroom.state.loading.body | Обновляем данные раздела «Теория в классе»; текущий контекст остаётся доступен. | none | State copy: loading | classroom | state-body |
| screen.classroom.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | classroom | recovery |
| screen.classroom.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | classroom | state-body |
| screen.classroom.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | classroom | recovery |
| screen.classroom.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | classroom | state-body |
| screen.classroom.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | classroom | recovery |
| screen.classroom.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | classroom | state-body |
| screen.classroom.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | classroom | recovery |
| screen.classroom.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | classroom | state-body |
| screen.classroom.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | classroom | recovery |
| screen.classroom.state.populated-default.body | Актуальные данные раздела «Теория в классе» готовы к следующему действию. | none | State copy: populated/default | classroom | state-body |
| screen.classroom.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | classroom | recovery |
| screen.classroom.title | Теория в классе | none | Surface title | classroom | navigation-title |
| screen.code.action.open-codefail.label | Открыть codefail | none | Action label | code | control |
| screen.code.purpose | OTP · автоподстановка | none | Product task | code | accessibility-and-docs |
| screen.code.state.error.body | Не удалось обновить «Код из письма». Введённые данные сохранены; повторите попытку. | none | State copy: error | code | state-body |
| screen.code.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | code | recovery |
| screen.code.state.loading.body | Обновляем данные раздела «Код из письма»; текущий контекст остаётся доступен. | none | State copy: loading | code | state-body |
| screen.code.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | code | recovery |
| screen.code.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | code | state-body |
| screen.code.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | code | recovery |
| screen.code.state.populated-default.body | Актуальные данные раздела «Код из письма» готовы к следующему действию. | none | State copy: populated/default | code | state-body |
| screen.code.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | code | recovery |
| screen.code.title | Код из письма | none | Surface title | code | navigation-title |
| screen.codefail.action.complete-codefail.label | Продолжить: Неверный код | none | Action label | codefail | control |
| screen.codefail.purpose | Состояние ошибки OTP | none | Product task | codefail | accessibility-and-docs |
| screen.codefail.state.error.body | Не удалось обновить «Неверный код». Введённые данные сохранены; повторите попытку. | none | State copy: error | codefail | state-body |
| screen.codefail.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | codefail | recovery |
| screen.codefail.state.loading.body | Обновляем данные раздела «Неверный код»; текущий контекст остаётся доступен. | none | State copy: loading | codefail | state-body |
| screen.codefail.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | codefail | recovery |
| screen.codefail.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | codefail | state-body |
| screen.codefail.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | codefail | recovery |
| screen.codefail.state.populated-default.body | Актуальные данные раздела «Неверный код» готовы к следующему действию. | none | State copy: populated/default | codefail | state-body |
| screen.codefail.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | codefail | recovery |
| screen.codefail.title | Неверный код | none | Surface title | codefail | navigation-title |
| screen.docs.action.complete-docs.label | Продолжить: Документы | none | Action label | docs | control |
| screen.docs.purpose | Медсправка, договор, съёмка и медиатека | none | Product task | docs | accessibility-and-docs |
| screen.docs.state.error.body | Не удалось обновить «Документы». Введённые данные сохранены; повторите попытку. | none | State copy: error | docs | state-body |
| screen.docs.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | docs | recovery |
| screen.docs.state.loading.body | Обновляем данные раздела «Документы»; текущий контекст остаётся доступен. | none | State copy: loading | docs | state-body |
| screen.docs.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | docs | recovery |
| screen.docs.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | docs | state-body |
| screen.docs.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | docs | recovery |
| screen.docs.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | docs | state-body |
| screen.docs.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | docs | recovery |
| screen.docs.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | docs | state-body |
| screen.docs.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | docs | recovery |
| screen.docs.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | docs | state-body |
| screen.docs.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | docs | recovery |
| screen.docs.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | docs | state-body |
| screen.docs.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | docs | recovery |
| screen.docs.state.populated-default.body | Актуальные данные раздела «Документы» готовы к следующему действию. | none | State copy: populated/default | docs | state-body |
| screen.docs.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | docs | recovery |
| screen.docs.title | Документы | none | Surface title | docs | navigation-title |
| screen.drive.action.open-note.label | Открыть note | none | Action label | drive | control |
| screen.drive.purpose | Часы, отметки, разбор голосом | none | Product task | drive | accessibility-and-docs |
| screen.drive.state.error.body | Не удалось обновить «Занятие идёт». Введённые данные сохранены; повторите попытку. | none | State copy: error | drive | state-body |
| screen.drive.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | drive | recovery |
| screen.drive.state.loading.body | Обновляем данные раздела «Занятие идёт»; текущий контекст остаётся доступен. | none | State copy: loading | drive | state-body |
| screen.drive.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | drive | recovery |
| screen.drive.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | drive | state-body |
| screen.drive.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | drive | recovery |
| screen.drive.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | drive | state-body |
| screen.drive.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | drive | recovery |
| screen.drive.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | drive | state-body |
| screen.drive.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | drive | recovery |
| screen.drive.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | drive | state-body |
| screen.drive.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | drive | recovery |
| screen.drive.state.populated-default.body | Актуальные данные раздела «Занятие идёт» готовы к следующему действию. | none | State copy: populated/default | drive | state-body |
| screen.drive.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | drive | recovery |
| screen.drive.title | Занятие идёт | none | Surface title | drive | navigation-title |
| screen.fill.purpose | Подстановка логина на сайт тренажёра | none | Product task | fill | accessibility-and-docs |
| screen.fill.state.error.body | Не удалось обновить «Автозаполнение в Safari». Введённые данные сохранены; повторите попытку. | none | State copy: error | fill | state-body |
| screen.fill.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | fill | recovery |
| screen.fill.state.loading.body | Обновляем данные раздела «Автозаполнение в Safari»; текущий контекст остаётся доступен. | none | State copy: loading | fill | state-body |
| screen.fill.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | fill | recovery |
| screen.fill.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | fill | state-body |
| screen.fill.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | fill | recovery |
| screen.fill.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | fill | state-body |
| screen.fill.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | fill | recovery |
| screen.fill.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | fill | state-body |
| screen.fill.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | fill | recovery |
| screen.fill.state.populated-default.body | Актуальные данные раздела «Автозаполнение в Safari» готовы к следующему действию. | none | State copy: populated/default | fill | state-body |
| screen.fill.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | fill | recovery |
| screen.fill.title | Автозаполнение в Safari | none | Surface title | fill | navigation-title |
| screen.guestnet.action.open-scanwifi.label | Открыть scanwifi | none | Action label | guestnet | control |
| screen.guestnet.purpose | QR со стены · подключение | none | Product task | guestnet | accessibility-and-docs |
| screen.guestnet.state.error.body | Не удалось обновить «Сеть класса». Введённые данные сохранены; повторите попытку. | none | State copy: error | guestnet | state-body |
| screen.guestnet.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | guestnet | recovery |
| screen.guestnet.state.loading.body | Обновляем данные раздела «Сеть класса»; текущий контекст остаётся доступен. | none | State copy: loading | guestnet | state-body |
| screen.guestnet.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | guestnet | recovery |
| screen.guestnet.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | guestnet | state-body |
| screen.guestnet.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | guestnet | recovery |
| screen.guestnet.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | guestnet | state-body |
| screen.guestnet.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | guestnet | recovery |
| screen.guestnet.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | guestnet | state-body |
| screen.guestnet.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | guestnet | recovery |
| screen.guestnet.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | guestnet | state-body |
| screen.guestnet.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | guestnet | recovery |
| screen.guestnet.state.populated-default.body | Актуальные данные раздела «Сеть класса» готовы к следующему действию. | none | State copy: populated/default | guestnet | state-body |
| screen.guestnet.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | guestnet | recovery |
| screen.guestnet.title | Сеть класса | none | Surface title | guestnet | navigation-title |
| screen.lesson.action.open-call.label | Открыть call | none | Action label | lesson | control |
| screen.lesson.purpose | Инструктор, машина, точка посадки | none | Product task | lesson | accessibility-and-docs |
| screen.lesson.state.error.body | Не удалось обновить «Занятие». Введённые данные сохранены; повторите попытку. | none | State copy: error | lesson | state-body |
| screen.lesson.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lesson | recovery |
| screen.lesson.state.loading.body | Обновляем данные раздела «Занятие»; текущий контекст остаётся доступен. | none | State copy: loading | lesson | state-body |
| screen.lesson.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lesson | recovery |
| screen.lesson.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | lesson | state-body |
| screen.lesson.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lesson | recovery |
| screen.lesson.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lesson | state-body |
| screen.lesson.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lesson | recovery |
| screen.lesson.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | lesson | state-body |
| screen.lesson.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | lesson | recovery |
| screen.lesson.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lesson | state-body |
| screen.lesson.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lesson | recovery |
| screen.lesson.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lesson | state-body |
| screen.lesson.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lesson | recovery |
| screen.lesson.state.populated-default.body | Актуальные данные раздела «Занятие» готовы к следующему действию. | none | State copy: populated/default | lesson | state-body |
| screen.lesson.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lesson | recovery |
| screen.lesson.title | Занятие | none | Surface title | lesson | navigation-title |
| screen.lessons.action.open-lesson.label | Открыть lesson | none | Action label | lessons | control |
| screen.lessons.purpose | Следующее занятие · часы · свободные слоты | none | Product task | lessons | accessibility-and-docs |
| screen.lessons.state.empty.body | В разделе «Занятия» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | lessons | state-body |
| screen.lessons.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | lessons | recovery |
| screen.lessons.state.error.body | Не удалось обновить «Занятия». Введённые данные сохранены; повторите попытку. | none | State copy: error | lessons | state-body |
| screen.lessons.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lessons | recovery |
| screen.lessons.state.loading.body | Обновляем данные раздела «Занятия»; текущий контекст остаётся доступен. | none | State copy: loading | lessons | state-body |
| screen.lessons.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lessons | recovery |
| screen.lessons.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | lessons | state-body |
| screen.lessons.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lessons | recovery |
| screen.lessons.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lessons | state-body |
| screen.lessons.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lessons | recovery |
| screen.lessons.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lessons | state-body |
| screen.lessons.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lessons | recovery |
| screen.lessons.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lessons | state-body |
| screen.lessons.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lessons | recovery |
| screen.lessons.state.populated-default.body | Актуальные данные раздела «Занятия» готовы к следующему действию. | none | State copy: populated/default | lessons | state-body |
| screen.lessons.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lessons | recovery |
| screen.lessons.title | Занятия | none | Surface title | lessons | navigation-title |
| screen.lock.action.complete-lock.label | Продолжить: Замок приложения | none | Action label | lock | control |
| screen.lock.purpose | Face ID · код-пароль | none | Product task | lock | accessibility-and-docs |
| screen.lock.state.error.body | Не удалось обновить «Замок приложения». Введённые данные сохранены; повторите попытку. | none | State copy: error | lock | state-body |
| screen.lock.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lock | recovery |
| screen.lock.state.loading.body | Обновляем данные раздела «Замок приложения»; текущий контекст остаётся доступен. | none | State copy: loading | lock | state-body |
| screen.lock.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lock | recovery |
| screen.lock.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | lock | state-body |
| screen.lock.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lock | recovery |
| screen.lock.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lock | state-body |
| screen.lock.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lock | recovery |
| screen.lock.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lock | state-body |
| screen.lock.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lock | recovery |
| screen.lock.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lock | state-body |
| screen.lock.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lock | recovery |
| screen.lock.state.populated-default.body | Актуальные данные раздела «Замок приложения» готовы к следующему действию. | none | State copy: populated/default | lock | state-body |
| screen.lock.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lock | recovery |
| screen.lock.title | Замок приложения | none | Surface title | lock | navigation-title |
| screen.lockscreen.purpose | Сообщение с аватаром · режим «За рулём» | none | Product task | lockscreen | accessibility-and-docs |
| screen.lockscreen.state.error.body | Не удалось обновить «Экран блокировки». Введённые данные сохранены; повторите попытку. | none | State copy: error | lockscreen | state-body |
| screen.lockscreen.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lockscreen | recovery |
| screen.lockscreen.state.loading.body | Обновляем данные раздела «Экран блокировки»; текущий контекст остаётся доступен. | none | State copy: loading | lockscreen | state-body |
| screen.lockscreen.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lockscreen | recovery |
| screen.lockscreen.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lockscreen | state-body |
| screen.lockscreen.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lockscreen | recovery |
| screen.lockscreen.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lockscreen | state-body |
| screen.lockscreen.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lockscreen | recovery |
| screen.lockscreen.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lockscreen | state-body |
| screen.lockscreen.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lockscreen | recovery |
| screen.lockscreen.state.populated-default.body | Актуальные данные раздела «Экран блокировки» готовы к следующему действию. | none | State copy: populated/default | lockscreen | state-body |
| screen.lockscreen.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lockscreen | recovery |
| screen.lockscreen.title | Экран блокировки | none | Surface title | lockscreen | navigation-title |
| screen.menu.action.open-notif.label | Открыть notif | none | Action label | menu | control |
| screen.menu.purpose | Документы, доступы, виджет, фон | none | Product task | menu | accessibility-and-docs |
| screen.menu.state.empty.body | В разделе «Ещё» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | menu | state-body |
| screen.menu.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | menu | recovery |
| screen.menu.state.error.body | Не удалось обновить «Ещё». Введённые данные сохранены; повторите попытку. | none | State copy: error | menu | state-body |
| screen.menu.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | menu | recovery |
| screen.menu.state.loading.body | Обновляем данные раздела «Ещё»; текущий контекст остаётся доступен. | none | State copy: loading | menu | state-body |
| screen.menu.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | menu | recovery |
| screen.menu.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | menu | state-body |
| screen.menu.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | menu | recovery |
| screen.menu.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | menu | state-body |
| screen.menu.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | menu | recovery |
| screen.menu.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | menu | state-body |
| screen.menu.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | menu | recovery |
| screen.menu.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | menu | state-body |
| screen.menu.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | menu | recovery |
| screen.menu.state.populated-default.body | Актуальные данные раздела «Ещё» готовы к следующему действию. | none | State copy: populated/default | menu | state-body |
| screen.menu.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | menu | recovery |
| screen.menu.title | Ещё | none | Surface title | menu | navigation-title |
| screen.note.action.complete-note.label | Продолжить: Разбор голосом | none | Action label | note | control |
| screen.note.purpose | Запись · расшифровка · привязка к месту | none | Product task | note | accessibility-and-docs |
| screen.note.state.error.body | Не удалось обновить «Разбор голосом». Введённые данные сохранены; повторите попытку. | none | State copy: error | note | state-body |
| screen.note.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | note | recovery |
| screen.note.state.loading.body | Обновляем данные раздела «Разбор голосом»; текущий контекст остаётся доступен. | none | State copy: loading | note | state-body |
| screen.note.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | note | recovery |
| screen.note.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | note | state-body |
| screen.note.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | note | recovery |
| screen.note.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | note | state-body |
| screen.note.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | note | recovery |
| screen.note.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | note | state-body |
| screen.note.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | note | recovery |
| screen.note.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | note | state-body |
| screen.note.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | note | recovery |
| screen.note.state.populated-default.body | Актуальные данные раздела «Разбор голосом» готовы к следующему действию. | none | State copy: populated/default | note | state-body |
| screen.note.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | note | recovery |
| screen.note.title | Разбор голосом | none | Surface title | note | navigation-title |
| screen.notif.action.complete-notif.label | Продолжить: Уведомления | none | Action label | notif | control |
| screen.notif.purpose | Что приходит и когда | none | Product task | notif | accessibility-and-docs |
| screen.notif.state.error.body | Не удалось обновить «Уведомления». Введённые данные сохранены; повторите попытку. | none | State copy: error | notif | state-body |
| screen.notif.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | notif | recovery |
| screen.notif.state.loading.body | Обновляем данные раздела «Уведомления»; текущий контекст остаётся доступен. | none | State copy: loading | notif | state-body |
| screen.notif.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | notif | recovery |
| screen.notif.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | notif | state-body |
| screen.notif.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | notif | recovery |
| screen.notif.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | notif | state-body |
| screen.notif.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | notif | recovery |
| screen.notif.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | notif | state-body |
| screen.notif.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | notif | recovery |
| screen.notif.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | notif | state-body |
| screen.notif.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | notif | recovery |
| screen.notif.state.populated-default.body | Актуальные данные раздела «Уведомления» готовы к следующему действию. | none | State copy: populated/default | notif | state-body |
| screen.notif.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | notif | recovery |
| screen.notif.title | Уведомления | none | Surface title | notif | navigation-title |
| screen.passwords.action.open-fill.label | Открыть fill | none | Action label | passwords | control |
| screen.passwords.purpose | Записи автошколы · автозаполнение | none | Product task | passwords | accessibility-and-docs |
| screen.passwords.state.error.body | Не удалось обновить «Пароли группы». Введённые данные сохранены; повторите попытку. | none | State copy: error | passwords | state-body |
| screen.passwords.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | passwords | recovery |
| screen.passwords.state.loading.body | Обновляем данные раздела «Пароли группы»; текущий контекст остаётся доступен. | none | State copy: loading | passwords | state-body |
| screen.passwords.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | passwords | recovery |
| screen.passwords.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | passwords | state-body |
| screen.passwords.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | passwords | recovery |
| screen.passwords.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | passwords | state-body |
| screen.passwords.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | passwords | recovery |
| screen.passwords.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | passwords | state-body |
| screen.passwords.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | passwords | recovery |
| screen.passwords.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | passwords | state-body |
| screen.passwords.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | passwords | recovery |
| screen.passwords.state.populated-default.body | Актуальные данные раздела «Пароли группы» готовы к следующему действию. | none | State copy: populated/default | passwords | state-body |
| screen.passwords.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | passwords | recovery |
| screen.passwords.title | Пароли группы | none | Surface title | passwords | navigation-title |
| screen.phone.action.open-code.label | Открыть code | none | Action label | phone | control |
| screen.phone.purpose | Первый экран приложения | none | Product task | phone | accessibility-and-docs |
| screen.phone.state.error.body | Не удалось обновить «Вход по почте». Введённые данные сохранены; повторите попытку. | none | State copy: error | phone | state-body |
| screen.phone.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | phone | recovery |
| screen.phone.state.loading.body | Обновляем данные раздела «Вход по почте»; текущий контекст остаётся доступен. | none | State copy: loading | phone | state-body |
| screen.phone.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | phone | recovery |
| screen.phone.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | phone | state-body |
| screen.phone.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | phone | recovery |
| screen.phone.state.populated-default.body | Актуальные данные раздела «Вход по почте» готовы к следующему действию. | none | State copy: populated/default | phone | state-body |
| screen.phone.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | phone | recovery |
| screen.phone.title | Вход по почте | none | Surface title | phone | navigation-title |
| screen.pickup.action.complete-pickup.label | Продолжить: Точка посадки | none | Action label | pickup | control |
| screen.pickup.purpose | Карта · расстояние · маршруты рядом | none | Product task | pickup | accessibility-and-docs |
| screen.pickup.state.error.body | Не удалось обновить «Точка посадки». Введённые данные сохранены; повторите попытку. | none | State copy: error | pickup | state-body |
| screen.pickup.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | pickup | recovery |
| screen.pickup.state.loading.body | Обновляем данные раздела «Точка посадки»; текущий контекст остаётся доступен. | none | State copy: loading | pickup | state-body |
| screen.pickup.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | pickup | recovery |
| screen.pickup.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | pickup | state-body |
| screen.pickup.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | pickup | recovery |
| screen.pickup.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | pickup | state-body |
| screen.pickup.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | pickup | recovery |
| screen.pickup.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | pickup | state-body |
| screen.pickup.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | pickup | recovery |
| screen.pickup.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | pickup | state-body |
| screen.pickup.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | pickup | recovery |
| screen.pickup.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | pickup | state-body |
| screen.pickup.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | pickup | recovery |
| screen.pickup.state.populated-default.body | Актуальные данные раздела «Точка посадки» готовы к следующему действию. | none | State copy: populated/default | pickup | state-body |
| screen.pickup.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | pickup | recovery |
| screen.pickup.title | Точка посадки | none | Surface title | pickup | navigation-title |
| screen.player.action.open-background.label | Открыть background | none | Action label | player | control |
| screen.player.purpose | Аудио · ±15 секунд · Now Playing | none | Product task | player | accessibility-and-docs |
| screen.player.state.error.body | Не удалось обновить «Разбор билета». Введённые данные сохранены; повторите попытку. | none | State copy: error | player | state-body |
| screen.player.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | player | recovery |
| screen.player.state.loading.body | Обновляем данные раздела «Разбор билета»; текущий контекст остаётся доступен. | none | State copy: loading | player | state-body |
| screen.player.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | player | recovery |
| screen.player.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | player | state-body |
| screen.player.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | player | recovery |
| screen.player.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | player | state-body |
| screen.player.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | player | recovery |
| screen.player.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | player | state-body |
| screen.player.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | player | recovery |
| screen.player.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | player | state-body |
| screen.player.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | player | recovery |
| screen.player.state.populated-default.body | Актуальные данные раздела «Разбор билета» готовы к следующему действию. | none | State copy: populated/default | player | state-body |
| screen.player.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | player | recovery |
| screen.player.title | Разбор билета | none | Surface title | player | navigation-title |
| screen.reschedule.action.complete-reschedule.label | Продолжить: Перенос занятия | none | Action label | reschedule | control |
| screen.reschedule.purpose | Свободные слоты · правка события | none | Product task | reschedule | accessibility-and-docs |
| screen.reschedule.state.error.body | Не удалось обновить «Перенос занятия». Введённые данные сохранены; повторите попытку. | none | State copy: error | reschedule | state-body |
| screen.reschedule.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | reschedule | recovery |
| screen.reschedule.state.loading.body | Обновляем данные раздела «Перенос занятия»; текущий контекст остаётся доступен. | none | State copy: loading | reschedule | state-body |
| screen.reschedule.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | reschedule | recovery |
| screen.reschedule.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | reschedule | state-body |
| screen.reschedule.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | reschedule | recovery |
| screen.reschedule.state.populated-default.body | Актуальные данные раздела «Перенос занятия» готовы к следующему действию. | none | State copy: populated/default | reschedule | state-body |
| screen.reschedule.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | reschedule | recovery |
| screen.reschedule.title | Перенос занятия | none | Surface title | reschedule | navigation-title |
| screen.scan.action.complete-scan.label | Продолжить: QR на стекле | none | Action label | scan | control |
| screen.scan.purpose | Сканер QR учебной машины | none | Product task | scan | accessibility-and-docs |
| screen.scan.state.error.body | Не удалось обновить «QR на стекле». Введённые данные сохранены; повторите попытку. | none | State copy: error | scan | state-body |
| screen.scan.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | scan | recovery |
| screen.scan.state.loading.body | Обновляем данные раздела «QR на стекле»; текущий контекст остаётся доступен. | none | State copy: loading | scan | state-body |
| screen.scan.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | scan | recovery |
| screen.scan.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | scan | state-body |
| screen.scan.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | scan | recovery |
| screen.scan.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | scan | state-body |
| screen.scan.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | scan | recovery |
| screen.scan.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | scan | state-body |
| screen.scan.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | scan | recovery |
| screen.scan.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | scan | state-body |
| screen.scan.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | scan | recovery |
| screen.scan.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | scan | state-body |
| screen.scan.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | scan | recovery |
| screen.scan.state.populated-default.body | Актуальные данные раздела «QR на стекле» готовы к следующему действию. | none | State copy: populated/default | scan | state-body |
| screen.scan.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | scan | recovery |
| screen.scan.title | QR на стекле | none | Surface title | scan | navigation-title |
| screen.scanwifi.action.complete-scanwifi.label | Продолжить: QR со стены | none | Action label | scanwifi | control |
| screen.scanwifi.purpose | Сканер QR сети класса | none | Product task | scanwifi | accessibility-and-docs |
| screen.scanwifi.state.error.body | Не удалось обновить «QR со стены». Введённые данные сохранены; повторите попытку. | none | State copy: error | scanwifi | state-body |
| screen.scanwifi.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | scanwifi | recovery |
| screen.scanwifi.state.loading.body | Обновляем данные раздела «QR со стены»; текущий контекст остаётся доступен. | none | State copy: loading | scanwifi | state-body |
| screen.scanwifi.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | scanwifi | recovery |
| screen.scanwifi.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | scanwifi | state-body |
| screen.scanwifi.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | scanwifi | recovery |
| screen.scanwifi.state.populated-default.body | Актуальные данные раздела «QR со стены» готовы к следующему действию. | none | State copy: populated/default | scanwifi | state-body |
| screen.scanwifi.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | scanwifi | recovery |
| screen.scanwifi.title | QR со стены | none | Surface title | scanwifi | navigation-title |
| screen.theory.action.open-ticket.label | Открыть ticket | none | Action label | theory | control |
| screen.theory.purpose | Билеты · разборы · состояние загрузок | none | Product task | theory | accessibility-and-docs |
| screen.theory.state.empty.body | В разделе «Теория» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | theory | state-body |
| screen.theory.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | theory | recovery |
| screen.theory.state.error.body | Не удалось обновить «Теория». Введённые данные сохранены; повторите попытку. | none | State copy: error | theory | state-body |
| screen.theory.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | theory | recovery |
| screen.theory.state.loading.body | Обновляем данные раздела «Теория»; текущий контекст остаётся доступен. | none | State copy: loading | theory | state-body |
| screen.theory.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | theory | recovery |
| screen.theory.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | theory | state-body |
| screen.theory.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | theory | recovery |
| screen.theory.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | theory | state-body |
| screen.theory.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | theory | recovery |
| screen.theory.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | theory | state-body |
| screen.theory.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | theory | recovery |
| screen.theory.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | theory | state-body |
| screen.theory.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | theory | recovery |
| screen.theory.state.populated-default.body | Актуальные данные раздела «Теория» готовы к следующему действию. | none | State copy: populated/default | theory | state-body |
| screen.theory.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | theory | recovery |
| screen.theory.title | Теория | none | Surface title | theory | navigation-title |
| screen.ticket.action.open-player.label | Открыть player | none | Action label | ticket | control |
| screen.ticket.purpose | Вопросы, ошибки, разбор | none | Product task | ticket | accessibility-and-docs |
| screen.ticket.state.error.body | Не удалось обновить «Билет». Введённые данные сохранены; повторите попытку. | none | State copy: error | ticket | state-body |
| screen.ticket.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ticket | recovery |
| screen.ticket.state.loading.body | Обновляем данные раздела «Билет»; текущий контекст остаётся доступен. | none | State copy: loading | ticket | state-body |
| screen.ticket.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | ticket | recovery |
| screen.ticket.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | ticket | state-body |
| screen.ticket.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | ticket | recovery |
| screen.ticket.state.populated-default.body | Актуальные данные раздела «Билет» готовы к следующему действию. | none | State copy: populated/default | ticket | state-body |
| screen.ticket.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | ticket | recovery |
| screen.ticket.title | Билет | none | Surface title | ticket | navigation-title |
| screen.widget.purpose | Следующее занятие · часы | none | Product task | widget | accessibility-and-docs |
| screen.widget.state.error.body | Не удалось обновить «Виджет на «Домой»». Введённые данные сохранены; повторите попытку. | none | State copy: error | widget | state-body |
| screen.widget.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | widget | recovery |
| screen.widget.state.loading.body | Обновляем данные раздела «Виджет на «Домой»»; текущий контекст остаётся доступен. | none | State copy: loading | widget | state-body |
| screen.widget.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | widget | recovery |
| screen.widget.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | widget | state-body |
| screen.widget.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | widget | recovery |
| screen.widget.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | widget | state-body |
| screen.widget.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | widget | recovery |
| screen.widget.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | widget | state-body |
| screen.widget.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | widget | recovery |
| screen.widget.state.populated-default.body | Актуальные данные раздела «Виджет на «Домой»» готовы к следующему действию. | none | State copy: populated/default | widget | state-body |
| screen.widget.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | widget | recovery |
| screen.widget.title | Виджет на «Домой» | none | Surface title | widget | navigation-title |

## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| all.happy | all | happy-path | surface:phone<br>fixture:fixture.nakat.phone.default | perform-action:phone.open-code<br>perform-action:code.open-codefail<br>open-surface:codefail<br>perform-action:lessons.open-lesson<br>perform-action:lesson.open-call<br>open-surface:call<br>open-surface:pickup<br>open-surface:scan | surface-visible:scan<br>outcome-visible:30-20 |
| all.failure | all | failure-recovery | surface:phone<br>fixture:fixture.nakat.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| all.offline | all | offline | surface:phone<br>fixture:fixture.nakat.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| all.persistence | all | persistence-return | surface:phone<br>checkpoint-flow:all | relaunch:application<br>return-to-flow:all | flow-context-restored:all<br>surface-visible:phone |
| signin.happy | signin | happy-path | surface:phone<br>fixture:fixture.nakat.phone.default | perform-action:phone.open-code<br>perform-action:code.open-codefail<br>open-surface:codefail<br>open-surface:lessons | surface-visible:lessons<br>outcome-visible:sms |
| signin.failure | signin | failure-recovery | surface:phone<br>fixture:fixture.nakat.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| signin.offline | signin | offline | surface:phone<br>fixture:fixture.nakat.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| signin.persistence | signin | persistence-return | surface:phone<br>checkpoint-flow:signin | relaunch:application<br>return-to-flow:signin | flow-context-restored:signin<br>surface-visible:phone |
| drive.happy | drive | happy-path | surface:lessons<br>fixture:fixture.nakat.lessons.default | perform-action:lessons.open-lesson<br>perform-action:lesson.open-call<br>open-surface:call<br>open-surface:pickup<br>open-surface:scan<br>perform-action:drive.open-note<br>open-surface:note<br>open-surface:chat | surface-visible:chat<br>outcome-visible:qr |
| drive.failure | drive | failure-recovery | surface:lessons<br>fixture:fixture.nakat.lessons.error<br>inject-state:error | invoke-recovery:lessons | recovery-visible:lessons<br>input-preserved:lessons |
| drive.offline | drive | offline | surface:lessons<br>fixture:fixture.nakat.lessons.offline<br>connectivity:offline | open-surface:lessons | state-visible:lessons.offline<br>recovery-visible:lessons |
| drive.persistence | drive | persistence-return | surface:lessons<br>checkpoint-flow:drive | relaunch:application<br>return-to-flow:drive | flow-context-restored:drive<br>surface-visible:lessons |
| permission.voip.denied | permission:voip | permission-denial-fallback | surface:lesson<br>fixture:fixture.nakat.call.permission-denied<br>permission-status:voip.not-determined | deny-permission:voip | state-visible:call.permission-denied<br>fallback-visible:voip |
| permission.audio.denied | permission:audio | permission-denial-fallback | surface:player<br>fixture:fixture.nakat.background.permission-denied<br>permission-status:audio.not-determined | deny-permission:audio | state-visible:background.permission-denied<br>fallback-visible:audio |
| permission.fetch.denied | permission:fetch | permission-denial-fallback | surface:bg<br>fixture:fixture.nakat.lessons.permission-denied<br>permission-status:fetch.not-determined | deny-permission:fetch | state-visible:lessons.permission-denied<br>fallback-visible:fetch |
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.nakat.menu.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:menu.permission-denied<br>fallback-visible:tracking |
| permission.camera.denied | permission:camera | permission-denial-fallback | surface:lesson<br>fixture:fixture.nakat.scan.permission-denied<br>permission-status:camera.not-determined | deny-permission:camera | state-visible:scan.permission-denied<br>fallback-visible:camera |
| permission.photos.denied | permission:photos | permission-denial-fallback | surface:docs<br>fixture:fixture.nakat.docs.permission-denied<br>permission-status:photos.not-determined | deny-permission:photos | state-visible:docs.permission-denied<br>fallback-visible:photos |
| permission.mic.denied | permission:mic | permission-denial-fallback | surface:drive<br>fixture:fixture.nakat.note.permission-denied<br>permission-status:mic.not-determined | deny-permission:mic | state-visible:note.permission-denied<br>fallback-visible:mic |
| permission.speech.denied | permission:speech | permission-denial-fallback | surface:drive<br>fixture:fixture.nakat.note.permission-denied<br>permission-status:speech.not-determined | deny-permission:speech | state-visible:note.permission-denied<br>fallback-visible:speech |
| permission.location.denied | permission:location | permission-denial-fallback | surface:lesson<br>fixture:fixture.nakat.pickup.permission-denied<br>permission-status:location.not-determined | deny-permission:location | state-visible:pickup.permission-denied<br>fallback-visible:location |
| permission.calendar.denied | permission:calendar | permission-denial-fallback | surface:lesson<br>fixture:fixture.nakat.lesson.permission-denied<br>permission-status:calendar.not-determined | deny-permission:calendar | state-visible:lesson.permission-denied<br>fallback-visible:calendar |
| permission.wifiinfo.denied | permission:wifiinfo | permission-denial-fallback | surface:attend<br>fixture:fixture.nakat.classroom.permission-denied<br>permission-status:wifiinfo.not-determined | deny-permission:wifiinfo | state-visible:classroom.permission-denied<br>fallback-visible:wifiinfo |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:guestnet<br>fixture:fixture.nakat.guestnet.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:guestnet.permission-denied<br>fallback-visible:hotspot |
| permission.faceid.denied | permission:faceid | permission-denial-fallback | surface:lock<br>fixture:fixture.nakat.lock.permission-denied<br>permission-status:faceid.not-determined | deny-permission:faceid | state-visible:lock.permission-denied<br>fallback-visible:faceid |
| permission.autofill.denied | permission:autofill | permission-denial-fallback | surface:passwords<br>fixture:fixture.nakat.fill.permission-denied<br>permission-status:autofill.not-determined | deny-permission:autofill | state-visible:fill.permission-denied<br>fallback-visible:autofill |
| permission.push.denied | permission:push | permission-denial-fallback | surface:notif<br>fixture:fixture.nakat.notif.permission-denied<br>permission-status:push.not-determined | deny-permission:push | state-visible:notif.permission-denied<br>fallback-visible:push |
| permission.commnotif.denied | permission:commnotif | permission-denial-fallback | surface:chat<br>fixture:fixture.nakat.lockscreen.permission-denied<br>permission-status:commnotif.not-determined | deny-permission:commnotif | state-visible:lockscreen.permission-denied<br>fallback-visible:commnotif |
| permission.remotenotif.denied | permission:remotenotif | permission-denial-fallback | surface:bg<br>fixture:fixture.nakat.widget.permission-denied<br>permission-status:remotenotif.not-determined | deny-permission:remotenotif | state-visible:widget.permission-denied<br>fallback-visible:remotenotif |
| permission.bgtask.denied | permission:bgtask | permission-denial-fallback | surface:bg<br>fixture:fixture.nakat.theory.permission-denied<br>permission-status:bgtask.not-determined | deny-permission:bgtask | state-visible:theory.permission-denied<br>fallback-visible:bgtask |
| permission.appgroups.denied | permission:appgroups | permission-denial-fallback | surface:menu<br>fixture:fixture.nakat.widget.permission-denied<br>permission-status:appgroups.not-determined | deny-permission:appgroups | state-visible:widget.permission-denied<br>fallback-visible:appgroups |
| permission.keychain.denied | permission:keychain | permission-denial-fallback | surface:widget<br>fixture:fixture.nakat.lessons.permission-denied<br>permission-status:keychain.not-determined | deny-permission:keychain | state-visible:lessons.permission-denied<br>fallback-visible:keychain |

## Deterministic fixture catalog

Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.

| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |
|---|---|---|---|---|---|
| fixture.nakat.phone.default | phone / default | nakat.phone.default.primary.001<br>nakat.phone.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.phone.loading | phone / loading | nakat.phone.loading.primary.001<br>nakat.phone.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.phone.error | phone / error | nakat.phone.error.primary.001<br>nakat.phone.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.phone.offline | phone / offline | nakat.phone.offline.primary.001<br>nakat.phone.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.code.default | code / default | nakat.code.default.primary.001<br>nakat.code.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.code.loading | code / loading | nakat.code.loading.primary.001<br>nakat.code.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.code.error | code / error | nakat.code.error.primary.001<br>nakat.code.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.code.offline | code / offline | nakat.code.offline.primary.001<br>nakat.code.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.codefail.default | codefail / default | nakat.codefail.default.primary.001<br>nakat.codefail.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.codefail.loading | codefail / loading | nakat.codefail.loading.primary.001<br>nakat.codefail.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.codefail.error | codefail / error | nakat.codefail.error.primary.001<br>nakat.codefail.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.codefail.offline | codefail / offline | nakat.codefail.offline.primary.001<br>nakat.codefail.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.default | lessons / default | nakat.lessons.default.primary.001<br>nakat.lessons.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.loading | lessons / loading | nakat.lessons.loading.primary.001<br>nakat.lessons.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.error | lessons / error | nakat.lessons.error.primary.001<br>nakat.lessons.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.offline | lessons / offline | nakat.lessons.offline.primary.001<br>nakat.lessons.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.empty | lessons / empty | nakat.lessons.empty.primary.001<br>nakat.lessons.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.permission-needed | lessons / permission-needed | nakat.lessons.permission-needed.primary.001<br>nakat.lessons.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.permission-denied | lessons / permission-denied | nakat.lessons.permission-denied.primary.001<br>nakat.lessons.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lessons.permission-restricted | lessons / permission-restricted | nakat.lessons.permission-restricted.primary.001<br>nakat.lessons.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.default | lesson / default | nakat.lesson.default.primary.001<br>nakat.lesson.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.loading | lesson / loading | nakat.lesson.loading.primary.001<br>nakat.lesson.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.error | lesson / error | nakat.lesson.error.primary.001<br>nakat.lesson.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.offline | lesson / offline | nakat.lesson.offline.primary.001<br>nakat.lesson.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.permission-needed | lesson / permission-needed | nakat.lesson.permission-needed.primary.001<br>nakat.lesson.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.permission-denied | lesson / permission-denied | nakat.lesson.permission-denied.primary.001<br>nakat.lesson.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.permission-restricted | lesson / permission-restricted | nakat.lesson.permission-restricted.primary.001<br>nakat.lesson.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lesson.permission-limited | lesson / permission-limited | nakat.lesson.permission-limited.primary.001<br>nakat.lesson.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.default | call / default | nakat.call.default.primary.001<br>nakat.call.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.loading | call / loading | nakat.call.loading.primary.001<br>nakat.call.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.error | call / error | nakat.call.error.primary.001<br>nakat.call.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.offline | call / offline | nakat.call.offline.primary.001<br>nakat.call.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.permission-needed | call / permission-needed | nakat.call.permission-needed.primary.001<br>nakat.call.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.permission-denied | call / permission-denied | nakat.call.permission-denied.primary.001<br>nakat.call.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.call.permission-restricted | call / permission-restricted | nakat.call.permission-restricted.primary.001<br>nakat.call.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.default | pickup / default | nakat.pickup.default.primary.001<br>nakat.pickup.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.loading | pickup / loading | nakat.pickup.loading.primary.001<br>nakat.pickup.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.error | pickup / error | nakat.pickup.error.primary.001<br>nakat.pickup.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.offline | pickup / offline | nakat.pickup.offline.primary.001<br>nakat.pickup.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.permission-needed | pickup / permission-needed | nakat.pickup.permission-needed.primary.001<br>nakat.pickup.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.permission-denied | pickup / permission-denied | nakat.pickup.permission-denied.primary.001<br>nakat.pickup.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.permission-restricted | pickup / permission-restricted | nakat.pickup.permission-restricted.primary.001<br>nakat.pickup.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.pickup.permission-limited | pickup / permission-limited | nakat.pickup.permission-limited.primary.001<br>nakat.pickup.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.default | scan / default | nakat.scan.default.primary.001<br>nakat.scan.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.loading | scan / loading | nakat.scan.loading.primary.001<br>nakat.scan.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.error | scan / error | nakat.scan.error.primary.001<br>nakat.scan.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.offline | scan / offline | nakat.scan.offline.primary.001<br>nakat.scan.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.permission-needed | scan / permission-needed | nakat.scan.permission-needed.primary.001<br>nakat.scan.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.permission-denied | scan / permission-denied | nakat.scan.permission-denied.primary.001<br>nakat.scan.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.permission-restricted | scan / permission-restricted | nakat.scan.permission-restricted.primary.001<br>nakat.scan.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scan.permission-limited | scan / permission-limited | nakat.scan.permission-limited.primary.001<br>nakat.scan.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.default | drive / default | nakat.drive.default.primary.001<br>nakat.drive.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.loading | drive / loading | nakat.drive.loading.primary.001<br>nakat.drive.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.error | drive / error | nakat.drive.error.primary.001<br>nakat.drive.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.offline | drive / offline | nakat.drive.offline.primary.001<br>nakat.drive.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.permission-needed | drive / permission-needed | nakat.drive.permission-needed.primary.001<br>nakat.drive.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.permission-denied | drive / permission-denied | nakat.drive.permission-denied.primary.001<br>nakat.drive.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.drive.permission-restricted | drive / permission-restricted | nakat.drive.permission-restricted.primary.001<br>nakat.drive.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.default | note / default | nakat.note.default.primary.001<br>nakat.note.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.loading | note / loading | nakat.note.loading.primary.001<br>nakat.note.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.error | note / error | nakat.note.error.primary.001<br>nakat.note.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.offline | note / offline | nakat.note.offline.primary.001<br>nakat.note.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.permission-needed | note / permission-needed | nakat.note.permission-needed.primary.001<br>nakat.note.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.permission-denied | note / permission-denied | nakat.note.permission-denied.primary.001<br>nakat.note.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.note.permission-restricted | note / permission-restricted | nakat.note.permission-restricted.primary.001<br>nakat.note.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.reschedule.default | reschedule / default | nakat.reschedule.default.primary.001<br>nakat.reschedule.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.reschedule.loading | reschedule / loading | nakat.reschedule.loading.primary.001<br>nakat.reschedule.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.reschedule.error | reschedule / error | nakat.reschedule.error.primary.001<br>nakat.reschedule.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.reschedule.offline | reschedule / offline | nakat.reschedule.offline.primary.001<br>nakat.reschedule.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.default | chat / default | nakat.chat.default.primary.001<br>nakat.chat.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.loading | chat / loading | nakat.chat.loading.primary.001<br>nakat.chat.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.error | chat / error | nakat.chat.error.primary.001<br>nakat.chat.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.offline | chat / offline | nakat.chat.offline.primary.001<br>nakat.chat.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.permission-needed | chat / permission-needed | nakat.chat.permission-needed.primary.001<br>nakat.chat.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.permission-denied | chat / permission-denied | nakat.chat.permission-denied.primary.001<br>nakat.chat.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.chat.permission-restricted | chat / permission-restricted | nakat.chat.permission-restricted.primary.001<br>nakat.chat.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.default | lockscreen / default | nakat.lockscreen.default.primary.001<br>nakat.lockscreen.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.loading | lockscreen / loading | nakat.lockscreen.loading.primary.001<br>nakat.lockscreen.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.error | lockscreen / error | nakat.lockscreen.error.primary.001<br>nakat.lockscreen.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.offline | lockscreen / offline | nakat.lockscreen.offline.primary.001<br>nakat.lockscreen.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.permission-needed | lockscreen / permission-needed | nakat.lockscreen.permission-needed.primary.001<br>nakat.lockscreen.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.permission-denied | lockscreen / permission-denied | nakat.lockscreen.permission-denied.primary.001<br>nakat.lockscreen.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lockscreen.permission-restricted | lockscreen / permission-restricted | nakat.lockscreen.permission-restricted.primary.001<br>nakat.lockscreen.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.default | notif / default | nakat.notif.default.primary.001<br>nakat.notif.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.loading | notif / loading | nakat.notif.loading.primary.001<br>nakat.notif.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.error | notif / error | nakat.notif.error.primary.001<br>nakat.notif.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.offline | notif / offline | nakat.notif.offline.primary.001<br>nakat.notif.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.permission-needed | notif / permission-needed | nakat.notif.permission-needed.primary.001<br>nakat.notif.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.permission-denied | notif / permission-denied | nakat.notif.permission-denied.primary.001<br>nakat.notif.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.notif.permission-restricted | notif / permission-restricted | nakat.notif.permission-restricted.primary.001<br>nakat.notif.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.default | theory / default | nakat.theory.default.primary.001<br>nakat.theory.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.loading | theory / loading | nakat.theory.loading.primary.001<br>nakat.theory.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.error | theory / error | nakat.theory.error.primary.001<br>nakat.theory.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.offline | theory / offline | nakat.theory.offline.primary.001<br>nakat.theory.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.empty | theory / empty | nakat.theory.empty.primary.001<br>nakat.theory.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.permission-needed | theory / permission-needed | nakat.theory.permission-needed.primary.001<br>nakat.theory.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.permission-denied | theory / permission-denied | nakat.theory.permission-denied.primary.001<br>nakat.theory.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.theory.permission-restricted | theory / permission-restricted | nakat.theory.permission-restricted.primary.001<br>nakat.theory.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ticket.default | ticket / default | nakat.ticket.default.primary.001<br>nakat.ticket.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ticket.loading | ticket / loading | nakat.ticket.loading.primary.001<br>nakat.ticket.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ticket.error | ticket / error | nakat.ticket.error.primary.001<br>nakat.ticket.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ticket.offline | ticket / offline | nakat.ticket.offline.primary.001<br>nakat.ticket.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.default | player / default | nakat.player.default.primary.001<br>nakat.player.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.loading | player / loading | nakat.player.loading.primary.001<br>nakat.player.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.error | player / error | nakat.player.error.primary.001<br>nakat.player.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.offline | player / offline | nakat.player.offline.primary.001<br>nakat.player.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.permission-needed | player / permission-needed | nakat.player.permission-needed.primary.001<br>nakat.player.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.permission-denied | player / permission-denied | nakat.player.permission-denied.primary.001<br>nakat.player.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.player.permission-restricted | player / permission-restricted | nakat.player.permission-restricted.primary.001<br>nakat.player.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.default | background / default | nakat.background.default.primary.001<br>nakat.background.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.loading | background / loading | nakat.background.loading.primary.001<br>nakat.background.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.error | background / error | nakat.background.error.primary.001<br>nakat.background.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.offline | background / offline | nakat.background.offline.primary.001<br>nakat.background.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.permission-needed | background / permission-needed | nakat.background.permission-needed.primary.001<br>nakat.background.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.permission-denied | background / permission-denied | nakat.background.permission-denied.primary.001<br>nakat.background.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.background.permission-restricted | background / permission-restricted | nakat.background.permission-restricted.primary.001<br>nakat.background.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.checklist.default | checklist / default | nakat.checklist.default.primary.001<br>nakat.checklist.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.checklist.loading | checklist / loading | nakat.checklist.loading.primary.001<br>nakat.checklist.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.checklist.error | checklist / error | nakat.checklist.error.primary.001<br>nakat.checklist.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.checklist.offline | checklist / offline | nakat.checklist.offline.primary.001<br>nakat.checklist.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.default | classroom / default | nakat.classroom.default.primary.001<br>nakat.classroom.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.loading | classroom / loading | nakat.classroom.loading.primary.001<br>nakat.classroom.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.error | classroom / error | nakat.classroom.error.primary.001<br>nakat.classroom.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.offline | classroom / offline | nakat.classroom.offline.primary.001<br>nakat.classroom.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.permission-needed | classroom / permission-needed | nakat.classroom.permission-needed.primary.001<br>nakat.classroom.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.permission-denied | classroom / permission-denied | nakat.classroom.permission-denied.primary.001<br>nakat.classroom.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.classroom.permission-restricted | classroom / permission-restricted | nakat.classroom.permission-restricted.primary.001<br>nakat.classroom.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.default | attend / default | nakat.attend.default.primary.001<br>nakat.attend.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.loading | attend / loading | nakat.attend.loading.primary.001<br>nakat.attend.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.error | attend / error | nakat.attend.error.primary.001<br>nakat.attend.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.offline | attend / offline | nakat.attend.offline.primary.001<br>nakat.attend.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.permission-needed | attend / permission-needed | nakat.attend.permission-needed.primary.001<br>nakat.attend.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.permission-denied | attend / permission-denied | nakat.attend.permission-denied.primary.001<br>nakat.attend.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.attend.permission-restricted | attend / permission-restricted | nakat.attend.permission-restricted.primary.001<br>nakat.attend.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.default | guestnet / default | nakat.guestnet.default.primary.001<br>nakat.guestnet.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.loading | guestnet / loading | nakat.guestnet.loading.primary.001<br>nakat.guestnet.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.error | guestnet / error | nakat.guestnet.error.primary.001<br>nakat.guestnet.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.offline | guestnet / offline | nakat.guestnet.offline.primary.001<br>nakat.guestnet.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.permission-needed | guestnet / permission-needed | nakat.guestnet.permission-needed.primary.001<br>nakat.guestnet.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.permission-denied | guestnet / permission-denied | nakat.guestnet.permission-denied.primary.001<br>nakat.guestnet.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.guestnet.permission-restricted | guestnet / permission-restricted | nakat.guestnet.permission-restricted.primary.001<br>nakat.guestnet.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scanwifi.default | scanwifi / default | nakat.scanwifi.default.primary.001<br>nakat.scanwifi.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scanwifi.loading | scanwifi / loading | nakat.scanwifi.loading.primary.001<br>nakat.scanwifi.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scanwifi.error | scanwifi / error | nakat.scanwifi.error.primary.001<br>nakat.scanwifi.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.scanwifi.offline | scanwifi / offline | nakat.scanwifi.offline.primary.001<br>nakat.scanwifi.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.default | menu / default | nakat.menu.default.primary.001<br>nakat.menu.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.loading | menu / loading | nakat.menu.loading.primary.001<br>nakat.menu.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.error | menu / error | nakat.menu.error.primary.001<br>nakat.menu.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.offline | menu / offline | nakat.menu.offline.primary.001<br>nakat.menu.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.empty | menu / empty | nakat.menu.empty.primary.001<br>nakat.menu.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.permission-needed | menu / permission-needed | nakat.menu.permission-needed.primary.001<br>nakat.menu.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.permission-denied | menu / permission-denied | nakat.menu.permission-denied.primary.001<br>nakat.menu.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.menu.permission-restricted | menu / permission-restricted | nakat.menu.permission-restricted.primary.001<br>nakat.menu.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.default | docs / default | nakat.docs.default.primary.001<br>nakat.docs.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.loading | docs / loading | nakat.docs.loading.primary.001<br>nakat.docs.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.error | docs / error | nakat.docs.error.primary.001<br>nakat.docs.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.offline | docs / offline | nakat.docs.offline.primary.001<br>nakat.docs.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.permission-needed | docs / permission-needed | nakat.docs.permission-needed.primary.001<br>nakat.docs.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.permission-denied | docs / permission-denied | nakat.docs.permission-denied.primary.001<br>nakat.docs.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.permission-restricted | docs / permission-restricted | nakat.docs.permission-restricted.primary.001<br>nakat.docs.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.docs.permission-limited | docs / permission-limited | nakat.docs.permission-limited.primary.001<br>nakat.docs.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.default | lock / default | nakat.lock.default.primary.001<br>nakat.lock.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.loading | lock / loading | nakat.lock.loading.primary.001<br>nakat.lock.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.error | lock / error | nakat.lock.error.primary.001<br>nakat.lock.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.offline | lock / offline | nakat.lock.offline.primary.001<br>nakat.lock.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.permission-needed | lock / permission-needed | nakat.lock.permission-needed.primary.001<br>nakat.lock.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.permission-denied | lock / permission-denied | nakat.lock.permission-denied.primary.001<br>nakat.lock.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.lock.permission-restricted | lock / permission-restricted | nakat.lock.permission-restricted.primary.001<br>nakat.lock.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.default | passwords / default | nakat.passwords.default.primary.001<br>nakat.passwords.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.loading | passwords / loading | nakat.passwords.loading.primary.001<br>nakat.passwords.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.error | passwords / error | nakat.passwords.error.primary.001<br>nakat.passwords.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.offline | passwords / offline | nakat.passwords.offline.primary.001<br>nakat.passwords.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.permission-needed | passwords / permission-needed | nakat.passwords.permission-needed.primary.001<br>nakat.passwords.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.permission-denied | passwords / permission-denied | nakat.passwords.permission-denied.primary.001<br>nakat.passwords.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.passwords.permission-restricted | passwords / permission-restricted | nakat.passwords.permission-restricted.primary.001<br>nakat.passwords.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.default | fill / default | nakat.fill.default.primary.001<br>nakat.fill.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.loading | fill / loading | nakat.fill.loading.primary.001<br>nakat.fill.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.error | fill / error | nakat.fill.error.primary.001<br>nakat.fill.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.offline | fill / offline | nakat.fill.offline.primary.001<br>nakat.fill.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.permission-needed | fill / permission-needed | nakat.fill.permission-needed.primary.001<br>nakat.fill.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.permission-denied | fill / permission-denied | nakat.fill.permission-denied.primary.001<br>nakat.fill.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.fill.permission-restricted | fill / permission-restricted | nakat.fill.permission-restricted.primary.001<br>nakat.fill.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.default | widget / default | nakat.widget.default.primary.001<br>nakat.widget.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.loading | widget / loading | nakat.widget.loading.primary.001<br>nakat.widget.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.error | widget / error | nakat.widget.error.primary.001<br>nakat.widget.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.offline | widget / offline | nakat.widget.offline.primary.001<br>nakat.widget.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.permission-needed | widget / permission-needed | nakat.widget.permission-needed.primary.001<br>nakat.widget.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.permission-denied | widget / permission-denied | nakat.widget.permission-denied.primary.001<br>nakat.widget.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.widget.permission-restricted | widget / permission-restricted | nakat.widget.permission-restricted.primary.001<br>nakat.widget.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.default | bg / default | nakat.bg.default.primary.001<br>nakat.bg.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.loading | bg / loading | nakat.bg.loading.primary.001<br>nakat.bg.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.error | bg / error | nakat.bg.error.primary.001<br>nakat.bg.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.offline | bg / offline | nakat.bg.offline.primary.001<br>nakat.bg.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.permission-needed | bg / permission-needed | nakat.bg.permission-needed.primary.001<br>nakat.bg.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.permission-denied | bg / permission-denied | nakat.bg.permission-denied.primary.001<br>nakat.bg.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.bg.permission-restricted | bg / permission-restricted | nakat.bg.permission-restricted.primary.001<br>nakat.bg.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.default | ads / default | nakat.ads.default.primary.001<br>nakat.ads.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.loading | ads / loading | nakat.ads.loading.primary.001<br>nakat.ads.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.error | ads / error | nakat.ads.error.primary.001<br>nakat.ads.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.offline | ads / offline | nakat.ads.offline.primary.001<br>nakat.ads.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.permission-needed | ads / permission-needed | nakat.ads.permission-needed.primary.001<br>nakat.ads.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.permission-denied | ads / permission-denied | nakat.ads.permission-denied.primary.001<br>nakat.ads.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |
| fixture.nakat.ads.permission-restricted | ads / permission-restricted | nakat.ads.permission-restricted.primary.001<br>nakat.ads.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/nakat/concept.json + curated native portfolio | no media |

## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| voip | Звонок инструктору по учебной группе, а не на номер: телефоны сторон не видны | Только после действия ««Позвонить инструктору»» | Сценарий «Звонок инструктору по учебной группе, а не на номер: телефоны сторон не видны» на поверхности lesson | Без режима вызов приходит обычным уведомлением, и на него надо успеть открыть приложение | contextual-gesture |
| audio | Разбор билета и вчерашней поездки в наушниках с погашенным экраном | Только после действия ««Погасить экран»» | Сценарий «Разбор билета и вчерашней поездки в наушниках с погашенным экраном» на поверхности player | Без режима звук останавливается вместе с экраном — слушать можно только глядя в телефон | contextual-gesture |
| fetch | Перенос занятия и свободные окна готовы к первому открытию | Только после действия ««Обновление в фоне»» | Сценарий «Перенос занятия и свободные окна готовы к первому открытию» на поверхности bg | Без режима расписание подтягивается в момент открытия приложения | app-lifecycle |
| tracking | Реклама автосервисов и страховых вместо платной подписки | Только после действия ««Продолжить»» | Сценарий «Реклама автосервисов и страховых вместо платной подписки» на поверхности ads | Реклама остаётся, но неперсонализированная — не по интересам | contextual-gesture |
| camera | QR на стекле машины отмечает начало занятия, QR со стены даёт параметры сети класса | Только после действия ««Сканировать QR машины»» | Сценарий «QR на стекле машины отмечает начало занятия, QR со стены даёт параметры сети класса» на поверхности lesson | Номер машины вводится руками, начало занятия отмечает инструктор | contextual-gesture |
| photos | Медсправка и договор из медиатеки в раздел документов | Только после действия ««Добавить из медиатеки»» | Сценарий «Медсправка и договор из медиатеки в раздел документов» на поверхности docs | Документ остаётся сфотографировать на месте | contextual-gesture |
| mic | Голосовая заметка об ошибке сразу после занятия, руки только что были на руле | Только после действия ««Записать разбор» — цепочкой с распознаванием речи» | Сценарий «Голосовая заметка об ошибке сразу после занятия, руки только что были на руле» на поверхности drive | Заметка к занятию набирается текстом | contextual-gesture |
| speech | Расшифровка заметки и сверка проговоренного алгоритма перекрёстка с чек-листом | Только после действия ««Проговорить алгоритм» и «Записать разбор»» | Сценарий «Расшифровка заметки и сверка проговоренного алгоритма перекрёстка с чек-листом» на поверхности drive | Заметка остаётся звуком без текста, пункты чек-листа отмечаются пальцем | contextual-gesture |
| location | Точка посадки с расстоянием и экзаменационные маршруты рядом | Только после действия ««Показать точку посадки»» | Сценарий «Точка посадки с расстоянием и экзаменационные маршруты рядом» на поверхности lesson | Адрес посадки остаётся текстом, без точки «я» и расстояния | contextual-gesture |
| calendar | Занятие в системном календаре, при переносе правится то же событие | Только после действия ««Добавить в Календарь»» | Сценарий «Занятие в системном календаре, при переносе правится то же событие» на поверхности lesson | Занятие остаётся внутри «Наката», с напоминанием в приложении | contextual-gesture |
| wifiinfo | Присутствие на теории подтверждается сетью класса — часы идут в ведомость | Только после действия ««Отметиться в классе»» | Сценарий «Присутствие на теории подтверждается сетью класса — часы идут в ведомость» на поверхности attend | Без entitlement отметку ставит преподаватель вручную, по списку | build-artifact |
| hotspot | Подключение к сети класса по QR со стены — без него отметка не проходит | Только после действия ««Подключиться»» | Сценарий «Подключение к сети класса по QR со стены — без него отметка не проходит» на поверхности guestnet | Имя сети и пароль показываются текстом — вводится руками в Настройках | build-artifact |
| faceid | Замок на приложении: документы ученика и номер договора | Только после действия ««Включить Face ID»» | Сценарий «Замок на приложении: документы ученика и номер договора» на поверхности lock | Остаётся код-пароль устройства | contextual-gesture |
| autofill | Логины тренажёра билетов и кабинета группы подставляются в Safari без копирования | Только после действия ««Включить автозаполнение»» | Сценарий «Логины тренажёра билетов и кабинета группы подставляются в Safari без копирования» на поверхности passwords | Пароль остаётся копировать руками из карточки | contextual-gesture |
| push | Перенос занятия и освободившийся слот приходят уведомлением | Только после действия ««Включить уведомления»» | Сценарий «Перенос занятия и освободившийся слот приходят уведомлением» на поверхности notif | Изменения видны только при открытии приложения | contextual-gesture |
| commnotif | Сообщение инструктора приходит с аватаром и проходит через режим «За рулём» | Только после действия ««Показывать как сообщение»» | Сценарий «Сообщение инструктора приходит с аватаром и проходит через режим «За рулём»» на поверхности chat | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки Focus | build-artifact |
| remotenotif | Тихий пуш обновляет виджет и счётчик часов при закрытом приложении | Только после действия ««Тихие обновления»» | Сценарий «Тихий пуш обновляет виджет и счётчик часов при закрытом приложении» на поверхности bg | Виджет обновляется только при запуске приложения | app-lifecycle |
| bgtask | Два идентификатора: обновление расписания и догрузка аудио-разборов | Только после действия ««Проверить задачи»» | Сценарий «Два идентификатора: обновление расписания и догрузка аудио-разборов» на поверхности bg | Незарегистрированный идентификатор — задача не запустится вообще | app-lifecycle |
| appgroups | Виджет «Следующее занятие · 34 из 56 часов» и расширение автозаполнения видят данные приложения | Только после действия ««Виджет на экран „Домой“»» | Сценарий «Виджет «Следующее занятие · 34 из 56 часов» и расширение автозаполнения видят данные приложения» на поверхности menu | Без группы виджет пустой, а автозаполнение не видит записей — не ship | build-artifact |
| keychain | Одна сессия: из виджета приложение открывается уже войденным | Только после действия ««Открыть Накат» из виджета» | Сценарий «Одна сессия: из виджета приложение открывается уже войденным» на поверхности widget | Без общей группы вход придётся повторять в каждом расширении | build-artifact |

**Entitlements:** `com.apple.developer.networking.wifi-info`, `com.apple.developer.networking.HotspotConfiguration`, `aps-environment`, `com.apple.developer.usernotifications.communication`, `com.apple.security.application-groups`, `keychain-access-groups`
**Extension targets:** `credential-provider`, `notification-service`

## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product domain | Владеет сущностями и состояниями Учебный шаг | native/apps/nakat |
| Native runtime | Владеет системными разрешениями и lifecycle | native/Runtime |
| Visual language | Владеет семантической визуальной грамматикой | native/DesignSystem |

**Boundaries**
- Продуктовое состояние не живёт в визуальных примитивах
- Разрешения доступны только через причинное действие
- Web evidence не входит в native build graph

## Data, state, persistence, and integrations

**Entities**

- Курс
- Учебный шаг
- Занятие
- Ошибка билета

**State**

- Текущая сессия
- Жизненный цикл Учебный шаг
- Состояния разрешений и восстановления

**Persistence**

- Локальный черновик переживает перезапуск
- Защищённые значения используют системное хранилище только по capability contract

**Integrations**

- Вход по номеру телефона и сессия: SDK провайдера: <code>VK ID</code> либо Firebase Phone Auth, токен в Keychain общей группы
- Расписание, слоты, перенос занятия: Firestore со security rules: ученик пишет только свой слот, инструктор — только свои окна. Правила — конфигурация, не серверный код
- Звонок ученик ↔ инструктор без обмена номерами: SDK связи (LiveKit / Agora) плюс PushKit и CallKit: адресация по паре в учебной группе, номера в сигнализации не участвуют
- Уведомления о переносе и освободившемся слоте: Firebase Cloud Messaging; аватар инструктора подставляет Notification Service Extension
- Билеты и аудио-разборы: Статический пак <code>tickets.json</code> плюс аудио на CDN, только чтение. Догрузка — <code>BGProcessingTask</code> по Wi-Fi
- Голосовые заметки и расшифровка: Файл в контейнере приложения и CoreData; <code>SFSpeechRecognizer</code> с <code>requiresOnDeviceRecognition</code>
- Экзаменационные маршруты и точка посадки: MapKit и <code>MKLocalSearch</code>; треки маршрутов лежат в паке как данные и рисуются кодом
- Отметка присутствия на теории: Клиент: <code>CNCopyCurrentNetworkInfo</code> против SSID из профиля группы плюс геопозиция. Модерации нет
- Документы ученика: медсправка, договор: VisionKit-скан и PHPicker, файлы остаются на устройстве под замком Face ID — в облако не уходят
- Накатанные часы и ведомость теории: CoreData на устройстве: часы считаются по завершённым занятиям, ведомость — по отметкам
- Пароли учебных сервисов группы: Keychain общей группы плюс Credential Provider extension; записи публикует автошкола
- Монетизация без подписки: Рекламный SDK, ставки и креативы на стороне сети; ATT после экрана-объяснения

## Loading, empty, error, denied, and offline states

| State | Required behavior |
|---|---|
| loading | Сохранять контекст задачи и блокировать повторную отправку. |
| empty | Объяснить отсутствие учебный шаг и предложить первое полезное действие. |
| error | Назвать неуспешную операцию, сохранить ввод и дать повтор или альтернативу. |
| denied | Продолжить задачу через объявленный denied fallback. |
| offline | Показать сохранённые данные и явно отделить их от свежих. |

## Privacy, security, and trust

**Data inventory**

- Продуктовая единица «Учебный шаг»
- Профиль и выбранные связи
- Локальные состояния разрешений

**Privacy principles**

- Минимизация собираемых данных
- Причинный запрос системного доступа
- Равноправный fallback при отказе

**Retention.** Хранить данные только пока существует продуктовая задача или обязательный спорный период.

**Trust and safety risks**

- Злоупотребление взаимодействием
- Ложные или устаревшие данные
- Нежелательный контакт

**Controls**

- Идентифицированный профиль
- Жалоба и блокировка
- Ограничение видимости и срока

**Reporting.** Жалоба сохраняет контекст единицы и позволяет немедленно прекратить контакт.

## Accessibility and localization

**Accessibility**

- VoiceOver labels и логичный порядок чтения
- Hit targets не меньше 44 pt
- Accessibility XXXL без обрезания
- Reduce Motion
- Контраст и различимость без опоры только на цвет

**Locales:** ru

**Localization requirements**

- Все пользовательские строки в каталоге
- Проверять длинный русский текст и plural forms
- Permission copy совпадает с App Store notes

## Analytics event plan and success metrics

**Events**

- product_opened
- activation_completed
- core_loop_completed
- permission_requested
- permission_denied_fallback_used

**Success metrics**

- Доля обязательных учебных шагов, закрытых до внутреннего экзамена
- Повтор основного цикла
- Завершение задачи после denied fallback

**Core-loop hypothesis.** Связанный следующий шаг уменьшает незавершённость курса

**Validation plan.** Четырёхнедельный пилот с интервью завершивших и отказавшихся участников

## Testing, evidence, and capture plan

**Levels**

- Product artifact reproduction
- UX graph and state gates
- SwiftUI build
- Capture and independent review

**Evidence**

- Не выдавать web implementation за пользовательское исследование
- Проверить ключевые предположения на реальных участниках

**Capture identifiers**

- phone--default
- code--default
- codefail--default
- lessons--default
- lesson--default
- call--default
- pickup--default
- scan--default
- drive--default
- note--default
- reschedule--default
- chat--default
- lockscreen--default
- notif--default
- theory--default
- ticket--default
- player--default
- background--default
- checklist--default
- classroom--default
- attend--default
- guestnet--default
- scanwifi--default
- menu--default
- docs--default
- lock--default
- passwords--default
- fill--default
- widget--default
- bg--default
- ads--default

**Evidence provenance**

- nakat-web-evidence · user-input · observed · platform/concepts/nakat/concept.json and screens
- nakat-reference · reference-profile · approved · approved differentiation strategy
- nakat-market-assumption · assumption · needs-validation · curated migration portfolio; real research not yet supplied

## Setup, build, and run

**Prerequisites**

- Node 22
- Xcode и iOS simulator

**Build**

- `npm run build -- nakat`

**Run and verify**

- `npm run check -- nakat`
- `npm run capture -- nakat`

## Generated and owned file map

| Generated — do not hand-edit | Product-owned source |
|---|---|
| native/build/nakat<br>concepts/nakat/docs/developer-guide.md | concepts/nakat/concept.json<br>native/apps/nakat |

## Limitations, risks, and acceptance criteria

**Limitations**

- Market demand ещё не подтверждён
- Web screens являются migration evidence, а не native layout
- Медиа требуют отдельной проверки лицензии
- Physical device и VoiceOver остаются ручными воротами

**Risks**

- risk: Автошкола не поддерживает актуальное расписание; mitigation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; killSignal: Более 20% слотов расходятся с фактическими за месяц
- risk: Набор разрешений окажется шире реальной ценности; mitigation: Проверять каждое разрешение через достижимый flow; killSignal: Разрешение нельзя защитить наблюдаемым исходом

**Assumptions still requiring evidence**

- claim: Связанный следующий шаг уменьшает незавершённость курса; risk: high; validation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; status: needs-validation
- claim: Автошкола предоставляет актуальные билеты, разборы и расписание; risk: high; validation: Проверить supply и completion на пилотной когорте; status: needs-validation

**Acceptance criteria**

- Победитель воспроизводится из трёх кандидатов
- Все поверхности достижимы
- Каждое действие имеет исход
- Каждое разрешение имеет timing и fallback
- Critical flows покрыты сценариями

## App Store notes

- Заявленные разрешения соответствуют достижимым функциям
- Privacy labels не обещают отсутствующую инфраструктуру
- Никаких скрытых назначений доступов
- «Накат» ведёт курс категории B от первого занятия до внутреннего экзамена: 56 часов за рулём, 134 часа теории и расписание, которое переносят через день. Приложение для учеников автошколы и их инструкторов.
