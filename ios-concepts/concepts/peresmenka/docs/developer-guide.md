# Пересменка: developer product guide

> Generated from Product Contract `product-b9b9d2622bd023b1` and the compiled native manifest. Do not edit by hand.
> UX Specification: `ux-88b43bff3e828937`; source: `explicit-product-delivery`.
> Contract status: `mature`; maturity floor: `3/4`.

## Product vision and scope

**Thesis.** «Пересменка» делает Смену проверяемой единицей: назначение, подмена, отметка по сети точки, сдача и часы принадлежат одному жизненному циклу.

**Audience.** Линейный персонал кафе и ритейла: бариста, повара, кассиры, официанты на сменном графике

**Situation.** Вечер перед сменой: выйти нельзя, а график и договорённости живут в рабочем чате; у бариста, повара и кассира вся карьера состоит из смен, но нигде не записано, кто выходил, когда обещал, — а меняются сменами в чатах, раздавая личный номер незнакомым людям

**Job.** Линейный персонал кафе и ритейла: бариста, повара, кассиры, официанты на сменном графике wants to Не раскрывать номер и не спорить о факте выхода so that Закрыть смену подходящим человеком и получить подтверждённые часы без обмена телефонами.

**Wedge.** Смена связывает требования, подмену, выбранного человека, сетевую отметку и акт сдачи

**Observable differentiation.** Сотрудник принимает подмену, отмечается в сети точки и закрывает смену актом; measured by Доля подмен, завершившихся подтверждённой отметкой и сдачей; threshold: Не менее 30% активированных участников завершают основной исход в пилоте.

**In scope**

- Смена
- Точки рядом при устройстве и время в пути до открытой подмены
- Отметка смены засчитывается сетью заведения, а не словом сотрудника
- Подключение к сети незнакомой точки по QR из подсобки — без него отметка не засчитается
- Фото витрины, кассы и холодильника в акт передачи смены плюс сканер QR
- График из скриншота: приложение находит снимки экрана с расписанием и раскладывает их на смены
- Голосовой брифинг смены: что кончилось, что по акции, что передать вечерним
- Расшифровка брифинга в текст рядом с записью
- Брифинги слушают по дороге на смену: экран в кармане, на локскрине — Now Playing и ±15 секунд
- Уведомление, когда на выставленную смену откликнулись
- Сообщение сменщика приходит с аватаром и попадает в сводку Focus
- Звонок по смене без обмена номерами: телефон остаётся у владельца
- Перенос или отмена смены доезжает до виджета при закрытом приложении
- График и открытые подмены готовы к первому открытию — до смены их читают на ходу
- Идентификатор app.peresmenka.refresh — под ним планируется обновление графика
- Виджет «Ближайшая смена» и Share Extension видят данные приложения
- Одна сессия: из виджета приложение открывается уже войденным
- Логины точки — планшет доставки, табельный портал — подставляются в Safari без пересылки в чат
- Кто из ваших контактов уже здесь: с ними подмена закрывается первой
- Смены в системном календаре, с правкой при переносе и удалением при отмене
- Замок на разделе «Заработок»: ставка и часы не видны через плечо
- Объявления работодателей вместо платной подписки

**Non-goals**

- Публичная лента и подписки
- Отзывы и оценки людей вместо фактов из смен
- Обмен телефонами между сотрудниками
- Расчётный лист вместо бухгалтерии работодателя

## Domain glossary

| Term | Definition |
|---|---|
| Точка | Место работы с собственным графиком и подтверждаемой сетью. |
| Смена | Ограниченный рабочий интервал с назначением, отметкой и сдачей. |
| Подмена | Запрос передать назначенную Смену подходящему сотруднику. |
| Отметка | Подтверждённый факт начала или окончания Смены. |

## Personas and jobs

| Persona | Context | Job |
|---|---|---|
| Основной участник | Вечер перед сменой: выйти нельзя, а график и договорённости живут в рабочем чате | Закрыть смену подходящим человеком и получить подтверждённые часы без обмена телефонами |
| Контрагент | Сотрудники связаны общими точками, совместными сменами и подтверждёнными подменами | Ответить на смена и закрыть следующий шаг |
| Возвращающийся участник | Отметить приход и уход по сети заведения — из этих отметок считаются часы | Продолжить незавершённый смена |

## Core loop and critical flows

**Core loop:** Приближается смена или открыта подмена → Принять подходящую подмену и подтвердить фактический выход → Закрыть смену подходящим человеком и получить подтверждённые часы без обмена телефонами → Закрыть смену фактами отметки и сдачи.
**Habit loop:** Приближается смена или открыта подмена → Принять подходящую подмену и подтвердить фактический выход → Закрыть смену подходящим человеком и получить подтверждённые часы без обмена телефонами; cadence: Каждую рабочую неделю.
**Activation:** Сотрудник подтвердил первую смену или закрыл подмену; signal: verified-shift-ledger_activated; window: Первые семь дней.

| Flow | Trigger | Steps | Outcome |
|---|---|---|---|
| Весь продукт | phone | phone<br>code<br>codefail<br>join<br>manual<br>shifts<br>import<br>shift | Все 32 экрана и все 21 доступ набора |
| Вход и первая точка | phone | phone<br>code<br>codefail<br>join<br>manual<br>shifts | Номер, код из SMS и выбор заведения — по геопозиции или по коду от управляющего |
| День смены | shifts | shifts<br>shift<br>checkin<br>netqr<br>scan<br>handover<br>shoot<br>brief | Отметка по сети точки, подключение по QR и акт передачи со снимками |

## Information architecture and navigation

**Navigation model.** Продукт сохраняет идентифицированные связи и коммуникацию, но строит собственную задачно-ориентированную навигацию.
**Reference fit.** Профили, общие связи, чат и вызов знакомы, но собственная навигация организована вокруг Смены, а не ленты и подписок.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| join | push | code | parent:code<br>permission:join.location | present:null<br>navigate:open-manual<br>permission:location | capability.location.requested | pop:code |
| manual | push | join | parent:join<br>action:join.open-manual | mutate:complete-manual | always | pop:join |
| shifts | tab | — | tab:shifts<br>permission:background.bgtask<br>permission:widget.keychain | present:null<br>present:null<br>navigate:open-import<br>permission:photos | session.authenticated<br>capability.bgtask.requested<br>capability.keychain.requested | none:none |
| import | push | shifts | parent:shifts<br>action:shifts.open-import<br>permission:shifts.photos | mutate:complete-import | always<br>capability.photos.requested | pop:shifts |
| shift | push | shifts | parent:shifts<br>permission:shift.push<br>permission:shift.calendar | present:null<br>present:null<br>present:null<br>navigate:open-checkin<br>permission:push<br>permission:remotenotif<br>permission:calendar | capability.push.requested<br>capability.calendar.requested | pop:shifts |
| checkin | sheet | shift | parent:shift<br>action:shift.open-checkin<br>permission:checkin.wifiinfo | present:null<br>navigate:open-netqr<br>permission:wifiinfo | always<br>capability.wifiinfo.requested | dismiss:shift; interactive-or-action:shift |
| netqr | push | checkin | parent:checkin<br>action:checkin.open-netqr<br>permission:netqr.hotspot | present:null<br>navigate:open-scan<br>permission:hotspot | always<br>capability.hotspot.requested | pop:checkin |
| scan | push | netqr | parent:netqr<br>action:netqr.open-scan | mutate:complete-scan | always | pop:netqr |
| handover | push | shift | parent:shift | present:null<br>navigate:open-shoot<br>permission:camera | none | pop:shift |
| shoot | push | handover | parent:handover<br>action:handover.open-shoot<br>permission:handover.camera | mutate:complete-shoot | always<br>capability.camera.requested | pop:handover |
| brief | push | shift | parent:shift | present:null<br>present:null<br>navigate:open-record<br>permission:mic<br>permission:speech<br>permission:audio | none | pop:shift |
| record | sheet | brief | parent:brief<br>action:brief.open-record<br>permission:brief.mic<br>permission:brief.speech | mutate:complete-record | always<br>capability.mic.requested<br>capability.speech.requested | dismiss:brief; interactive-or-action:brief |
| player | push | brief | parent:brief<br>permission:brief.audio | mutate:complete-player | capability.audio.requested | pop:brief |
| swaps | tab | — | tab:swaps | present:null<br>navigate:open-swap | session.authenticated | none:none |
| swap | push | swaps | parent:swaps<br>action:swaps.open-swap | mutate:complete-swap | always | pop:swaps |
| people | tab | — | tab:people | present:null<br>present:null<br>navigate:open-mates<br>permission:contacts | session.authenticated | none:none |
| mates | push | people | parent:people<br>action:people.open-mates<br>permission:people.contacts | mutate:complete-mates | always<br>capability.contacts.requested | pop:people |
| person | push | people | parent:people | present:null<br>present:null<br>navigate:open-call<br>permission:voip | none | pop:people |
| call | push | person | parent:person<br>action:person.open-call<br>permission:person.voip | mutate:complete-call | always<br>capability.voip.requested | pop:person |
| chat | push | person | parent:person | present:null<br>navigate:open-lockscreen<br>permission:commnotif | none | pop:person |
| lockscreen | push | chat | parent:chat<br>action:chat.open-lockscreen<br>permission:chat.commnotif | mutate:complete-lockscreen | always<br>capability.commnotif.requested | pop:chat |
| menu | tab | — | tab:menu<br>permission:ads.tracking | present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-lock<br>permission:faceid | session.authenticated<br>capability.tracking.requested | none:none |
| lock | push | menu | parent:menu<br>action:menu.open-lock<br>permission:menu.faceid | mutate:complete-lock | always<br>capability.faceid.requested | pop:menu |
| money | push | menu | parent:menu | mutate:complete-money | none | pop:menu |
| passwords | push | menu | parent:menu | present:null<br>navigate:open-fill<br>permission:autofill | none | pop:menu |
| fill | push | passwords | parent:passwords<br>action:passwords.open-fill<br>permission:passwords.autofill | mutate:complete-fill | always<br>capability.autofill.requested | pop:passwords |
| settings | push | menu | parent:menu | present:null<br>present:null<br>present:null<br>navigate:open-background<br>permission:fetch<br>permission:appgroups | none | pop:menu |
| background | push | settings | parent:settings<br>action:settings.open-background<br>permission:shift.remotenotif<br>permission:settings.fetch | mutate:complete-background<br>permission:bgtask | always<br>capability.remotenotif.requested<br>capability.fetch.requested | pop:settings |
| widget | push | settings | parent:settings<br>permission:settings.appgroups | mutate:complete-widget<br>permission:keychain | capability.appgroups.requested | pop:settings |
| ads | sheet | settings | parent:settings | mutate:complete-ads<br>permission:tracking | none | dismiss:settings; interactive-or-action:settings |

## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Первый экран приложения | root | default<br>loading<br>error<br>offline | Открыть «Код из письма» → navigate:code |
| code | OTP · автоподстановка | push | default<br>loading<br>error<br>offline | Открыть «Неверный код» → navigate:codefail |
| codefail | Состояние ошибки OTP | push | default<br>loading<br>error<br>offline | Продолжить → mutate:codefail.completed |
| join | Location · точки рядом | push | default<br>loading<br>error<br>offline | Открыть «Код точки» → navigate:manual |
| manual | Fallback отказа в геопозиции | push | default<br>loading<br>error<br>offline | Продолжить → mutate:manual.completed |
| shifts | График недели · Photo Library | tab | default<br>loading<br>error<br>offline | Открыть «График из скриншотов» → navigate:import |
| import | Photo Library · Vision OCR | push | default<br>loading<br>error<br>offline | Продолжить → mutate:import.completed |
| shift | Push · Calendar · Remote notification | push | default<br>loading<br>error<br>offline | Открыть «Отметка на смене» → navigate:checkin |
| checkin | Wi-Fi Info · табель | sheet | default<br>loading<br>error<br>offline | Открыть «Сеть точки» → navigate:netqr |
| netqr | Hotspot · Camera | push | default<br>loading<br>error<br>offline | Открыть «Сканер QR» → navigate:scan |
| scan | DataScanner | push | default<br>loading<br>error<br>offline | Продолжить → mutate:scan.completed |
| handover | Camera · акт передачи | push | default<br>loading<br>error<br>offline | Открыть «Камера» → navigate:shoot |
| shoot | AVFoundation | push | default<br>loading<br>error<br>offline | Продолжить → mutate:shoot.completed |
| brief | Audio · Microphone · Speech | push | default<br>loading<br>error<br>offline | Открыть «Запись брифинга» → navigate:record |
| record | Microphone · Speech | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:record.completed |
| player | Now Playing · фоновое аудио | push | default<br>loading<br>error<br>offline | Продолжить → mutate:player.completed |
| swaps | Открытые смены · Location | tab | default<br>loading<br>error<br>offline | Открыть «Открытая смена» → navigate:swap |
| swap | Отклик на подмену | push | default<br>loading<br>error<br>offline | Продолжить → mutate:swap.completed |
| people | С кем работали · Contacts | tab | default<br>loading<br>error<br>offline | Открыть «Знакомые в сети» → navigate:mates |
| mates | Contacts · локальная сверка | push | default<br>loading<br>error<br>offline | Продолжить → mutate:mates.completed |
| person | Смены вместе · VoIP | push | default<br>loading<br>error<br>offline | Открыть «Звонок по смене» → navigate:call |
| call | CallKit · VoIP | push | default<br>loading<br>error<br>offline | Продолжить → mutate:call.completed |
| chat | Communication notification | push | default<br>loading<br>error<br>offline | Открыть «Экран блокировки» → navigate:lockscreen |
| lockscreen | Уведомление с аватаром | push | default<br>loading<br>error<br>offline | Продолжить → mutate:lockscreen.completed |
| menu | Разделы · Face ID | tab | default<br>loading<br>error<br>offline | Открыть «Замок Face ID» → navigate:lock |
| lock | LocalAuthentication | push | default<br>loading<br>error<br>offline | Продолжить → mutate:lock.completed |
| money | Часы и ставка за период | push | default<br>loading<br>error<br>offline | Продолжить → mutate:money.completed |
| passwords | AutoFill Credential Provider | push | default<br>loading<br>error<br>offline | Открыть «Автозаполнение в Safari» → navigate:fill |
| fill | ASCredentialProvider | push | default<br>loading<br>error<br>offline | Продолжить → mutate:fill.completed |
| settings | Фон · виджет · реклама | push | default<br>loading<br>error<br>offline | Открыть «Обновление в фоне» → navigate:background |
| background | Background fetch · BGTaskScheduler | push | default<br>loading<br>error<br>offline | Продолжить → mutate:background.completed |
| widget | App Groups · Keychain | push | default<br>loading<br>error<br>offline | Продолжить → mutate:widget.completed |
| ads | ATT после объяснения | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:ads.completed |

## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | open-code | open-code:navigate→code | screen.phone.state.loading.recovery | fixture.peresmenka.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | open-code | open-code:navigate→code | screen.phone.state.populated-default.recovery | fixture.peresmenka.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | open-code | open-code:navigate→code | screen.phone.state.error.recovery | fixture.peresmenka.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | open-code | open-code:navigate→code | screen.phone.state.offline.recovery | fixture.peresmenka.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.loading.recovery | fixture.peresmenka.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.populated-default.recovery | fixture.peresmenka.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.error.recovery | fixture.peresmenka.code.error |
| code | offline | yes | screen.code.state.offline.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.offline.recovery | fixture.peresmenka.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.loading.recovery | fixture.peresmenka.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.populated-default.recovery | fixture.peresmenka.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.error.recovery | fixture.peresmenka.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.offline.recovery | fixture.peresmenka.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| join | loading | yes | screen.join.state.loading.body | open-manual | open-manual:navigate→manual | screen.join.state.loading.recovery | fixture.peresmenka.join.loading |
| join | populated/default | yes | screen.join.state.populated-default.body | open-manual | open-manual:navigate→manual | screen.join.state.populated-default.recovery | fixture.peresmenka.join.default |
| join | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| join | error | yes | screen.join.state.error.body | open-manual | open-manual:navigate→manual | screen.join.state.error.recovery | fixture.peresmenka.join.error |
| join | offline | yes | screen.join.state.offline.body | open-manual | open-manual:navigate→manual | screen.join.state.offline.recovery | fixture.peresmenka.join.offline |
| join | permission-needed | yes | screen.join.state.permission-needed.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-needed.recovery | fixture.peresmenka.join.permission-needed |
| join | permission-denied | yes | screen.join.state.permission-denied.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-denied.recovery | fixture.peresmenka.join.permission-denied |
| join | permission-restricted | yes | screen.join.state.permission-restricted.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-restricted.recovery | fixture.peresmenka.join.permission-restricted |
| join | permission-limited | yes | screen.join.state.permission-limited.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-limited.recovery | fixture.peresmenka.join.permission-limited |
| manual | loading | yes | screen.manual.state.loading.body | complete-manual | complete-manual:mutate | screen.manual.state.loading.recovery | fixture.peresmenka.manual.loading |
| manual | populated/default | yes | screen.manual.state.populated-default.body | complete-manual | complete-manual:mutate | screen.manual.state.populated-default.recovery | fixture.peresmenka.manual.default |
| manual | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| manual | error | yes | screen.manual.state.error.body | complete-manual | complete-manual:mutate | screen.manual.state.error.recovery | fixture.peresmenka.manual.error |
| manual | offline | yes | screen.manual.state.offline.body | complete-manual | complete-manual:mutate | screen.manual.state.offline.recovery | fixture.peresmenka.manual.offline |
| manual | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shifts | loading | yes | screen.shifts.state.loading.body | open-import | open-import:navigate→import | screen.shifts.state.loading.recovery | fixture.peresmenka.shifts.loading |
| shifts | populated/default | yes | screen.shifts.state.populated-default.body | open-import | open-import:navigate→import | screen.shifts.state.populated-default.recovery | fixture.peresmenka.shifts.default |
| shifts | empty | yes | screen.shifts.state.empty.body | open-import | open-import:navigate→import | screen.shifts.state.empty.recovery | fixture.peresmenka.shifts.empty |
| shifts | error | yes | screen.shifts.state.error.body | open-import | open-import:navigate→import | screen.shifts.state.error.recovery | fixture.peresmenka.shifts.error |
| shifts | offline | yes | screen.shifts.state.offline.body | open-import | open-import:navigate→import | screen.shifts.state.offline.recovery | fixture.peresmenka.shifts.offline |
| shifts | permission-needed | yes | screen.shifts.state.permission-needed.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-needed.recovery | fixture.peresmenka.shifts.permission-needed |
| shifts | permission-denied | yes | screen.shifts.state.permission-denied.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-denied.recovery | fixture.peresmenka.shifts.permission-denied |
| shifts | permission-restricted | yes | screen.shifts.state.permission-restricted.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-restricted.recovery | fixture.peresmenka.shifts.permission-restricted |
| shifts | permission-limited | yes | screen.shifts.state.permission-limited.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-limited.recovery | fixture.peresmenka.shifts.permission-limited |
| import | loading | yes | screen.import.state.loading.body | complete-import | complete-import:mutate | screen.import.state.loading.recovery | fixture.peresmenka.import.loading |
| import | populated/default | yes | screen.import.state.populated-default.body | complete-import | complete-import:mutate | screen.import.state.populated-default.recovery | fixture.peresmenka.import.default |
| import | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| import | error | yes | screen.import.state.error.body | complete-import | complete-import:mutate | screen.import.state.error.recovery | fixture.peresmenka.import.error |
| import | offline | yes | screen.import.state.offline.body | complete-import | complete-import:mutate | screen.import.state.offline.recovery | fixture.peresmenka.import.offline |
| import | permission-needed | yes | screen.import.state.permission-needed.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-needed.recovery | fixture.peresmenka.import.permission-needed |
| import | permission-denied | yes | screen.import.state.permission-denied.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-denied.recovery | fixture.peresmenka.import.permission-denied |
| import | permission-restricted | yes | screen.import.state.permission-restricted.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-restricted.recovery | fixture.peresmenka.import.permission-restricted |
| import | permission-limited | yes | screen.import.state.permission-limited.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-limited.recovery | fixture.peresmenka.import.permission-limited |
| shift | loading | yes | screen.shift.state.loading.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.loading.recovery | fixture.peresmenka.shift.loading |
| shift | populated/default | yes | screen.shift.state.populated-default.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.populated-default.recovery | fixture.peresmenka.shift.default |
| shift | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shift | error | yes | screen.shift.state.error.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.error.recovery | fixture.peresmenka.shift.error |
| shift | offline | yes | screen.shift.state.offline.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.offline.recovery | fixture.peresmenka.shift.offline |
| shift | permission-needed | yes | screen.shift.state.permission-needed.body | open-checkin<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.calendar.fallback | open-checkin:navigate→checkin | screen.shift.state.permission-needed.recovery | fixture.peresmenka.shift.permission-needed |
| shift | permission-denied | yes | screen.shift.state.permission-denied.body | open-checkin<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.calendar.fallback | open-checkin:navigate→checkin | screen.shift.state.permission-denied.recovery | fixture.peresmenka.shift.permission-denied |
| shift | permission-restricted | yes | screen.shift.state.permission-restricted.body | open-checkin<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.calendar.fallback | open-checkin:navigate→checkin | screen.shift.state.permission-restricted.recovery | fixture.peresmenka.shift.permission-restricted |
| shift | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| checkin | loading | yes | screen.checkin.state.loading.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.loading.recovery | fixture.peresmenka.checkin.loading |
| checkin | populated/default | yes | screen.checkin.state.populated-default.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.populated-default.recovery | fixture.peresmenka.checkin.default |
| checkin | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| checkin | error | yes | screen.checkin.state.error.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.error.recovery | fixture.peresmenka.checkin.error |
| checkin | offline | yes | screen.checkin.state.offline.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.offline.recovery | fixture.peresmenka.checkin.offline |
| checkin | permission-needed | yes | screen.checkin.state.permission-needed.body | open-netqr<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.checkin.state.permission-needed.recovery | fixture.peresmenka.checkin.permission-needed |
| checkin | permission-denied | yes | screen.checkin.state.permission-denied.body | open-netqr<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.checkin.state.permission-denied.recovery | fixture.peresmenka.checkin.permission-denied |
| checkin | permission-restricted | yes | screen.checkin.state.permission-restricted.body | open-netqr<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.checkin.state.permission-restricted.recovery | fixture.peresmenka.checkin.permission-restricted |
| checkin | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | open-scan | open-scan:navigate→scan | screen.netqr.state.loading.recovery | fixture.peresmenka.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | open-scan | open-scan:navigate→scan | screen.netqr.state.populated-default.recovery | fixture.peresmenka.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | open-scan | open-scan:navigate→scan | screen.netqr.state.error.recovery | fixture.peresmenka.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | open-scan | open-scan:navigate→scan | screen.netqr.state.offline.recovery | fixture.peresmenka.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | open-scan<br>permission.hotspot.fallback | open-scan:navigate→scan | screen.netqr.state.permission-needed.recovery | fixture.peresmenka.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | open-scan<br>permission.hotspot.fallback | open-scan:navigate→scan | screen.netqr.state.permission-denied.recovery | fixture.peresmenka.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | open-scan<br>permission.hotspot.fallback | open-scan:navigate→scan | screen.netqr.state.permission-restricted.recovery | fixture.peresmenka.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| scan | loading | yes | screen.scan.state.loading.body | complete-scan | complete-scan:mutate | screen.scan.state.loading.recovery | fixture.peresmenka.scan.loading |
| scan | populated/default | yes | screen.scan.state.populated-default.body | complete-scan | complete-scan:mutate | screen.scan.state.populated-default.recovery | fixture.peresmenka.scan.default |
| scan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scan | error | yes | screen.scan.state.error.body | complete-scan | complete-scan:mutate | screen.scan.state.error.recovery | fixture.peresmenka.scan.error |
| scan | offline | yes | screen.scan.state.offline.body | complete-scan | complete-scan:mutate | screen.scan.state.offline.recovery | fixture.peresmenka.scan.offline |
| scan | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| handover | loading | yes | screen.handover.state.loading.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.loading.recovery | fixture.peresmenka.handover.loading |
| handover | populated/default | yes | screen.handover.state.populated-default.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.populated-default.recovery | fixture.peresmenka.handover.default |
| handover | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| handover | error | yes | screen.handover.state.error.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.error.recovery | fixture.peresmenka.handover.error |
| handover | offline | yes | screen.handover.state.offline.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.offline.recovery | fixture.peresmenka.handover.offline |
| handover | permission-needed | yes | screen.handover.state.permission-needed.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-needed.recovery | fixture.peresmenka.handover.permission-needed |
| handover | permission-denied | yes | screen.handover.state.permission-denied.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-denied.recovery | fixture.peresmenka.handover.permission-denied |
| handover | permission-restricted | yes | screen.handover.state.permission-restricted.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-restricted.recovery | fixture.peresmenka.handover.permission-restricted |
| handover | permission-limited | yes | screen.handover.state.permission-limited.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-limited.recovery | fixture.peresmenka.handover.permission-limited |
| shoot | loading | yes | screen.shoot.state.loading.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.loading.recovery | fixture.peresmenka.shoot.loading |
| shoot | populated/default | yes | screen.shoot.state.populated-default.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.populated-default.recovery | fixture.peresmenka.shoot.default |
| shoot | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shoot | error | yes | screen.shoot.state.error.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.error.recovery | fixture.peresmenka.shoot.error |
| shoot | offline | yes | screen.shoot.state.offline.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.offline.recovery | fixture.peresmenka.shoot.offline |
| shoot | permission-needed | yes | screen.shoot.state.permission-needed.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-needed.recovery | fixture.peresmenka.shoot.permission-needed |
| shoot | permission-denied | yes | screen.shoot.state.permission-denied.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-denied.recovery | fixture.peresmenka.shoot.permission-denied |
| shoot | permission-restricted | yes | screen.shoot.state.permission-restricted.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-restricted.recovery | fixture.peresmenka.shoot.permission-restricted |
| shoot | permission-limited | yes | screen.shoot.state.permission-limited.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-limited.recovery | fixture.peresmenka.shoot.permission-limited |
| brief | loading | yes | screen.brief.state.loading.body | open-record | open-record:navigate→record | screen.brief.state.loading.recovery | fixture.peresmenka.brief.loading |
| brief | populated/default | yes | screen.brief.state.populated-default.body | open-record | open-record:navigate→record | screen.brief.state.populated-default.recovery | fixture.peresmenka.brief.default |
| brief | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| brief | error | yes | screen.brief.state.error.body | open-record | open-record:navigate→record | screen.brief.state.error.recovery | fixture.peresmenka.brief.error |
| brief | offline | yes | screen.brief.state.offline.body | open-record | open-record:navigate→record | screen.brief.state.offline.recovery | fixture.peresmenka.brief.offline |
| brief | permission-needed | yes | screen.brief.state.permission-needed.body | open-record<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.audio.fallback | open-record:navigate→record | screen.brief.state.permission-needed.recovery | fixture.peresmenka.brief.permission-needed |
| brief | permission-denied | yes | screen.brief.state.permission-denied.body | open-record<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.audio.fallback | open-record:navigate→record | screen.brief.state.permission-denied.recovery | fixture.peresmenka.brief.permission-denied |
| brief | permission-restricted | yes | screen.brief.state.permission-restricted.body | open-record<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.audio.fallback | open-record:navigate→record | screen.brief.state.permission-restricted.recovery | fixture.peresmenka.brief.permission-restricted |
| brief | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| record | loading | yes | screen.record.state.loading.body | complete-record | complete-record:mutate | screen.record.state.loading.recovery | fixture.peresmenka.record.loading |
| record | populated/default | yes | screen.record.state.populated-default.body | complete-record | complete-record:mutate | screen.record.state.populated-default.recovery | fixture.peresmenka.record.default |
| record | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| record | error | yes | screen.record.state.error.body | complete-record | complete-record:mutate | screen.record.state.error.recovery | fixture.peresmenka.record.error |
| record | offline | yes | screen.record.state.offline.body | complete-record | complete-record:mutate | screen.record.state.offline.recovery | fixture.peresmenka.record.offline |
| record | permission-needed | yes | screen.record.state.permission-needed.body | complete-record<br>permission.mic.fallback<br>permission.speech.fallback | complete-record:mutate | screen.record.state.permission-needed.recovery | fixture.peresmenka.record.permission-needed |
| record | permission-denied | yes | screen.record.state.permission-denied.body | complete-record<br>permission.mic.fallback<br>permission.speech.fallback | complete-record:mutate | screen.record.state.permission-denied.recovery | fixture.peresmenka.record.permission-denied |
| record | permission-restricted | yes | screen.record.state.permission-restricted.body | complete-record<br>permission.mic.fallback<br>permission.speech.fallback | complete-record:mutate | screen.record.state.permission-restricted.recovery | fixture.peresmenka.record.permission-restricted |
| record | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| player | loading | yes | screen.player.state.loading.body | complete-player | complete-player:mutate | screen.player.state.loading.recovery | fixture.peresmenka.player.loading |
| player | populated/default | yes | screen.player.state.populated-default.body | complete-player | complete-player:mutate | screen.player.state.populated-default.recovery | fixture.peresmenka.player.default |
| player | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| player | error | yes | screen.player.state.error.body | complete-player | complete-player:mutate | screen.player.state.error.recovery | fixture.peresmenka.player.error |
| player | offline | yes | screen.player.state.offline.body | complete-player | complete-player:mutate | screen.player.state.offline.recovery | fixture.peresmenka.player.offline |
| player | permission-needed | yes | screen.player.state.permission-needed.body | complete-player<br>permission.audio.fallback | complete-player:mutate | screen.player.state.permission-needed.recovery | fixture.peresmenka.player.permission-needed |
| player | permission-denied | yes | screen.player.state.permission-denied.body | complete-player<br>permission.audio.fallback | complete-player:mutate | screen.player.state.permission-denied.recovery | fixture.peresmenka.player.permission-denied |
| player | permission-restricted | yes | screen.player.state.permission-restricted.body | complete-player<br>permission.audio.fallback | complete-player:mutate | screen.player.state.permission-restricted.recovery | fixture.peresmenka.player.permission-restricted |
| player | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| swaps | loading | yes | screen.swaps.state.loading.body | open-swap | open-swap:navigate→swap | screen.swaps.state.loading.recovery | fixture.peresmenka.swaps.loading |
| swaps | populated/default | yes | screen.swaps.state.populated-default.body | open-swap | open-swap:navigate→swap | screen.swaps.state.populated-default.recovery | fixture.peresmenka.swaps.default |
| swaps | empty | yes | screen.swaps.state.empty.body | open-swap | open-swap:navigate→swap | screen.swaps.state.empty.recovery | fixture.peresmenka.swaps.empty |
| swaps | error | yes | screen.swaps.state.error.body | open-swap | open-swap:navigate→swap | screen.swaps.state.error.recovery | fixture.peresmenka.swaps.error |
| swaps | offline | yes | screen.swaps.state.offline.body | open-swap | open-swap:navigate→swap | screen.swaps.state.offline.recovery | fixture.peresmenka.swaps.offline |
| swaps | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swaps | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swaps | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swaps | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| swap | loading | yes | screen.swap.state.loading.body | complete-swap | complete-swap:mutate | screen.swap.state.loading.recovery | fixture.peresmenka.swap.loading |
| swap | populated/default | yes | screen.swap.state.populated-default.body | complete-swap | complete-swap:mutate | screen.swap.state.populated-default.recovery | fixture.peresmenka.swap.default |
| swap | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| swap | error | yes | screen.swap.state.error.body | complete-swap | complete-swap:mutate | screen.swap.state.error.recovery | fixture.peresmenka.swap.error |
| swap | offline | yes | screen.swap.state.offline.body | complete-swap | complete-swap:mutate | screen.swap.state.offline.recovery | fixture.peresmenka.swap.offline |
| swap | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swap | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swap | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swap | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| people | loading | yes | screen.people.state.loading.body | open-mates | open-mates:navigate→mates | screen.people.state.loading.recovery | fixture.peresmenka.people.loading |
| people | populated/default | yes | screen.people.state.populated-default.body | open-mates | open-mates:navigate→mates | screen.people.state.populated-default.recovery | fixture.peresmenka.people.default |
| people | empty | yes | screen.people.state.empty.body | open-mates | open-mates:navigate→mates | screen.people.state.empty.recovery | fixture.peresmenka.people.empty |
| people | error | yes | screen.people.state.error.body | open-mates | open-mates:navigate→mates | screen.people.state.error.recovery | fixture.peresmenka.people.error |
| people | offline | yes | screen.people.state.offline.body | open-mates | open-mates:navigate→mates | screen.people.state.offline.recovery | fixture.peresmenka.people.offline |
| people | permission-needed | yes | screen.people.state.permission-needed.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-needed.recovery | fixture.peresmenka.people.permission-needed |
| people | permission-denied | yes | screen.people.state.permission-denied.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-denied.recovery | fixture.peresmenka.people.permission-denied |
| people | permission-restricted | yes | screen.people.state.permission-restricted.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-restricted.recovery | fixture.peresmenka.people.permission-restricted |
| people | permission-limited | yes | screen.people.state.permission-limited.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-limited.recovery | fixture.peresmenka.people.permission-limited |
| mates | loading | yes | screen.mates.state.loading.body | complete-mates | complete-mates:mutate | screen.mates.state.loading.recovery | fixture.peresmenka.mates.loading |
| mates | populated/default | yes | screen.mates.state.populated-default.body | complete-mates | complete-mates:mutate | screen.mates.state.populated-default.recovery | fixture.peresmenka.mates.default |
| mates | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| mates | error | yes | screen.mates.state.error.body | complete-mates | complete-mates:mutate | screen.mates.state.error.recovery | fixture.peresmenka.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | complete-mates | complete-mates:mutate | screen.mates.state.offline.recovery | fixture.peresmenka.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-needed.recovery | fixture.peresmenka.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-denied.recovery | fixture.peresmenka.mates.permission-denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-restricted.recovery | fixture.peresmenka.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-limited.recovery | fixture.peresmenka.mates.permission-limited |
| person | loading | yes | screen.person.state.loading.body | open-call | open-call:navigate→call | screen.person.state.loading.recovery | fixture.peresmenka.person.loading |
| person | populated/default | yes | screen.person.state.populated-default.body | open-call | open-call:navigate→call | screen.person.state.populated-default.recovery | fixture.peresmenka.person.default |
| person | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| person | error | yes | screen.person.state.error.body | open-call | open-call:navigate→call | screen.person.state.error.recovery | fixture.peresmenka.person.error |
| person | offline | yes | screen.person.state.offline.body | open-call | open-call:navigate→call | screen.person.state.offline.recovery | fixture.peresmenka.person.offline |
| person | permission-needed | yes | screen.person.state.permission-needed.body | open-call<br>permission.voip.fallback | open-call:navigate→call | screen.person.state.permission-needed.recovery | fixture.peresmenka.person.permission-needed |
| person | permission-denied | yes | screen.person.state.permission-denied.body | open-call<br>permission.voip.fallback | open-call:navigate→call | screen.person.state.permission-denied.recovery | fixture.peresmenka.person.permission-denied |
| person | permission-restricted | yes | screen.person.state.permission-restricted.body | open-call<br>permission.voip.fallback | open-call:navigate→call | screen.person.state.permission-restricted.recovery | fixture.peresmenka.person.permission-restricted |
| person | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.peresmenka.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.peresmenka.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.peresmenka.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.peresmenka.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.peresmenka.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.peresmenka.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.peresmenka.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.loading.recovery | fixture.peresmenka.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.populated-default.recovery | fixture.peresmenka.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.error.recovery | fixture.peresmenka.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.offline.recovery | fixture.peresmenka.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-needed.recovery | fixture.peresmenka.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-denied.recovery | fixture.peresmenka.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-restricted.recovery | fixture.peresmenka.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lockscreen | loading | yes | screen.lockscreen.state.loading.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.loading.recovery | fixture.peresmenka.lockscreen.loading |
| lockscreen | populated/default | yes | screen.lockscreen.state.populated-default.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.populated-default.recovery | fixture.peresmenka.lockscreen.default |
| lockscreen | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lockscreen | error | yes | screen.lockscreen.state.error.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.error.recovery | fixture.peresmenka.lockscreen.error |
| lockscreen | offline | yes | screen.lockscreen.state.offline.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.offline.recovery | fixture.peresmenka.lockscreen.offline |
| lockscreen | permission-needed | yes | screen.lockscreen.state.permission-needed.body | complete-lockscreen<br>permission.commnotif.fallback | complete-lockscreen:mutate | screen.lockscreen.state.permission-needed.recovery | fixture.peresmenka.lockscreen.permission-needed |
| lockscreen | permission-denied | yes | screen.lockscreen.state.permission-denied.body | complete-lockscreen<br>permission.commnotif.fallback | complete-lockscreen:mutate | screen.lockscreen.state.permission-denied.recovery | fixture.peresmenka.lockscreen.permission-denied |
| lockscreen | permission-restricted | yes | screen.lockscreen.state.permission-restricted.body | complete-lockscreen<br>permission.commnotif.fallback | complete-lockscreen:mutate | screen.lockscreen.state.permission-restricted.recovery | fixture.peresmenka.lockscreen.permission-restricted |
| lockscreen | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| menu | loading | yes | screen.menu.state.loading.body | open-lock | open-lock:navigate→lock | screen.menu.state.loading.recovery | fixture.peresmenka.menu.loading |
| menu | populated/default | yes | screen.menu.state.populated-default.body | open-lock | open-lock:navigate→lock | screen.menu.state.populated-default.recovery | fixture.peresmenka.menu.default |
| menu | empty | yes | screen.menu.state.empty.body | open-lock | open-lock:navigate→lock | screen.menu.state.empty.recovery | fixture.peresmenka.menu.empty |
| menu | error | yes | screen.menu.state.error.body | open-lock | open-lock:navigate→lock | screen.menu.state.error.recovery | fixture.peresmenka.menu.error |
| menu | offline | yes | screen.menu.state.offline.body | open-lock | open-lock:navigate→lock | screen.menu.state.offline.recovery | fixture.peresmenka.menu.offline |
| menu | permission-needed | yes | screen.menu.state.permission-needed.body | open-lock<br>permission.faceid.fallback<br>permission.tracking.fallback | open-lock:navigate→lock | screen.menu.state.permission-needed.recovery | fixture.peresmenka.menu.permission-needed |
| menu | permission-denied | yes | screen.menu.state.permission-denied.body | open-lock<br>permission.faceid.fallback<br>permission.tracking.fallback | open-lock:navigate→lock | screen.menu.state.permission-denied.recovery | fixture.peresmenka.menu.permission-denied |
| menu | permission-restricted | yes | screen.menu.state.permission-restricted.body | open-lock<br>permission.faceid.fallback<br>permission.tracking.fallback | open-lock:navigate→lock | screen.menu.state.permission-restricted.recovery | fixture.peresmenka.menu.permission-restricted |
| menu | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.peresmenka.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.peresmenka.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.peresmenka.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.peresmenka.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.peresmenka.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.peresmenka.lock.permission-denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.peresmenka.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| money | loading | yes | screen.money.state.loading.body | complete-money | complete-money:mutate | screen.money.state.loading.recovery | fixture.peresmenka.money.loading |
| money | populated/default | yes | screen.money.state.populated-default.body | complete-money | complete-money:mutate | screen.money.state.populated-default.recovery | fixture.peresmenka.money.default |
| money | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| money | error | yes | screen.money.state.error.body | complete-money | complete-money:mutate | screen.money.state.error.recovery | fixture.peresmenka.money.error |
| money | offline | yes | screen.money.state.offline.body | complete-money | complete-money:mutate | screen.money.state.offline.recovery | fixture.peresmenka.money.offline |
| money | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| money | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| money | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| money | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| passwords | loading | yes | screen.passwords.state.loading.body | open-fill | open-fill:navigate→fill | screen.passwords.state.loading.recovery | fixture.peresmenka.passwords.loading |
| passwords | populated/default | yes | screen.passwords.state.populated-default.body | open-fill | open-fill:navigate→fill | screen.passwords.state.populated-default.recovery | fixture.peresmenka.passwords.default |
| passwords | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| passwords | error | yes | screen.passwords.state.error.body | open-fill | open-fill:navigate→fill | screen.passwords.state.error.recovery | fixture.peresmenka.passwords.error |
| passwords | offline | yes | screen.passwords.state.offline.body | open-fill | open-fill:navigate→fill | screen.passwords.state.offline.recovery | fixture.peresmenka.passwords.offline |
| passwords | permission-needed | yes | screen.passwords.state.permission-needed.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-needed.recovery | fixture.peresmenka.passwords.permission-needed |
| passwords | permission-denied | yes | screen.passwords.state.permission-denied.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-denied.recovery | fixture.peresmenka.passwords.permission-denied |
| passwords | permission-restricted | yes | screen.passwords.state.permission-restricted.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-restricted.recovery | fixture.peresmenka.passwords.permission-restricted |
| passwords | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | yes | screen.fill.state.loading.body | complete-fill | complete-fill:mutate | screen.fill.state.loading.recovery | fixture.peresmenka.fill.loading |
| fill | populated/default | yes | screen.fill.state.populated-default.body | complete-fill | complete-fill:mutate | screen.fill.state.populated-default.recovery | fixture.peresmenka.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | yes | screen.fill.state.error.body | complete-fill | complete-fill:mutate | screen.fill.state.error.recovery | fixture.peresmenka.fill.error |
| fill | offline | yes | screen.fill.state.offline.body | complete-fill | complete-fill:mutate | screen.fill.state.offline.recovery | fixture.peresmenka.fill.offline |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-needed.recovery | fixture.peresmenka.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-denied.recovery | fixture.peresmenka.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-restricted.recovery | fixture.peresmenka.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| settings | loading | yes | screen.settings.state.loading.body | open-background | open-background:navigate→background | screen.settings.state.loading.recovery | fixture.peresmenka.settings.loading |
| settings | populated/default | yes | screen.settings.state.populated-default.body | open-background | open-background:navigate→background | screen.settings.state.populated-default.recovery | fixture.peresmenka.settings.default |
| settings | empty | yes | screen.settings.state.empty.body | open-background | open-background:navigate→background | screen.settings.state.empty.recovery | fixture.peresmenka.settings.empty |
| settings | error | yes | screen.settings.state.error.body | open-background | open-background:navigate→background | screen.settings.state.error.recovery | fixture.peresmenka.settings.error |
| settings | offline | yes | screen.settings.state.offline.body | open-background | open-background:navigate→background | screen.settings.state.offline.recovery | fixture.peresmenka.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | open-background<br>permission.fetch.fallback<br>permission.appgroups.fallback | open-background:navigate→background | screen.settings.state.permission-needed.recovery | fixture.peresmenka.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | open-background<br>permission.fetch.fallback<br>permission.appgroups.fallback | open-background:navigate→background | screen.settings.state.permission-denied.recovery | fixture.peresmenka.settings.permission-denied |
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | open-background<br>permission.fetch.fallback<br>permission.appgroups.fallback | open-background:navigate→background | screen.settings.state.permission-restricted.recovery | fixture.peresmenka.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | complete-background | complete-background:mutate | screen.background.state.loading.recovery | fixture.peresmenka.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | complete-background | complete-background:mutate | screen.background.state.populated-default.recovery | fixture.peresmenka.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | complete-background | complete-background:mutate | screen.background.state.error.recovery | fixture.peresmenka.background.error |
| background | offline | yes | screen.background.state.offline.body | complete-background | complete-background:mutate | screen.background.state.offline.recovery | fixture.peresmenka.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | complete-background<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.bgtask.fallback | complete-background:mutate | screen.background.state.permission-needed.recovery | fixture.peresmenka.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | complete-background<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.bgtask.fallback | complete-background:mutate | screen.background.state.permission-denied.recovery | fixture.peresmenka.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | complete-background<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.bgtask.fallback | complete-background:mutate | screen.background.state.permission-restricted.recovery | fixture.peresmenka.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | yes | screen.widget.state.loading.body | complete-widget | complete-widget:mutate | screen.widget.state.loading.recovery | fixture.peresmenka.widget.loading |
| widget | populated/default | yes | screen.widget.state.populated-default.body | complete-widget | complete-widget:mutate | screen.widget.state.populated-default.recovery | fixture.peresmenka.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | yes | screen.widget.state.error.body | complete-widget | complete-widget:mutate | screen.widget.state.error.recovery | fixture.peresmenka.widget.error |
| widget | offline | yes | screen.widget.state.offline.body | complete-widget | complete-widget:mutate | screen.widget.state.offline.recovery | fixture.peresmenka.widget.offline |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-needed.recovery | fixture.peresmenka.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-denied.recovery | fixture.peresmenka.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-restricted.recovery | fixture.peresmenka.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.peresmenka.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.peresmenka.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.peresmenka.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.peresmenka.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.peresmenka.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.peresmenka.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.peresmenka.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |

## Design tokens and semantic component roles

**SwiftUI environment:** `NativeVisualLanguage`. SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.

| Token | Value |
|---|---|
| accent | #4D7C0F |
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
| join | task-intro<br>form<br>primary-action |
| manual | task-intro<br>form<br>primary-action |
| shifts | collection<br>filters |
| import | summary<br>content<br>next-action |
| shift | summary<br>content<br>next-action |
| checkin | summary<br>content<br>next-action |
| netqr | summary<br>content<br>next-action |
| scan | task-intro<br>form<br>primary-action |
| handover | task-intro<br>form<br>primary-action |
| shoot | task-intro<br>form<br>primary-action |
| brief | summary<br>content<br>next-action |
| record | task-intro<br>form<br>primary-action |
| player | summary<br>content<br>next-action |
| swaps | collection<br>filters |
| swap | summary<br>content<br>next-action |
| people | collection<br>filters |
| mates | summary<br>content<br>next-action |
| person | summary<br>content<br>next-action |
| call | chat<br>message-list<br>composer |
| chat | chat<br>message-list<br>composer |
| lockscreen | summary<br>content<br>next-action |
| menu | collection<br>filters |
| lock | summary<br>content<br>next-action |
| money | summary<br>content<br>next-action |
| passwords | summary<br>content<br>next-action |
| fill | summary<br>content<br>next-action |
| settings | collection<br>filters |
| background | summary<br>content<br>next-action |
| widget | summary<br>content<br>next-action |
| ads | summary<br>content<br>next-action |

## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.menu.label | Меню | none | Root tab label | menu | navigation |
| navigation.tab.people.label | Люди | none | Root tab label | people | navigation |
| navigation.tab.shifts.label | Смены | none | Root tab label | shifts | navigation |
| navigation.tab.swaps.label | Подмены | none | Root tab label | swaps | navigation |
| permission.appgroups.body | Entitlement без системного запроса: виджет и расширения читают данные приложения. | none | System permission explanation | settings<br>widget | permission |
| permission.appgroups.fallback | Без группы виджет пустой, а пересланная в рабочий чат смена не доходит — не ship | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | settings<br>widget | permission |
| permission.audio.body | Entitlement без системного запроса: брифинг продолжает играть с погашенным экраном и управляется с локскрина. | none | System permission explanation | brief<br>player | permission |
| permission.audio.fallback | Без режима звук обрывается при блокировке — брифинг придётся слушать с открытым экраном | none | Denied fallback | player | recovery |
| permission.audio.title | Фоновое воспроизведение | none | System permission pre-prompt title | brief<br>player | permission |
| permission.autofill.body | Entitlement без системного запроса: рабочие логины точки подставляются в Safari системным автозаполнением. | none | System permission explanation | passwords<br>fill | permission |
| permission.autofill.fallback | Логин остаётся копировать руками из карточки точки | none | Denied fallback | fill | recovery |
| permission.autofill.title | Автозаполнение паролей | none | System permission pre-prompt title | passwords<br>fill | permission |
| permission.bgtask.body | Entitlement без системного запроса: app.peresmenka.refresh объявлен в Info.plist и зарегистрирован в коде. | none | System permission explanation | background<br>shifts | permission |
| permission.bgtask.fallback | Незарегистрированный идентификатор — задача не запустится вообще | none | Denied fallback | shifts | recovery |
| permission.bgtask.title | Идентификатор фоновой задачи | none | System permission pre-prompt title | background<br>shifts | permission |
| permission.calendar.body | Чтобы положить смены в календарь, а при переносе — поправить уже добавленное событие. | none | System permission explanation | shift | permission |
| permission.calendar.fallback | Смена остаётся внутри «Пересменки», с напоминанием за час в приложении | none | Denied fallback | shift | recovery |
| permission.calendar.title | «Пересменка» запрашивает доступ к календарю | none | System permission pre-prompt title | shift | permission |
| permission.camera.body | Чтобы снять зал и витрину при сдаче смены и считать QR рабочей сети. | none | System permission explanation | handover<br>shoot | permission |
| permission.camera.fallback | Акт передачи заполняется галочками без снимков, сеть вводится руками | none | Denied fallback | shoot | recovery |
| permission.camera.title | «Пересменка» запрашивает доступ к камере | none | System permission pre-prompt title | handover<br>shoot | permission |
| permission.commnotif.body | Entitlement без системного запроса: сообщение сменщика показывается с его аватаром. | none | System permission explanation | chat<br>lockscreen | permission |
| permission.commnotif.fallback | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки | none | Denied fallback | lockscreen | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat<br>lockscreen | permission |
| permission.contacts.body | Чтобы показать, с кем из ваших знакомых вы уже работали. Книга не покидает устройство. | none | System permission explanation | people<br>mates | permission |
| permission.contacts.fallback | Остаётся поиск по точке и по общим сменам | none | Denied fallback | mates | recovery |
| permission.contacts.title | «Пересменка» запрашивает доступ к контактам | none | System permission pre-prompt title | people<br>mates | permission |
| permission.faceid.body | Чтобы закрыть раздел заработка: там ставка за час, отработанные часы и долги по сменам. | none | System permission explanation | menu<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Пересменка» запрашивает использование Face ID | none | System permission pre-prompt title | menu<br>lock | permission |
| permission.fetch.body | Entitlement без системного запроса: график на неделю и свежие подмены подтягиваются к утру. | none | System permission explanation | settings<br>background | permission |
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
| scenario.signin.failure.name | Вход и первая точка: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts | acceptance |
| scenario.signin.happy.name | Вход и первая точка: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts | acceptance |
| scenario.signin.offline.name | Вход и первая точка: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts | acceptance |
| scenario.signin.persistence.name | Вход и первая точка: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>join<br>manual<br>shifts | acceptance |
| screen.ads.action.complete-ads.label | Продолжить | none | Action label | ads | control |
| screen.ads.purpose | ATT после объяснения | none | Product task | ads | accessibility-and-docs |
| screen.ads.state.error.body | Не удалось обновить «Объявления». Введённые данные сохранены; повторите попытку. | none | State copy: error | ads | state-body |
| screen.ads.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ads | recovery |
| screen.ads.state.loading.body | Обновляем данные раздела «Объявления»; текущий контекст остаётся доступен. | none | State copy: loading | ads | state-body |
| screen.ads.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | ads | recovery |
| screen.ads.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | ads | state-body |
| screen.ads.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | ads | recovery |
| screen.ads.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | ads | state-body |
| screen.ads.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | ads | recovery |
| screen.ads.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | ads | state-body |
| screen.ads.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | ads | recovery |
| screen.ads.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | ads | state-body |
| screen.ads.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | ads | recovery |
| screen.ads.state.populated-default.body | Актуальные данные раздела «Объявления» готовы к следующему действию. | none | State copy: populated/default | ads | state-body |
| screen.ads.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | ads | recovery |
| screen.ads.title | Объявления | none | Surface title | ads | navigation-title |
| screen.background.action.complete-background.label | Продолжить | none | Action label | background | control |
| screen.background.purpose | Background fetch · BGTaskScheduler | none | Product task | background | accessibility-and-docs |
| screen.background.state.error.body | Не удалось обновить «Обновление в фоне». Введённые данные сохранены; повторите попытку. | none | State copy: error | background | state-body |
| screen.background.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | background | recovery |
| screen.background.state.loading.body | Обновляем данные раздела «Обновление в фоне»; текущий контекст остаётся доступен. | none | State copy: loading | background | state-body |
| screen.background.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | background | recovery |
| screen.background.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | background | state-body |
| screen.background.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | background | recovery |
| screen.background.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | background | state-body |
| screen.background.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | background | recovery |
| screen.background.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | background | state-body |
| screen.background.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | background | recovery |
| screen.background.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | background | state-body |
| screen.background.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | background | recovery |
| screen.background.state.populated-default.body | Актуальные данные раздела «Обновление в фоне» готовы к следующему действию. | none | State copy: populated/default | background | state-body |
| screen.background.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | background | recovery |
| screen.background.title | Обновление в фоне | none | Surface title | background | navigation-title |
| screen.brief.action.open-record.label | Открыть «Запись брифинга» | none | Action label | brief | control |
| screen.brief.purpose | Audio · Microphone · Speech | none | Product task | brief | accessibility-and-docs |
| screen.brief.state.error.body | Не удалось обновить «Брифинг смены». Введённые данные сохранены; повторите попытку. | none | State copy: error | brief | state-body |
| screen.brief.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | brief | recovery |
| screen.brief.state.loading.body | Обновляем данные раздела «Брифинг смены»; текущий контекст остаётся доступен. | none | State copy: loading | brief | state-body |
| screen.brief.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | brief | recovery |
| screen.brief.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | brief | state-body |
| screen.brief.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | brief | recovery |
| screen.brief.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | brief | state-body |
| screen.brief.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | brief | recovery |
| screen.brief.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | brief | state-body |
| screen.brief.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | brief | recovery |
| screen.brief.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | brief | state-body |
| screen.brief.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | brief | recovery |
| screen.brief.state.populated-default.body | Актуальные данные раздела «Брифинг смены» готовы к следующему действию. | none | State copy: populated/default | brief | state-body |
| screen.brief.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | brief | recovery |
| screen.brief.title | Брифинг смены | none | Surface title | brief | navigation-title |
| screen.call.action.complete-call.label | Продолжить | none | Action label | call | control |
| screen.call.purpose | CallKit · VoIP | none | Product task | call | accessibility-and-docs |
| screen.call.state.error.body | Не удалось обновить «Звонок по смене». Введённые данные сохранены; повторите попытку. | none | State copy: error | call | state-body |
| screen.call.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | call | recovery |
| screen.call.state.loading.body | Обновляем данные раздела «Звонок по смене»; текущий контекст остаётся доступен. | none | State copy: loading | call | state-body |
| screen.call.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | call | recovery |
| screen.call.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | call | state-body |
| screen.call.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | call | recovery |
| screen.call.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | call | state-body |
| screen.call.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | call | recovery |
| screen.call.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | call | state-body |
| screen.call.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | call | recovery |
| screen.call.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | call | state-body |
| screen.call.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | call | recovery |
| screen.call.state.populated-default.body | Актуальные данные раздела «Звонок по смене» готовы к следующему действию. | none | State copy: populated/default | call | state-body |
| screen.call.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | call | recovery |
| screen.call.title | Звонок по смене | none | Surface title | call | navigation-title |
| screen.chat.action.open-lockscreen.label | Открыть «Экран блокировки» | none | Action label | chat | control |
| screen.chat.purpose | Communication notification | none | Product task | chat | accessibility-and-docs |
| screen.chat.state.error.body | Не удалось обновить «Переписка». Введённые данные сохранены; повторите попытку. | none | State copy: error | chat | state-body |
| screen.chat.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chat | recovery |
| screen.chat.state.loading.body | Обновляем данные раздела «Переписка»; текущий контекст остаётся доступен. | none | State copy: loading | chat | state-body |
| screen.chat.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chat | recovery |
| screen.chat.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | chat | state-body |
| screen.chat.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chat | recovery |
| screen.chat.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chat | state-body |
| screen.chat.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chat | recovery |
| screen.chat.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chat | state-body |
| screen.chat.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chat | recovery |
| screen.chat.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chat | state-body |
| screen.chat.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chat | recovery |
| screen.chat.state.populated-default.body | Актуальные данные раздела «Переписка» готовы к следующему действию. | none | State copy: populated/default | chat | state-body |
| screen.chat.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chat | recovery |
| screen.chat.title | Переписка | none | Surface title | chat | navigation-title |
| screen.checkin.action.open-netqr.label | Открыть «Сеть точки» | none | Action label | checkin | control |
| screen.checkin.purpose | Wi-Fi Info · табель | none | Product task | checkin | accessibility-and-docs |
| screen.checkin.state.error.body | Не удалось обновить «Отметка на смене». Введённые данные сохранены; повторите попытку. | none | State copy: error | checkin | state-body |
| screen.checkin.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | checkin | recovery |
| screen.checkin.state.loading.body | Обновляем данные раздела «Отметка на смене»; текущий контекст остаётся доступен. | none | State copy: loading | checkin | state-body |
| screen.checkin.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | checkin | recovery |
| screen.checkin.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | checkin | state-body |
| screen.checkin.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | checkin | recovery |
| screen.checkin.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | checkin | state-body |
| screen.checkin.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | checkin | recovery |
| screen.checkin.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | checkin | state-body |
| screen.checkin.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | checkin | recovery |
| screen.checkin.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | checkin | state-body |
| screen.checkin.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | checkin | recovery |
| screen.checkin.state.populated-default.body | Актуальные данные раздела «Отметка на смене» готовы к следующему действию. | none | State copy: populated/default | checkin | state-body |
| screen.checkin.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | checkin | recovery |
| screen.checkin.title | Отметка на смене | none | Surface title | checkin | navigation-title |
| screen.code.action.open-codefail.label | Открыть «Неверный код» | none | Action label | code | control |
| screen.code.purpose | OTP · автоподстановка | none | Product task | code | accessibility-and-docs |
| screen.code.state.error.body | Не удалось обновить «Код из письма». Введённые данные сохранены; повторите попытку. | none | State copy: error | code | state-body |
| screen.code.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | code | recovery |
| screen.code.state.loading.body | Обновляем данные раздела «Код из письма»; текущий контекст остаётся доступен. | none | State copy: loading | code | state-body |
| screen.code.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | code | recovery |
| screen.code.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | code | state-body |
| screen.code.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | code | recovery |
| screen.code.state.populated-default.body | Актуальные данные раздела «Код из письма» готовы к следующему действию. | none | State copy: populated/default | code | state-body |
| screen.code.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | code | recovery |
| screen.code.title | Код из письма | none | Surface title | code | navigation-title |
| screen.codefail.action.complete-codefail.label | Продолжить | none | Action label | codefail | control |
| screen.codefail.purpose | Состояние ошибки OTP | none | Product task | codefail | accessibility-and-docs |
| screen.codefail.state.error.body | Не удалось обновить «Неверный код». Введённые данные сохранены; повторите попытку. | none | State copy: error | codefail | state-body |
| screen.codefail.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | codefail | recovery |
| screen.codefail.state.loading.body | Обновляем данные раздела «Неверный код»; текущий контекст остаётся доступен. | none | State copy: loading | codefail | state-body |
| screen.codefail.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | codefail | recovery |
| screen.codefail.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | codefail | state-body |
| screen.codefail.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | codefail | recovery |
| screen.codefail.state.populated-default.body | Актуальные данные раздела «Неверный код» готовы к следующему действию. | none | State copy: populated/default | codefail | state-body |
| screen.codefail.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | codefail | recovery |
| screen.codefail.title | Неверный код | none | Surface title | codefail | navigation-title |
| screen.fill.action.complete-fill.label | Продолжить | none | Action label | fill | control |
| screen.fill.purpose | ASCredentialProvider | none | Product task | fill | accessibility-and-docs |
| screen.fill.state.error.body | Не удалось обновить «Автозаполнение в Safari». Введённые данные сохранены; повторите попытку. | none | State copy: error | fill | state-body |
| screen.fill.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | fill | recovery |
| screen.fill.state.loading.body | Обновляем данные раздела «Автозаполнение в Safari»; текущий контекст остаётся доступен. | none | State copy: loading | fill | state-body |
| screen.fill.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | fill | recovery |
| screen.fill.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | fill | state-body |
| screen.fill.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | fill | recovery |
| screen.fill.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | fill | state-body |
| screen.fill.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | fill | recovery |
| screen.fill.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | fill | state-body |
| screen.fill.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | fill | recovery |
| screen.fill.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | fill | state-body |
| screen.fill.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | fill | recovery |
| screen.fill.state.populated-default.body | Актуальные данные раздела «Автозаполнение в Safari» готовы к следующему действию. | none | State copy: populated/default | fill | state-body |
| screen.fill.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | fill | recovery |
| screen.fill.title | Автозаполнение в Safari | none | Surface title | fill | navigation-title |
| screen.handover.action.open-shoot.label | Открыть «Камера» | none | Action label | handover | control |
| screen.handover.purpose | Camera · акт передачи | none | Product task | handover | accessibility-and-docs |
| screen.handover.state.error.body | Не удалось обновить «Сдача смены». Введённые данные сохранены; повторите попытку. | none | State copy: error | handover | state-body |
| screen.handover.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | handover | recovery |
| screen.handover.state.loading.body | Обновляем данные раздела «Сдача смены»; текущий контекст остаётся доступен. | none | State copy: loading | handover | state-body |
| screen.handover.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | handover | recovery |
| screen.handover.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | handover | state-body |
| screen.handover.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | handover | recovery |
| screen.handover.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | handover | state-body |
| screen.handover.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | handover | recovery |
| screen.handover.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | handover | state-body |
| screen.handover.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | handover | recovery |
| screen.handover.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | handover | state-body |
| screen.handover.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | handover | recovery |
| screen.handover.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | handover | state-body |
| screen.handover.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | handover | recovery |
| screen.handover.state.populated-default.body | Актуальные данные раздела «Сдача смены» готовы к следующему действию. | none | State copy: populated/default | handover | state-body |
| screen.handover.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | handover | recovery |
| screen.handover.title | Сдача смены | none | Surface title | handover | navigation-title |
| screen.import.action.complete-import.label | Продолжить | none | Action label | import | control |
| screen.import.purpose | Photo Library · Vision OCR | none | Product task | import | accessibility-and-docs |
| screen.import.state.error.body | Не удалось обновить «График из скриншотов». Введённые данные сохранены; повторите попытку. | none | State copy: error | import | state-body |
| screen.import.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | import | recovery |
| screen.import.state.loading.body | Обновляем данные раздела «График из скриншотов»; текущий контекст остаётся доступен. | none | State copy: loading | import | state-body |
| screen.import.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | import | recovery |
| screen.import.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | import | state-body |
| screen.import.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | import | recovery |
| screen.import.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | import | state-body |
| screen.import.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | import | recovery |
| screen.import.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | import | state-body |
| screen.import.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | import | recovery |
| screen.import.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | import | state-body |
| screen.import.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | import | recovery |
| screen.import.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | import | state-body |
| screen.import.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | import | recovery |
| screen.import.state.populated-default.body | Актуальные данные раздела «График из скриншотов» готовы к следующему действию. | none | State copy: populated/default | import | state-body |
| screen.import.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | import | recovery |
| screen.import.title | График из скриншотов | none | Surface title | import | navigation-title |
| screen.join.action.open-manual.label | Открыть «Код точки» | none | Action label | join | control |
| screen.join.purpose | Location · точки рядом | none | Product task | join | accessibility-and-docs |
| screen.join.state.error.body | Не удалось обновить «Где вы работаете». Введённые данные сохранены; повторите попытку. | none | State copy: error | join | state-body |
| screen.join.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | join | recovery |
| screen.join.state.loading.body | Обновляем данные раздела «Где вы работаете»; текущий контекст остаётся доступен. | none | State copy: loading | join | state-body |
| screen.join.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | join | recovery |
| screen.join.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | join | state-body |
| screen.join.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | join | recovery |
| screen.join.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | join | state-body |
| screen.join.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | join | recovery |
| screen.join.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | join | state-body |
| screen.join.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | join | recovery |
| screen.join.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | join | state-body |
| screen.join.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | join | recovery |
| screen.join.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | join | state-body |
| screen.join.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | join | recovery |
| screen.join.state.populated-default.body | Актуальные данные раздела «Где вы работаете» готовы к следующему действию. | none | State copy: populated/default | join | state-body |
| screen.join.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | join | recovery |
| screen.join.title | Где вы работаете | none | Surface title | join | navigation-title |
| screen.lock.action.complete-lock.label | Продолжить | none | Action label | lock | control |
| screen.lock.purpose | LocalAuthentication | none | Product task | lock | accessibility-and-docs |
| screen.lock.state.error.body | Не удалось обновить «Замок Face ID». Введённые данные сохранены; повторите попытку. | none | State copy: error | lock | state-body |
| screen.lock.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lock | recovery |
| screen.lock.state.loading.body | Обновляем данные раздела «Замок Face ID»; текущий контекст остаётся доступен. | none | State copy: loading | lock | state-body |
| screen.lock.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lock | recovery |
| screen.lock.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | lock | state-body |
| screen.lock.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lock | recovery |
| screen.lock.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lock | state-body |
| screen.lock.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lock | recovery |
| screen.lock.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lock | state-body |
| screen.lock.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lock | recovery |
| screen.lock.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lock | state-body |
| screen.lock.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lock | recovery |
| screen.lock.state.populated-default.body | Актуальные данные раздела «Замок Face ID» готовы к следующему действию. | none | State copy: populated/default | lock | state-body |
| screen.lock.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lock | recovery |
| screen.lock.title | Замок Face ID | none | Surface title | lock | navigation-title |
| screen.lockscreen.action.complete-lockscreen.label | Продолжить | none | Action label | lockscreen | control |
| screen.lockscreen.purpose | Уведомление с аватаром | none | Product task | lockscreen | accessibility-and-docs |
| screen.lockscreen.state.error.body | Не удалось обновить «Экран блокировки». Введённые данные сохранены; повторите попытку. | none | State copy: error | lockscreen | state-body |
| screen.lockscreen.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lockscreen | recovery |
| screen.lockscreen.state.loading.body | Обновляем данные раздела «Экран блокировки»; текущий контекст остаётся доступен. | none | State copy: loading | lockscreen | state-body |
| screen.lockscreen.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lockscreen | recovery |
| screen.lockscreen.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | lockscreen | state-body |
| screen.lockscreen.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lockscreen | recovery |
| screen.lockscreen.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lockscreen | state-body |
| screen.lockscreen.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lockscreen | recovery |
| screen.lockscreen.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lockscreen | state-body |
| screen.lockscreen.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lockscreen | recovery |
| screen.lockscreen.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lockscreen | state-body |
| screen.lockscreen.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lockscreen | recovery |
| screen.lockscreen.state.populated-default.body | Актуальные данные раздела «Экран блокировки» готовы к следующему действию. | none | State copy: populated/default | lockscreen | state-body |
| screen.lockscreen.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lockscreen | recovery |
| screen.lockscreen.title | Экран блокировки | none | Surface title | lockscreen | navigation-title |
| screen.manual.action.complete-manual.label | Продолжить | none | Action label | manual | control |
| screen.manual.purpose | Fallback отказа в геопозиции | none | Product task | manual | accessibility-and-docs |
| screen.manual.state.error.body | Не удалось обновить «Код точки». Введённые данные сохранены; повторите попытку. | none | State copy: error | manual | state-body |
| screen.manual.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | manual | recovery |
| screen.manual.state.loading.body | Обновляем данные раздела «Код точки»; текущий контекст остаётся доступен. | none | State copy: loading | manual | state-body |
| screen.manual.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | manual | recovery |
| screen.manual.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | manual | state-body |
| screen.manual.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | manual | recovery |
| screen.manual.state.populated-default.body | Актуальные данные раздела «Код точки» готовы к следующему действию. | none | State copy: populated/default | manual | state-body |
| screen.manual.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | manual | recovery |
| screen.manual.title | Код точки | none | Surface title | manual | navigation-title |
| screen.mates.action.complete-mates.label | Продолжить | none | Action label | mates | control |
| screen.mates.purpose | Contacts · локальная сверка | none | Product task | mates | accessibility-and-docs |
| screen.mates.state.error.body | Не удалось обновить «Знакомые в сети». Введённые данные сохранены; повторите попытку. | none | State copy: error | mates | state-body |
| screen.mates.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | mates | recovery |
| screen.mates.state.loading.body | Обновляем данные раздела «Знакомые в сети»; текущий контекст остаётся доступен. | none | State copy: loading | mates | state-body |
| screen.mates.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | mates | recovery |
| screen.mates.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | mates | state-body |
| screen.mates.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | mates | recovery |
| screen.mates.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | mates | state-body |
| screen.mates.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | mates | recovery |
| screen.mates.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | mates | state-body |
| screen.mates.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | mates | recovery |
| screen.mates.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | mates | state-body |
| screen.mates.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | mates | recovery |
| screen.mates.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | mates | state-body |
| screen.mates.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | mates | recovery |
| screen.mates.state.populated-default.body | Актуальные данные раздела «Знакомые в сети» готовы к следующему действию. | none | State copy: populated/default | mates | state-body |
| screen.mates.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | mates | recovery |
| screen.mates.title | Знакомые в сети | none | Surface title | mates | navigation-title |
| screen.menu.action.open-lock.label | Открыть «Замок Face ID» | none | Action label | menu | control |
| screen.menu.purpose | Разделы · Face ID | none | Product task | menu | accessibility-and-docs |
| screen.menu.state.empty.body | В разделе «Меню» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | menu | state-body |
| screen.menu.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | menu | recovery |
| screen.menu.state.error.body | Не удалось обновить «Меню». Введённые данные сохранены; повторите попытку. | none | State copy: error | menu | state-body |
| screen.menu.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | menu | recovery |
| screen.menu.state.loading.body | Обновляем данные раздела «Меню»; текущий контекст остаётся доступен. | none | State copy: loading | menu | state-body |
| screen.menu.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | menu | recovery |
| screen.menu.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | menu | state-body |
| screen.menu.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | menu | recovery |
| screen.menu.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | menu | state-body |
| screen.menu.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | menu | recovery |
| screen.menu.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | menu | state-body |
| screen.menu.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | menu | recovery |
| screen.menu.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | menu | state-body |
| screen.menu.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | menu | recovery |
| screen.menu.state.populated-default.body | Актуальные данные раздела «Меню» готовы к следующему действию. | none | State copy: populated/default | menu | state-body |
| screen.menu.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | menu | recovery |
| screen.menu.title | Меню | none | Surface title | menu | navigation-title |
| screen.money.action.complete-money.label | Продолжить | none | Action label | money | control |
| screen.money.purpose | Часы и ставка за период | none | Product task | money | accessibility-and-docs |
| screen.money.state.error.body | Не удалось обновить «Заработок». Введённые данные сохранены; повторите попытку. | none | State copy: error | money | state-body |
| screen.money.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | money | recovery |
| screen.money.state.loading.body | Обновляем данные раздела «Заработок»; текущий контекст остаётся доступен. | none | State copy: loading | money | state-body |
| screen.money.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | money | recovery |
| screen.money.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | money | state-body |
| screen.money.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | money | recovery |
| screen.money.state.populated-default.body | Актуальные данные раздела «Заработок» готовы к следующему действию. | none | State copy: populated/default | money | state-body |
| screen.money.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | money | recovery |
| screen.money.title | Заработок | none | Surface title | money | navigation-title |
| screen.netqr.action.open-scan.label | Открыть «Сканер QR» | none | Action label | netqr | control |
| screen.netqr.purpose | Hotspot · Camera | none | Product task | netqr | accessibility-and-docs |
| screen.netqr.state.error.body | Не удалось обновить «Сеть точки». Введённые данные сохранены; повторите попытку. | none | State copy: error | netqr | state-body |
| screen.netqr.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | netqr | recovery |
| screen.netqr.state.loading.body | Обновляем данные раздела «Сеть точки»; текущий контекст остаётся доступен. | none | State copy: loading | netqr | state-body |
| screen.netqr.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | netqr | recovery |
| screen.netqr.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | netqr | state-body |
| screen.netqr.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | netqr | recovery |
| screen.netqr.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | netqr | state-body |
| screen.netqr.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | netqr | recovery |
| screen.netqr.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | netqr | state-body |
| screen.netqr.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | netqr | recovery |
| screen.netqr.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | netqr | state-body |
| screen.netqr.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | netqr | recovery |
| screen.netqr.state.populated-default.body | Актуальные данные раздела «Сеть точки» готовы к следующему действию. | none | State copy: populated/default | netqr | state-body |
| screen.netqr.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | netqr | recovery |
| screen.netqr.title | Сеть точки | none | Surface title | netqr | navigation-title |
| screen.passwords.action.open-fill.label | Открыть «Автозаполнение в Safari» | none | Action label | passwords | control |
| screen.passwords.purpose | AutoFill Credential Provider | none | Product task | passwords | accessibility-and-docs |
| screen.passwords.state.error.body | Не удалось обновить «Логины точки». Введённые данные сохранены; повторите попытку. | none | State copy: error | passwords | state-body |
| screen.passwords.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | passwords | recovery |
| screen.passwords.state.loading.body | Обновляем данные раздела «Логины точки»; текущий контекст остаётся доступен. | none | State copy: loading | passwords | state-body |
| screen.passwords.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | passwords | recovery |
| screen.passwords.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | passwords | state-body |
| screen.passwords.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | passwords | recovery |
| screen.passwords.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | passwords | state-body |
| screen.passwords.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | passwords | recovery |
| screen.passwords.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | passwords | state-body |
| screen.passwords.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | passwords | recovery |
| screen.passwords.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | passwords | state-body |
| screen.passwords.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | passwords | recovery |
| screen.passwords.state.populated-default.body | Актуальные данные раздела «Логины точки» готовы к следующему действию. | none | State copy: populated/default | passwords | state-body |
| screen.passwords.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | passwords | recovery |
| screen.passwords.title | Логины точки | none | Surface title | passwords | navigation-title |
| screen.people.action.open-mates.label | Открыть «Знакомые в сети» | none | Action label | people | control |
| screen.people.purpose | С кем работали · Contacts | none | Product task | people | accessibility-and-docs |
| screen.people.state.empty.body | В разделе «Люди» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | people | state-body |
| screen.people.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | people | recovery |
| screen.people.state.error.body | Не удалось обновить «Люди». Введённые данные сохранены; повторите попытку. | none | State copy: error | people | state-body |
| screen.people.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | people | recovery |
| screen.people.state.loading.body | Обновляем данные раздела «Люди»; текущий контекст остаётся доступен. | none | State copy: loading | people | state-body |
| screen.people.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | people | recovery |
| screen.people.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | people | state-body |
| screen.people.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | people | recovery |
| screen.people.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | people | state-body |
| screen.people.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | people | recovery |
| screen.people.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | people | state-body |
| screen.people.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | people | recovery |
| screen.people.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | people | state-body |
| screen.people.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | people | recovery |
| screen.people.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | people | state-body |
| screen.people.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | people | recovery |
| screen.people.state.populated-default.body | Актуальные данные раздела «Люди» готовы к следующему действию. | none | State copy: populated/default | people | state-body |
| screen.people.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | people | recovery |
| screen.people.title | Люди | none | Surface title | people | navigation-title |
| screen.person.action.open-call.label | Открыть «Звонок по смене» | none | Action label | person | control |
| screen.person.purpose | Смены вместе · VoIP | none | Product task | person | accessibility-and-docs |
| screen.person.state.error.body | Не удалось обновить «Карточка человека». Введённые данные сохранены; повторите попытку. | none | State copy: error | person | state-body |
| screen.person.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | person | recovery |
| screen.person.state.loading.body | Обновляем данные раздела «Карточка человека»; текущий контекст остаётся доступен. | none | State copy: loading | person | state-body |
| screen.person.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | person | recovery |
| screen.person.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | person | state-body |
| screen.person.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | person | recovery |
| screen.person.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | person | state-body |
| screen.person.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | person | recovery |
| screen.person.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | person | state-body |
| screen.person.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | person | recovery |
| screen.person.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | person | state-body |
| screen.person.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | person | recovery |
| screen.person.state.populated-default.body | Актуальные данные раздела «Карточка человека» готовы к следующему действию. | none | State copy: populated/default | person | state-body |
| screen.person.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | person | recovery |
| screen.person.title | Карточка человека | none | Surface title | person | navigation-title |
| screen.phone.action.open-code.label | Открыть «Код из письма» | none | Action label | phone | control |
| screen.phone.purpose | Первый экран приложения | none | Product task | phone | accessibility-and-docs |
| screen.phone.state.error.body | Не удалось обновить «Вход по почте». Введённые данные сохранены; повторите попытку. | none | State copy: error | phone | state-body |
| screen.phone.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | phone | recovery |
| screen.phone.state.loading.body | Обновляем данные раздела «Вход по почте»; текущий контекст остаётся доступен. | none | State copy: loading | phone | state-body |
| screen.phone.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | phone | recovery |
| screen.phone.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | phone | state-body |
| screen.phone.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | phone | recovery |
| screen.phone.state.populated-default.body | Актуальные данные раздела «Вход по почте» готовы к следующему действию. | none | State copy: populated/default | phone | state-body |
| screen.phone.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | phone | recovery |
| screen.phone.title | Вход по почте | none | Surface title | phone | navigation-title |
| screen.player.action.complete-player.label | Продолжить | none | Action label | player | control |
| screen.player.purpose | Now Playing · фоновое аудио | none | Product task | player | accessibility-and-docs |
| screen.player.state.error.body | Не удалось обновить «Брифинг в фоне». Введённые данные сохранены; повторите попытку. | none | State copy: error | player | state-body |
| screen.player.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | player | recovery |
| screen.player.state.loading.body | Обновляем данные раздела «Брифинг в фоне»; текущий контекст остаётся доступен. | none | State copy: loading | player | state-body |
| screen.player.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | player | recovery |
| screen.player.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | player | state-body |
| screen.player.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | player | recovery |
| screen.player.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | player | state-body |
| screen.player.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | player | recovery |
| screen.player.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | player | state-body |
| screen.player.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | player | recovery |
| screen.player.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | player | state-body |
| screen.player.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | player | recovery |
| screen.player.state.populated-default.body | Актуальные данные раздела «Брифинг в фоне» готовы к следующему действию. | none | State copy: populated/default | player | state-body |
| screen.player.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | player | recovery |
| screen.player.title | Брифинг в фоне | none | Surface title | player | navigation-title |
| screen.record.action.complete-record.label | Продолжить | none | Action label | record | control |
| screen.record.purpose | Microphone · Speech | none | Product task | record | accessibility-and-docs |
| screen.record.state.error.body | Не удалось обновить «Запись брифинга». Введённые данные сохранены; повторите попытку. | none | State copy: error | record | state-body |
| screen.record.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | record | recovery |
| screen.record.state.loading.body | Обновляем данные раздела «Запись брифинга»; текущий контекст остаётся доступен. | none | State copy: loading | record | state-body |
| screen.record.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | record | recovery |
| screen.record.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | record | state-body |
| screen.record.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | record | recovery |
| screen.record.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | record | state-body |
| screen.record.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | record | recovery |
| screen.record.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | record | state-body |
| screen.record.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | record | recovery |
| screen.record.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | record | state-body |
| screen.record.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | record | recovery |
| screen.record.state.populated-default.body | Актуальные данные раздела «Запись брифинга» готовы к следующему действию. | none | State copy: populated/default | record | state-body |
| screen.record.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | record | recovery |
| screen.record.title | Запись брифинга | none | Surface title | record | navigation-title |
| screen.scan.action.complete-scan.label | Продолжить | none | Action label | scan | control |
| screen.scan.purpose | DataScanner | none | Product task | scan | accessibility-and-docs |
| screen.scan.state.error.body | Не удалось обновить «Сканер QR». Введённые данные сохранены; повторите попытку. | none | State copy: error | scan | state-body |
| screen.scan.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | scan | recovery |
| screen.scan.state.loading.body | Обновляем данные раздела «Сканер QR»; текущий контекст остаётся доступен. | none | State copy: loading | scan | state-body |
| screen.scan.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | scan | recovery |
| screen.scan.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | scan | state-body |
| screen.scan.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | scan | recovery |
| screen.scan.state.populated-default.body | Актуальные данные раздела «Сканер QR» готовы к следующему действию. | none | State copy: populated/default | scan | state-body |
| screen.scan.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | scan | recovery |
| screen.scan.title | Сканер QR | none | Surface title | scan | navigation-title |
| screen.settings.action.open-background.label | Открыть «Обновление в фоне» | none | Action label | settings | control |
| screen.settings.purpose | Фон · виджет · реклама | none | Product task | settings | accessibility-and-docs |
| screen.settings.state.empty.body | В разделе «Настройки» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | settings | state-body |
| screen.settings.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | settings | recovery |
| screen.settings.state.error.body | Не удалось обновить «Настройки». Введённые данные сохранены; повторите попытку. | none | State copy: error | settings | state-body |
| screen.settings.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | settings | recovery |
| screen.settings.state.loading.body | Обновляем данные раздела «Настройки»; текущий контекст остаётся доступен. | none | State copy: loading | settings | state-body |
| screen.settings.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | settings | recovery |
| screen.settings.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | settings | state-body |
| screen.settings.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | settings | recovery |
| screen.settings.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | settings | state-body |
| screen.settings.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | settings | recovery |
| screen.settings.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | settings | state-body |
| screen.settings.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | settings | recovery |
| screen.settings.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | settings | state-body |
| screen.settings.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | settings | recovery |
| screen.settings.state.populated-default.body | Актуальные данные раздела «Настройки» готовы к следующему действию. | none | State copy: populated/default | settings | state-body |
| screen.settings.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | settings | recovery |
| screen.settings.title | Настройки | none | Surface title | settings | navigation-title |
| screen.shift.action.open-checkin.label | Открыть «Отметка на смене» | none | Action label | shift | control |
| screen.shift.purpose | Push · Calendar · Remote notification | none | Product task | shift | accessibility-and-docs |
| screen.shift.state.error.body | Не удалось обновить «Смена». Введённые данные сохранены; повторите попытку. | none | State copy: error | shift | state-body |
| screen.shift.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | shift | recovery |
| screen.shift.state.loading.body | Обновляем данные раздела «Смена»; текущий контекст остаётся доступен. | none | State copy: loading | shift | state-body |
| screen.shift.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | shift | recovery |
| screen.shift.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | shift | state-body |
| screen.shift.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | shift | recovery |
| screen.shift.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | shift | state-body |
| screen.shift.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | shift | recovery |
| screen.shift.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | shift | state-body |
| screen.shift.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | shift | recovery |
| screen.shift.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | shift | state-body |
| screen.shift.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | shift | recovery |
| screen.shift.state.populated-default.body | Актуальные данные раздела «Смена» готовы к следующему действию. | none | State copy: populated/default | shift | state-body |
| screen.shift.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | shift | recovery |
| screen.shift.title | Смена | none | Surface title | shift | navigation-title |
| screen.shifts.action.open-import.label | Открыть «График из скриншотов» | none | Action label | shifts | control |
| screen.shifts.purpose | График недели · Photo Library | none | Product task | shifts | accessibility-and-docs |
| screen.shifts.state.empty.body | В разделе «Смены» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | shifts | state-body |
| screen.shifts.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | shifts | recovery |
| screen.shifts.state.error.body | Не удалось обновить «Смены». Введённые данные сохранены; повторите попытку. | none | State copy: error | shifts | state-body |
| screen.shifts.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | shifts | recovery |
| screen.shifts.state.loading.body | Обновляем данные раздела «Смены»; текущий контекст остаётся доступен. | none | State copy: loading | shifts | state-body |
| screen.shifts.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | shifts | recovery |
| screen.shifts.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | shifts | state-body |
| screen.shifts.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | shifts | recovery |
| screen.shifts.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | shifts | state-body |
| screen.shifts.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | shifts | recovery |
| screen.shifts.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | shifts | state-body |
| screen.shifts.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | shifts | recovery |
| screen.shifts.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | shifts | state-body |
| screen.shifts.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | shifts | recovery |
| screen.shifts.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | shifts | state-body |
| screen.shifts.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | shifts | recovery |
| screen.shifts.state.populated-default.body | Актуальные данные раздела «Смены» готовы к следующему действию. | none | State copy: populated/default | shifts | state-body |
| screen.shifts.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | shifts | recovery |
| screen.shifts.title | Смены | none | Surface title | shifts | navigation-title |
| screen.shoot.action.complete-shoot.label | Продолжить | none | Action label | shoot | control |
| screen.shoot.purpose | AVFoundation | none | Product task | shoot | accessibility-and-docs |
| screen.shoot.state.error.body | Не удалось обновить «Камера». Введённые данные сохранены; повторите попытку. | none | State copy: error | shoot | state-body |
| screen.shoot.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | shoot | recovery |
| screen.shoot.state.loading.body | Обновляем данные раздела «Камера»; текущий контекст остаётся доступен. | none | State copy: loading | shoot | state-body |
| screen.shoot.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | shoot | recovery |
| screen.shoot.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | shoot | state-body |
| screen.shoot.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | shoot | recovery |
| screen.shoot.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | shoot | state-body |
| screen.shoot.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | shoot | recovery |
| screen.shoot.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | shoot | state-body |
| screen.shoot.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | shoot | recovery |
| screen.shoot.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | shoot | state-body |
| screen.shoot.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | shoot | recovery |
| screen.shoot.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | shoot | state-body |
| screen.shoot.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | shoot | recovery |
| screen.shoot.state.populated-default.body | Актуальные данные раздела «Камера» готовы к следующему действию. | none | State copy: populated/default | shoot | state-body |
| screen.shoot.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | shoot | recovery |
| screen.shoot.title | Камера | none | Surface title | shoot | navigation-title |
| screen.swap.action.complete-swap.label | Продолжить | none | Action label | swap | control |
| screen.swap.purpose | Отклик на подмену | none | Product task | swap | accessibility-and-docs |
| screen.swap.state.error.body | Не удалось обновить «Открытая смена». Введённые данные сохранены; повторите попытку. | none | State copy: error | swap | state-body |
| screen.swap.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | swap | recovery |
| screen.swap.state.loading.body | Обновляем данные раздела «Открытая смена»; текущий контекст остаётся доступен. | none | State copy: loading | swap | state-body |
| screen.swap.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | swap | recovery |
| screen.swap.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | swap | state-body |
| screen.swap.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | swap | recovery |
| screen.swap.state.populated-default.body | Актуальные данные раздела «Открытая смена» готовы к следующему действию. | none | State copy: populated/default | swap | state-body |
| screen.swap.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | swap | recovery |
| screen.swap.title | Открытая смена | none | Surface title | swap | navigation-title |
| screen.swaps.action.open-swap.label | Открыть «Открытая смена» | none | Action label | swaps | control |
| screen.swaps.purpose | Открытые смены · Location | none | Product task | swaps | accessibility-and-docs |
| screen.swaps.state.empty.body | В разделе «Подмены» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | swaps | state-body |
| screen.swaps.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | swaps | recovery |
| screen.swaps.state.error.body | Не удалось обновить «Подмены». Введённые данные сохранены; повторите попытку. | none | State copy: error | swaps | state-body |
| screen.swaps.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | swaps | recovery |
| screen.swaps.state.loading.body | Обновляем данные раздела «Подмены»; текущий контекст остаётся доступен. | none | State copy: loading | swaps | state-body |
| screen.swaps.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | swaps | recovery |
| screen.swaps.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | swaps | state-body |
| screen.swaps.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | swaps | recovery |
| screen.swaps.state.populated-default.body | Актуальные данные раздела «Подмены» готовы к следующему действию. | none | State copy: populated/default | swaps | state-body |
| screen.swaps.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | swaps | recovery |
| screen.swaps.title | Подмены | none | Surface title | swaps | navigation-title |
| screen.widget.action.complete-widget.label | Продолжить | none | Action label | widget | control |
| screen.widget.purpose | App Groups · Keychain | none | Product task | widget | accessibility-and-docs |
| screen.widget.state.error.body | Не удалось обновить «Виджет на экране «Домой»». Введённые данные сохранены; повторите попытку. | none | State copy: error | widget | state-body |
| screen.widget.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | widget | recovery |
| screen.widget.state.loading.body | Обновляем данные раздела «Виджет на экране «Домой»»; текущий контекст остаётся доступен. | none | State copy: loading | widget | state-body |
| screen.widget.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | widget | recovery |
| screen.widget.state.offline.body | Нет сети. Показаны сохранённые данные verified-shift; свежесть отмечена явно. | none | State copy: offline | widget | state-body |
| screen.widget.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | widget | recovery |
| screen.widget.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | widget | state-body |
| screen.widget.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | widget | recovery |
| screen.widget.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | widget | state-body |
| screen.widget.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | widget | recovery |
| screen.widget.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | widget | state-body |
| screen.widget.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | widget | recovery |
| screen.widget.state.populated-default.body | Актуальные данные раздела «Виджет на экране «Домой»» готовы к следующему действию. | none | State copy: populated/default | widget | state-body |
| screen.widget.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | widget | recovery |
| screen.widget.title | Виджет на экране «Домой» | none | Surface title | widget | navigation-title |

## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| all.happy | all | happy-path | surface:phone<br>fixture:fixture.peresmenka.phone.default | perform-action:phone.open-code<br>perform-action:code.open-codefail<br>open-surface:codefail<br>perform-action:join.open-manual<br>open-surface:manual<br>perform-action:shifts.open-import<br>open-surface:import<br>open-surface:shift | surface-visible:shift<br>outcome-visible:32-21 |
| all.failure | all | failure-recovery | surface:phone<br>fixture:fixture.peresmenka.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| all.offline | all | offline | surface:phone<br>fixture:fixture.peresmenka.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| all.persistence | all | persistence-return | surface:phone<br>checkpoint-flow:all | relaunch:application<br>return-to-flow:all | flow-context-restored:all<br>surface-visible:phone |
| signin.happy | signin | happy-path | surface:phone<br>fixture:fixture.peresmenka.phone.default | perform-action:phone.open-code<br>perform-action:code.open-codefail<br>open-surface:codefail<br>perform-action:join.open-manual<br>open-surface:manual<br>open-surface:shifts | surface-visible:shifts<br>outcome-visible:sms |
| signin.failure | signin | failure-recovery | surface:phone<br>fixture:fixture.peresmenka.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| signin.offline | signin | offline | surface:phone<br>fixture:fixture.peresmenka.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| signin.persistence | signin | persistence-return | surface:phone<br>checkpoint-flow:signin | relaunch:application<br>return-to-flow:signin | flow-context-restored:signin<br>surface-visible:phone |
| shiftday.happy | shiftday | happy-path | surface:shifts<br>fixture:fixture.peresmenka.shifts.default | open-surface:shifts<br>perform-action:shift.open-checkin<br>perform-action:checkin.open-netqr<br>perform-action:netqr.open-scan<br>open-surface:scan<br>perform-action:handover.open-shoot<br>open-surface:shoot<br>open-surface:brief | surface-visible:brief<br>outcome-visible:qr |
| shiftday.failure | shiftday | failure-recovery | surface:shifts<br>fixture:fixture.peresmenka.shifts.error<br>inject-state:error | invoke-recovery:shifts | recovery-visible:shifts<br>input-preserved:shifts |
| shiftday.offline | shiftday | offline | surface:shifts<br>fixture:fixture.peresmenka.shifts.offline<br>connectivity:offline | open-surface:shifts | state-visible:shifts.offline<br>recovery-visible:shifts |
| shiftday.persistence | shiftday | persistence-return | surface:shifts<br>checkpoint-flow:shiftday | relaunch:application<br>return-to-flow:shiftday | flow-context-restored:shiftday<br>surface-visible:shifts |
| permission.location.denied | permission:location | permission-denial-fallback | surface:join<br>fixture:fixture.peresmenka.join.permission-denied<br>permission-status:location.not-determined | deny-permission:location | state-visible:join.permission-denied<br>fallback-visible:location |
| permission.wifiinfo.denied | permission:wifiinfo | permission-denial-fallback | surface:checkin<br>fixture:fixture.peresmenka.checkin.permission-denied<br>permission-status:wifiinfo.not-determined | deny-permission:wifiinfo | state-visible:checkin.permission-denied<br>fallback-visible:wifiinfo |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:netqr<br>fixture:fixture.peresmenka.netqr.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:netqr.permission-denied<br>fallback-visible:hotspot |
| permission.camera.denied | permission:camera | permission-denial-fallback | surface:handover<br>fixture:fixture.peresmenka.shoot.permission-denied<br>permission-status:camera.not-determined | deny-permission:camera | state-visible:shoot.permission-denied<br>fallback-visible:camera |
| permission.photos.denied | permission:photos | permission-denial-fallback | surface:shifts<br>fixture:fixture.peresmenka.import.permission-denied<br>permission-status:photos.not-determined | deny-permission:photos | state-visible:import.permission-denied<br>fallback-visible:photos |
| permission.mic.denied | permission:mic | permission-denial-fallback | surface:brief<br>fixture:fixture.peresmenka.record.permission-denied<br>permission-status:mic.not-determined | deny-permission:mic | state-visible:record.permission-denied<br>fallback-visible:mic |
| permission.speech.denied | permission:speech | permission-denial-fallback | surface:brief<br>fixture:fixture.peresmenka.record.permission-denied<br>permission-status:speech.not-determined | deny-permission:speech | state-visible:record.permission-denied<br>fallback-visible:speech |
| permission.audio.denied | permission:audio | permission-denial-fallback | surface:brief<br>fixture:fixture.peresmenka.player.permission-denied<br>permission-status:audio.not-determined | deny-permission:audio | state-visible:player.permission-denied<br>fallback-visible:audio |
| permission.push.denied | permission:push | permission-denial-fallback | surface:shift<br>fixture:fixture.peresmenka.shift.permission-denied<br>permission-status:push.not-determined | deny-permission:push | state-visible:shift.permission-denied<br>fallback-visible:push |
| permission.commnotif.denied | permission:commnotif | permission-denial-fallback | surface:chat<br>fixture:fixture.peresmenka.lockscreen.permission-denied<br>permission-status:commnotif.not-determined | deny-permission:commnotif | state-visible:lockscreen.permission-denied<br>fallback-visible:commnotif |
| permission.voip.denied | permission:voip | permission-denial-fallback | surface:person<br>fixture:fixture.peresmenka.call.permission-denied<br>permission-status:voip.not-determined | deny-permission:voip | state-visible:call.permission-denied<br>fallback-visible:voip |
| permission.remotenotif.denied | permission:remotenotif | permission-denial-fallback | surface:shift<br>fixture:fixture.peresmenka.background.permission-denied<br>permission-status:remotenotif.not-determined | deny-permission:remotenotif | state-visible:background.permission-denied<br>fallback-visible:remotenotif |
| permission.fetch.denied | permission:fetch | permission-denial-fallback | surface:settings<br>fixture:fixture.peresmenka.background.permission-denied<br>permission-status:fetch.not-determined | deny-permission:fetch | state-visible:background.permission-denied<br>fallback-visible:fetch |
| permission.bgtask.denied | permission:bgtask | permission-denial-fallback | surface:background<br>fixture:fixture.peresmenka.shifts.permission-denied<br>permission-status:bgtask.not-determined | deny-permission:bgtask | state-visible:shifts.permission-denied<br>fallback-visible:bgtask |
| permission.appgroups.denied | permission:appgroups | permission-denial-fallback | surface:settings<br>fixture:fixture.peresmenka.widget.permission-denied<br>permission-status:appgroups.not-determined | deny-permission:appgroups | state-visible:widget.permission-denied<br>fallback-visible:appgroups |
| permission.keychain.denied | permission:keychain | permission-denial-fallback | surface:widget<br>fixture:fixture.peresmenka.shifts.permission-denied<br>permission-status:keychain.not-determined | deny-permission:keychain | state-visible:shifts.permission-denied<br>fallback-visible:keychain |
| permission.autofill.denied | permission:autofill | permission-denial-fallback | surface:passwords<br>fixture:fixture.peresmenka.fill.permission-denied<br>permission-status:autofill.not-determined | deny-permission:autofill | state-visible:fill.permission-denied<br>fallback-visible:autofill |
| permission.contacts.denied | permission:contacts | permission-denial-fallback | surface:people<br>fixture:fixture.peresmenka.mates.permission-denied<br>permission-status:contacts.not-determined | deny-permission:contacts | state-visible:mates.permission-denied<br>fallback-visible:contacts |
| permission.calendar.denied | permission:calendar | permission-denial-fallback | surface:shift<br>fixture:fixture.peresmenka.shift.permission-denied<br>permission-status:calendar.not-determined | deny-permission:calendar | state-visible:shift.permission-denied<br>fallback-visible:calendar |
| permission.faceid.denied | permission:faceid | permission-denial-fallback | surface:menu<br>fixture:fixture.peresmenka.lock.permission-denied<br>permission-status:faceid.not-determined | deny-permission:faceid | state-visible:lock.permission-denied<br>fallback-visible:faceid |
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.peresmenka.menu.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:menu.permission-denied<br>fallback-visible:tracking |

## Deterministic fixture catalog

Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.

| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |
|---|---|---|---|---|---|
| fixture.peresmenka.phone.default | phone / default | peresmenka.phone.default.primary.001<br>peresmenka.phone.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.phone.loading | phone / loading | peresmenka.phone.loading.primary.001<br>peresmenka.phone.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.phone.error | phone / error | peresmenka.phone.error.primary.001<br>peresmenka.phone.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.phone.offline | phone / offline | peresmenka.phone.offline.primary.001<br>peresmenka.phone.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.code.default | code / default | peresmenka.code.default.primary.001<br>peresmenka.code.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.code.loading | code / loading | peresmenka.code.loading.primary.001<br>peresmenka.code.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.code.error | code / error | peresmenka.code.error.primary.001<br>peresmenka.code.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.code.offline | code / offline | peresmenka.code.offline.primary.001<br>peresmenka.code.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.codefail.default | codefail / default | peresmenka.codefail.default.primary.001<br>peresmenka.codefail.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.codefail.loading | codefail / loading | peresmenka.codefail.loading.primary.001<br>peresmenka.codefail.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.codefail.error | codefail / error | peresmenka.codefail.error.primary.001<br>peresmenka.codefail.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.codefail.offline | codefail / offline | peresmenka.codefail.offline.primary.001<br>peresmenka.codefail.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.default | join / default | peresmenka.join.default.primary.001<br>peresmenka.join.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.loading | join / loading | peresmenka.join.loading.primary.001<br>peresmenka.join.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.error | join / error | peresmenka.join.error.primary.001<br>peresmenka.join.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.offline | join / offline | peresmenka.join.offline.primary.001<br>peresmenka.join.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.permission-needed | join / permission-needed | peresmenka.join.permission-needed.primary.001<br>peresmenka.join.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.permission-denied | join / permission-denied | peresmenka.join.permission-denied.primary.001<br>peresmenka.join.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.permission-restricted | join / permission-restricted | peresmenka.join.permission-restricted.primary.001<br>peresmenka.join.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.join.permission-limited | join / permission-limited | peresmenka.join.permission-limited.primary.001<br>peresmenka.join.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.manual.default | manual / default | peresmenka.manual.default.primary.001<br>peresmenka.manual.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.manual.loading | manual / loading | peresmenka.manual.loading.primary.001<br>peresmenka.manual.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.manual.error | manual / error | peresmenka.manual.error.primary.001<br>peresmenka.manual.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.manual.offline | manual / offline | peresmenka.manual.offline.primary.001<br>peresmenka.manual.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.default | shifts / default | peresmenka.shifts.default.primary.001<br>peresmenka.shifts.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.loading | shifts / loading | peresmenka.shifts.loading.primary.001<br>peresmenka.shifts.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.error | shifts / error | peresmenka.shifts.error.primary.001<br>peresmenka.shifts.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.offline | shifts / offline | peresmenka.shifts.offline.primary.001<br>peresmenka.shifts.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.empty | shifts / empty | peresmenka.shifts.empty.primary.001<br>peresmenka.shifts.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.permission-needed | shifts / permission-needed | peresmenka.shifts.permission-needed.primary.001<br>peresmenka.shifts.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.permission-denied | shifts / permission-denied | peresmenka.shifts.permission-denied.primary.001<br>peresmenka.shifts.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.permission-restricted | shifts / permission-restricted | peresmenka.shifts.permission-restricted.primary.001<br>peresmenka.shifts.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shifts.permission-limited | shifts / permission-limited | peresmenka.shifts.permission-limited.primary.001<br>peresmenka.shifts.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.default | import / default | peresmenka.import.default.primary.001<br>peresmenka.import.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.loading | import / loading | peresmenka.import.loading.primary.001<br>peresmenka.import.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.error | import / error | peresmenka.import.error.primary.001<br>peresmenka.import.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.offline | import / offline | peresmenka.import.offline.primary.001<br>peresmenka.import.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.permission-needed | import / permission-needed | peresmenka.import.permission-needed.primary.001<br>peresmenka.import.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.permission-denied | import / permission-denied | peresmenka.import.permission-denied.primary.001<br>peresmenka.import.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.permission-restricted | import / permission-restricted | peresmenka.import.permission-restricted.primary.001<br>peresmenka.import.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.import.permission-limited | import / permission-limited | peresmenka.import.permission-limited.primary.001<br>peresmenka.import.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.default | shift / default | peresmenka.shift.default.primary.001<br>peresmenka.shift.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.loading | shift / loading | peresmenka.shift.loading.primary.001<br>peresmenka.shift.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.error | shift / error | peresmenka.shift.error.primary.001<br>peresmenka.shift.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.offline | shift / offline | peresmenka.shift.offline.primary.001<br>peresmenka.shift.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.permission-needed | shift / permission-needed | peresmenka.shift.permission-needed.primary.001<br>peresmenka.shift.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.permission-denied | shift / permission-denied | peresmenka.shift.permission-denied.primary.001<br>peresmenka.shift.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shift.permission-restricted | shift / permission-restricted | peresmenka.shift.permission-restricted.primary.001<br>peresmenka.shift.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.default | checkin / default | peresmenka.checkin.default.primary.001<br>peresmenka.checkin.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.loading | checkin / loading | peresmenka.checkin.loading.primary.001<br>peresmenka.checkin.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.error | checkin / error | peresmenka.checkin.error.primary.001<br>peresmenka.checkin.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.offline | checkin / offline | peresmenka.checkin.offline.primary.001<br>peresmenka.checkin.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.permission-needed | checkin / permission-needed | peresmenka.checkin.permission-needed.primary.001<br>peresmenka.checkin.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.permission-denied | checkin / permission-denied | peresmenka.checkin.permission-denied.primary.001<br>peresmenka.checkin.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.checkin.permission-restricted | checkin / permission-restricted | peresmenka.checkin.permission-restricted.primary.001<br>peresmenka.checkin.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.default | netqr / default | peresmenka.netqr.default.primary.001<br>peresmenka.netqr.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.loading | netqr / loading | peresmenka.netqr.loading.primary.001<br>peresmenka.netqr.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.error | netqr / error | peresmenka.netqr.error.primary.001<br>peresmenka.netqr.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.offline | netqr / offline | peresmenka.netqr.offline.primary.001<br>peresmenka.netqr.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.permission-needed | netqr / permission-needed | peresmenka.netqr.permission-needed.primary.001<br>peresmenka.netqr.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.permission-denied | netqr / permission-denied | peresmenka.netqr.permission-denied.primary.001<br>peresmenka.netqr.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.netqr.permission-restricted | netqr / permission-restricted | peresmenka.netqr.permission-restricted.primary.001<br>peresmenka.netqr.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.scan.default | scan / default | peresmenka.scan.default.primary.001<br>peresmenka.scan.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.scan.loading | scan / loading | peresmenka.scan.loading.primary.001<br>peresmenka.scan.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.scan.error | scan / error | peresmenka.scan.error.primary.001<br>peresmenka.scan.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.scan.offline | scan / offline | peresmenka.scan.offline.primary.001<br>peresmenka.scan.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.default | handover / default | peresmenka.handover.default.primary.001<br>peresmenka.handover.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.loading | handover / loading | peresmenka.handover.loading.primary.001<br>peresmenka.handover.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.error | handover / error | peresmenka.handover.error.primary.001<br>peresmenka.handover.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.offline | handover / offline | peresmenka.handover.offline.primary.001<br>peresmenka.handover.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.permission-needed | handover / permission-needed | peresmenka.handover.permission-needed.primary.001<br>peresmenka.handover.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.permission-denied | handover / permission-denied | peresmenka.handover.permission-denied.primary.001<br>peresmenka.handover.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.permission-restricted | handover / permission-restricted | peresmenka.handover.permission-restricted.primary.001<br>peresmenka.handover.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.handover.permission-limited | handover / permission-limited | peresmenka.handover.permission-limited.primary.001<br>peresmenka.handover.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.default | shoot / default | peresmenka.shoot.default.primary.001<br>peresmenka.shoot.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.loading | shoot / loading | peresmenka.shoot.loading.primary.001<br>peresmenka.shoot.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.error | shoot / error | peresmenka.shoot.error.primary.001<br>peresmenka.shoot.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.offline | shoot / offline | peresmenka.shoot.offline.primary.001<br>peresmenka.shoot.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.permission-needed | shoot / permission-needed | peresmenka.shoot.permission-needed.primary.001<br>peresmenka.shoot.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.permission-denied | shoot / permission-denied | peresmenka.shoot.permission-denied.primary.001<br>peresmenka.shoot.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.permission-restricted | shoot / permission-restricted | peresmenka.shoot.permission-restricted.primary.001<br>peresmenka.shoot.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.shoot.permission-limited | shoot / permission-limited | peresmenka.shoot.permission-limited.primary.001<br>peresmenka.shoot.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.default | brief / default | peresmenka.brief.default.primary.001<br>peresmenka.brief.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.loading | brief / loading | peresmenka.brief.loading.primary.001<br>peresmenka.brief.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.error | brief / error | peresmenka.brief.error.primary.001<br>peresmenka.brief.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.offline | brief / offline | peresmenka.brief.offline.primary.001<br>peresmenka.brief.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.permission-needed | brief / permission-needed | peresmenka.brief.permission-needed.primary.001<br>peresmenka.brief.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.permission-denied | brief / permission-denied | peresmenka.brief.permission-denied.primary.001<br>peresmenka.brief.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.brief.permission-restricted | brief / permission-restricted | peresmenka.brief.permission-restricted.primary.001<br>peresmenka.brief.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.default | record / default | peresmenka.record.default.primary.001<br>peresmenka.record.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.loading | record / loading | peresmenka.record.loading.primary.001<br>peresmenka.record.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.error | record / error | peresmenka.record.error.primary.001<br>peresmenka.record.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.offline | record / offline | peresmenka.record.offline.primary.001<br>peresmenka.record.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.permission-needed | record / permission-needed | peresmenka.record.permission-needed.primary.001<br>peresmenka.record.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.permission-denied | record / permission-denied | peresmenka.record.permission-denied.primary.001<br>peresmenka.record.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.record.permission-restricted | record / permission-restricted | peresmenka.record.permission-restricted.primary.001<br>peresmenka.record.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.default | player / default | peresmenka.player.default.primary.001<br>peresmenka.player.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.loading | player / loading | peresmenka.player.loading.primary.001<br>peresmenka.player.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.error | player / error | peresmenka.player.error.primary.001<br>peresmenka.player.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.offline | player / offline | peresmenka.player.offline.primary.001<br>peresmenka.player.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.permission-needed | player / permission-needed | peresmenka.player.permission-needed.primary.001<br>peresmenka.player.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.permission-denied | player / permission-denied | peresmenka.player.permission-denied.primary.001<br>peresmenka.player.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.player.permission-restricted | player / permission-restricted | peresmenka.player.permission-restricted.primary.001<br>peresmenka.player.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swaps.default | swaps / default | peresmenka.swaps.default.primary.001<br>peresmenka.swaps.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swaps.loading | swaps / loading | peresmenka.swaps.loading.primary.001<br>peresmenka.swaps.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swaps.error | swaps / error | peresmenka.swaps.error.primary.001<br>peresmenka.swaps.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swaps.offline | swaps / offline | peresmenka.swaps.offline.primary.001<br>peresmenka.swaps.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swaps.empty | swaps / empty | peresmenka.swaps.empty.primary.001<br>peresmenka.swaps.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swap.default | swap / default | peresmenka.swap.default.primary.001<br>peresmenka.swap.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swap.loading | swap / loading | peresmenka.swap.loading.primary.001<br>peresmenka.swap.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swap.error | swap / error | peresmenka.swap.error.primary.001<br>peresmenka.swap.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.swap.offline | swap / offline | peresmenka.swap.offline.primary.001<br>peresmenka.swap.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.default | people / default | peresmenka.people.default.primary.001<br>peresmenka.people.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.loading | people / loading | peresmenka.people.loading.primary.001<br>peresmenka.people.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.error | people / error | peresmenka.people.error.primary.001<br>peresmenka.people.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.offline | people / offline | peresmenka.people.offline.primary.001<br>peresmenka.people.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.empty | people / empty | peresmenka.people.empty.primary.001<br>peresmenka.people.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.permission-needed | people / permission-needed | peresmenka.people.permission-needed.primary.001<br>peresmenka.people.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.permission-denied | people / permission-denied | peresmenka.people.permission-denied.primary.001<br>peresmenka.people.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.permission-restricted | people / permission-restricted | peresmenka.people.permission-restricted.primary.001<br>peresmenka.people.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.people.permission-limited | people / permission-limited | peresmenka.people.permission-limited.primary.001<br>peresmenka.people.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.default | mates / default | peresmenka.mates.default.primary.001<br>peresmenka.mates.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.loading | mates / loading | peresmenka.mates.loading.primary.001<br>peresmenka.mates.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.error | mates / error | peresmenka.mates.error.primary.001<br>peresmenka.mates.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.offline | mates / offline | peresmenka.mates.offline.primary.001<br>peresmenka.mates.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.permission-needed | mates / permission-needed | peresmenka.mates.permission-needed.primary.001<br>peresmenka.mates.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.permission-denied | mates / permission-denied | peresmenka.mates.permission-denied.primary.001<br>peresmenka.mates.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.permission-restricted | mates / permission-restricted | peresmenka.mates.permission-restricted.primary.001<br>peresmenka.mates.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.mates.permission-limited | mates / permission-limited | peresmenka.mates.permission-limited.primary.001<br>peresmenka.mates.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.default | person / default | peresmenka.person.default.primary.001<br>peresmenka.person.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.loading | person / loading | peresmenka.person.loading.primary.001<br>peresmenka.person.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.error | person / error | peresmenka.person.error.primary.001<br>peresmenka.person.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.offline | person / offline | peresmenka.person.offline.primary.001<br>peresmenka.person.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.permission-needed | person / permission-needed | peresmenka.person.permission-needed.primary.001<br>peresmenka.person.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.permission-denied | person / permission-denied | peresmenka.person.permission-denied.primary.001<br>peresmenka.person.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.person.permission-restricted | person / permission-restricted | peresmenka.person.permission-restricted.primary.001<br>peresmenka.person.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.default | call / default | peresmenka.call.default.primary.001<br>peresmenka.call.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.loading | call / loading | peresmenka.call.loading.primary.001<br>peresmenka.call.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.error | call / error | peresmenka.call.error.primary.001<br>peresmenka.call.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.offline | call / offline | peresmenka.call.offline.primary.001<br>peresmenka.call.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.permission-needed | call / permission-needed | peresmenka.call.permission-needed.primary.001<br>peresmenka.call.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.permission-denied | call / permission-denied | peresmenka.call.permission-denied.primary.001<br>peresmenka.call.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.call.permission-restricted | call / permission-restricted | peresmenka.call.permission-restricted.primary.001<br>peresmenka.call.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.default | chat / default | peresmenka.chat.default.primary.001<br>peresmenka.chat.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.loading | chat / loading | peresmenka.chat.loading.primary.001<br>peresmenka.chat.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.error | chat / error | peresmenka.chat.error.primary.001<br>peresmenka.chat.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.offline | chat / offline | peresmenka.chat.offline.primary.001<br>peresmenka.chat.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.permission-needed | chat / permission-needed | peresmenka.chat.permission-needed.primary.001<br>peresmenka.chat.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.permission-denied | chat / permission-denied | peresmenka.chat.permission-denied.primary.001<br>peresmenka.chat.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.chat.permission-restricted | chat / permission-restricted | peresmenka.chat.permission-restricted.primary.001<br>peresmenka.chat.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.default | lockscreen / default | peresmenka.lockscreen.default.primary.001<br>peresmenka.lockscreen.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.loading | lockscreen / loading | peresmenka.lockscreen.loading.primary.001<br>peresmenka.lockscreen.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.error | lockscreen / error | peresmenka.lockscreen.error.primary.001<br>peresmenka.lockscreen.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.offline | lockscreen / offline | peresmenka.lockscreen.offline.primary.001<br>peresmenka.lockscreen.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.permission-needed | lockscreen / permission-needed | peresmenka.lockscreen.permission-needed.primary.001<br>peresmenka.lockscreen.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.permission-denied | lockscreen / permission-denied | peresmenka.lockscreen.permission-denied.primary.001<br>peresmenka.lockscreen.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lockscreen.permission-restricted | lockscreen / permission-restricted | peresmenka.lockscreen.permission-restricted.primary.001<br>peresmenka.lockscreen.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.default | menu / default | peresmenka.menu.default.primary.001<br>peresmenka.menu.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.loading | menu / loading | peresmenka.menu.loading.primary.001<br>peresmenka.menu.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.error | menu / error | peresmenka.menu.error.primary.001<br>peresmenka.menu.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.offline | menu / offline | peresmenka.menu.offline.primary.001<br>peresmenka.menu.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.empty | menu / empty | peresmenka.menu.empty.primary.001<br>peresmenka.menu.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.permission-needed | menu / permission-needed | peresmenka.menu.permission-needed.primary.001<br>peresmenka.menu.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.permission-denied | menu / permission-denied | peresmenka.menu.permission-denied.primary.001<br>peresmenka.menu.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.menu.permission-restricted | menu / permission-restricted | peresmenka.menu.permission-restricted.primary.001<br>peresmenka.menu.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.default | lock / default | peresmenka.lock.default.primary.001<br>peresmenka.lock.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.loading | lock / loading | peresmenka.lock.loading.primary.001<br>peresmenka.lock.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.error | lock / error | peresmenka.lock.error.primary.001<br>peresmenka.lock.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.offline | lock / offline | peresmenka.lock.offline.primary.001<br>peresmenka.lock.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.permission-needed | lock / permission-needed | peresmenka.lock.permission-needed.primary.001<br>peresmenka.lock.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.permission-denied | lock / permission-denied | peresmenka.lock.permission-denied.primary.001<br>peresmenka.lock.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.lock.permission-restricted | lock / permission-restricted | peresmenka.lock.permission-restricted.primary.001<br>peresmenka.lock.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.money.default | money / default | peresmenka.money.default.primary.001<br>peresmenka.money.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.money.loading | money / loading | peresmenka.money.loading.primary.001<br>peresmenka.money.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.money.error | money / error | peresmenka.money.error.primary.001<br>peresmenka.money.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.money.offline | money / offline | peresmenka.money.offline.primary.001<br>peresmenka.money.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.default | passwords / default | peresmenka.passwords.default.primary.001<br>peresmenka.passwords.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.loading | passwords / loading | peresmenka.passwords.loading.primary.001<br>peresmenka.passwords.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.error | passwords / error | peresmenka.passwords.error.primary.001<br>peresmenka.passwords.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.offline | passwords / offline | peresmenka.passwords.offline.primary.001<br>peresmenka.passwords.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.permission-needed | passwords / permission-needed | peresmenka.passwords.permission-needed.primary.001<br>peresmenka.passwords.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.permission-denied | passwords / permission-denied | peresmenka.passwords.permission-denied.primary.001<br>peresmenka.passwords.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.passwords.permission-restricted | passwords / permission-restricted | peresmenka.passwords.permission-restricted.primary.001<br>peresmenka.passwords.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.default | fill / default | peresmenka.fill.default.primary.001<br>peresmenka.fill.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.loading | fill / loading | peresmenka.fill.loading.primary.001<br>peresmenka.fill.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.error | fill / error | peresmenka.fill.error.primary.001<br>peresmenka.fill.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.offline | fill / offline | peresmenka.fill.offline.primary.001<br>peresmenka.fill.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.permission-needed | fill / permission-needed | peresmenka.fill.permission-needed.primary.001<br>peresmenka.fill.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.permission-denied | fill / permission-denied | peresmenka.fill.permission-denied.primary.001<br>peresmenka.fill.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.fill.permission-restricted | fill / permission-restricted | peresmenka.fill.permission-restricted.primary.001<br>peresmenka.fill.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.default | settings / default | peresmenka.settings.default.primary.001<br>peresmenka.settings.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.loading | settings / loading | peresmenka.settings.loading.primary.001<br>peresmenka.settings.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.error | settings / error | peresmenka.settings.error.primary.001<br>peresmenka.settings.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.offline | settings / offline | peresmenka.settings.offline.primary.001<br>peresmenka.settings.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.empty | settings / empty | peresmenka.settings.empty.primary.001<br>peresmenka.settings.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.permission-needed | settings / permission-needed | peresmenka.settings.permission-needed.primary.001<br>peresmenka.settings.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.permission-denied | settings / permission-denied | peresmenka.settings.permission-denied.primary.001<br>peresmenka.settings.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.settings.permission-restricted | settings / permission-restricted | peresmenka.settings.permission-restricted.primary.001<br>peresmenka.settings.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.default | background / default | peresmenka.background.default.primary.001<br>peresmenka.background.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.loading | background / loading | peresmenka.background.loading.primary.001<br>peresmenka.background.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.error | background / error | peresmenka.background.error.primary.001<br>peresmenka.background.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.offline | background / offline | peresmenka.background.offline.primary.001<br>peresmenka.background.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.permission-needed | background / permission-needed | peresmenka.background.permission-needed.primary.001<br>peresmenka.background.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.permission-denied | background / permission-denied | peresmenka.background.permission-denied.primary.001<br>peresmenka.background.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.background.permission-restricted | background / permission-restricted | peresmenka.background.permission-restricted.primary.001<br>peresmenka.background.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.default | widget / default | peresmenka.widget.default.primary.001<br>peresmenka.widget.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.loading | widget / loading | peresmenka.widget.loading.primary.001<br>peresmenka.widget.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.error | widget / error | peresmenka.widget.error.primary.001<br>peresmenka.widget.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.offline | widget / offline | peresmenka.widget.offline.primary.001<br>peresmenka.widget.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.permission-needed | widget / permission-needed | peresmenka.widget.permission-needed.primary.001<br>peresmenka.widget.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.permission-denied | widget / permission-denied | peresmenka.widget.permission-denied.primary.001<br>peresmenka.widget.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.widget.permission-restricted | widget / permission-restricted | peresmenka.widget.permission-restricted.primary.001<br>peresmenka.widget.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.default | ads / default | peresmenka.ads.default.primary.001<br>peresmenka.ads.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.loading | ads / loading | peresmenka.ads.loading.primary.001<br>peresmenka.ads.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.error | ads / error | peresmenka.ads.error.primary.001<br>peresmenka.ads.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.offline | ads / offline | peresmenka.ads.offline.primary.001<br>peresmenka.ads.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.permission-needed | ads / permission-needed | peresmenka.ads.permission-needed.primary.001<br>peresmenka.ads.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.permission-denied | ads / permission-denied | peresmenka.ads.permission-denied.primary.001<br>peresmenka.ads.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |
| fixture.peresmenka.ads.permission-restricted | ads / permission-restricted | peresmenka.ads.permission-restricted.primary.001<br>peresmenka.ads.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/peresmenka/concept.json + curated native portfolio | no media |

## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| location | Точки рядом при устройстве и время в пути до открытой подмены | Только после действия ««Найти заведения рядом» и «Сначала ближние»» | Сценарий «Точки рядом при устройстве и время в пути до открытой подмены» на поверхности join | Точка выбирается по коду от управляющего, подмены сортируются по времени начала | contextual-gesture |
| wifiinfo | Отметка смены засчитывается сетью заведения, а не словом сотрудника | Только после действия ««Отметиться на смене»» | Сценарий «Отметка смены засчитывается сетью заведения, а не словом сотрудника» на поверхности checkin | Остаётся отметка вручную — её подтверждает старший смены, и в табеле она помечена как неподтверждённая | build-artifact |
| hotspot | Подключение к сети незнакомой точки по QR из подсобки — без него отметка не засчитается | Только после действия ««Подключиться»» | Сценарий «Подключение к сети незнакомой точки по QR из подсобки — без него отметка не засчитается» на поверхности netqr | Имя сети и пароль показываются текстом — вводятся руками в Настройках | build-artifact |
| camera | Фото витрины, кассы и холодильника в акт передачи смены плюс сканер QR | Только после действия ««Снять» и «Считать QR»» | Сценарий «Фото витрины, кассы и холодильника в акт передачи смены плюс сканер QR» на поверхности handover | Акт передачи заполняется галочками без снимков, сеть вводится руками | contextual-gesture |
| photos | График из скриншота: приложение находит снимки экрана с расписанием и раскладывает их на смены | Только после действия ««Найти график в скриншотах»» | Сценарий «График из скриншота: приложение находит снимки экрана с расписанием и раскладывает их на смены» на поверхности shifts | Смены заводятся вручную или считываются с QR-кода на распечатке графика | contextual-gesture |
| mic | Голосовой брифинг смены: что кончилось, что по акции, что передать вечерним | Только после действия ««Записать брифинг»» | Сценарий «Голосовой брифинг смены: что кончилось, что по акции, что передать вечерним» на поверхности brief | Брифинг остаётся текстовым — набирается на клавиатуре | contextual-gesture |
| speech | Расшифровка брифинга в текст рядом с записью | Только после действия ««Записать брифинг» — цепочкой с микрофоном» | Сценарий «Расшифровка брифинга в текст рядом с записью» на поверхности brief | Брифинг отправляется без расшифровки, слушать придётся звуком | contextual-gesture |
| audio | Брифинги слушают по дороге на смену: экран в кармане, на локскрине — Now Playing и ±15 секунд | Только после действия ««Слушать»» | Сценарий «Брифинги слушают по дороге на смену: экран в кармане, на локскрине — Now Playing и ±15 секунд» на поверхности brief | Без режима звук обрывается при блокировке — брифинг придётся слушать с открытым экраном | contextual-gesture |
| push | Уведомление, когда на выставленную смену откликнулись | Только после действия ««Искать подмену»» | Сценарий «Уведомление, когда на выставленную смену откликнулись» на поверхности shift | Отклики видны при открытии, на вкладке «Подмены» стоит счётчик | contextual-gesture |
| commnotif | Сообщение сменщика приходит с аватаром и попадает в сводку Focus | Только после действия ««Показывать как сообщение»» | Сценарий «Сообщение сменщика приходит с аватаром и попадает в сводку Focus» на поверхности chat | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки | build-artifact |
| voip | Звонок по смене без обмена номерами: телефон остаётся у владельца | Только после действия ««Позвонить»» | Сценарий «Звонок по смене без обмена номерами: телефон остаётся у владельца» на поверхности person | Без режима вызов приходит обычным уведомлением, и на него надо успеть открыть приложение | contextual-gesture |
| remotenotif | Перенос или отмена смены доезжает до виджета при закрытом приложении | Только после действия ««Следить за изменениями»» | Сценарий «Перенос или отмена смены доезжает до виджета при закрытом приложении» на поверхности shift | Без режима смена на виджете обновляется только после открытия приложения | app-lifecycle |
| fetch | График и открытые подмены готовы к первому открытию — до смены их читают на ходу | Только после действия ««Обновление в фоне»» | Сценарий «График и открытые подмены готовы к первому открытию — до смены их читают на ходу» на поверхности settings | Без режима график и подмены обновляются в момент открытия | app-lifecycle |
| bgtask | Идентификатор app.peresmenka.refresh — под ним планируется обновление графика | Только после действия ««Проверить задачу»» | Сценарий «Идентификатор app.peresmenka.refresh — под ним планируется обновление графика» на поверхности background | Незарегистрированный идентификатор — задача не запустится вообще | app-lifecycle |
| appgroups | Виджет «Ближайшая смена» и Share Extension видят данные приложения | Только после действия ««Виджет на экран „Домой“»» | Сценарий «Виджет «Ближайшая смена» и Share Extension видят данные приложения» на поверхности settings | Без группы виджет пустой, а пересланная в рабочий чат смена не доходит — не ship | build-artifact |
| keychain | Одна сессия: из виджета приложение открывается уже войденным | Только после действия ««Открыть смену» из виджета» | Сценарий «Одна сессия: из виджета приложение открывается уже войденным» на поверхности widget | Без общей группы вход придётся повторять в каждом расширении | build-artifact |
| autofill | Логины точки — планшет доставки, табельный портал — подставляются в Safari без пересылки в чат | Только после действия ««Включить автозаполнение»» | Сценарий «Логины точки — планшет доставки, табельный портал — подставляются в Safari без пересылки в чат» на поверхности passwords | Логин остаётся копировать руками из карточки точки | contextual-gesture |
| contacts | Кто из ваших контактов уже здесь: с ними подмена закрывается первой | Только после действия ««Найти среди контактов»» | Сценарий «Кто из ваших контактов уже здесь: с ними подмена закрывается первой» на поверхности people | Остаётся поиск по точке и по общим сменам | contextual-gesture |
| calendar | Смены в системном календаре, с правкой при переносе и удалением при отмене | Только после действия ««Добавить в Календарь»» | Сценарий «Смены в системном календаре, с правкой при переносе и удалением при отмене» на поверхности shift | Смена остаётся внутри «Пересменки», с напоминанием за час в приложении | contextual-gesture |
| faceid | Замок на разделе «Заработок»: ставка и часы не видны через плечо | Только после действия ««Открыть заработок»» | Сценарий «Замок на разделе «Заработок»: ставка и часы не видны через плечо» на поверхности menu | Остаётся код-пароль устройства | contextual-gesture |
| tracking | Объявления работодателей вместо платной подписки | Только после действия ««Продолжить»» | Сценарий «Объявления работодателей вместо платной подписки» на поверхности ads | Объявления остаются, но неперсонализированные — не по вашим точкам и специальности | contextual-gesture |

**Entitlements:** `com.apple.developer.networking.wifi-info`, `com.apple.developer.networking.HotspotConfiguration`, `aps-environment`, `com.apple.developer.usernotifications.communication`, `com.apple.security.application-groups`, `keychain-access-groups`
**Extension targets:** `notification-service`, `credential-provider`

## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product domain | Владеет сущностями и состояниями Смена | native/apps/peresmenka |
| Native runtime | Владеет системными разрешениями и lifecycle | native/Runtime |
| Visual language | Владеет семантической визуальной грамматикой | native/DesignSystem |

**Boundaries**
- Продуктовое состояние не живёт в визуальных примитивах
- Разрешения доступны только через причинное действие
- Web evidence не входит в native build graph

## Data, state, persistence, and integrations

**Entities**

- Точка
- Смена
- Подмена
- Отметка

**State**

- Текущая сессия
- Жизненный цикл Смена
- Состояния разрешений и восстановления

**Persistence**

- Локальный черновик переживает перезапуск
- Защищённые значения используют системное хранилище только по capability contract

**Integrations**

- Вход по номеру телефона и сессия: SDK провайдера: <code>VK ID</code> либо Firebase Phone Auth, токен в Keychain общей группы
- Профили, точки, график смен, отклики на подмены: Firestore со security rules: смену точки правят только те, кто к ней привязан. Правила — конфигурация, не серверный код
- Табель: кто и когда был на смене: Клиент: отметка пишется, только если SSID текущей сети совпал с сетью точки; часы считаются на устройстве, спорные отметки помечаются флагом
- Брифинги смены и их расшифровки: Firebase Storage для аудио, <code>SFSpeechRecognizer</code> на устройстве для текста — сервис распознавания не участвует
- Разбор присланного графика: <code>PHAsset</code> по подтипу «снимок экрана» и Vision OCR на устройстве; парсер таблицы — клиентский
- Уведомления об откликах и переносах: Firebase Cloud Messaging, рассылка из консоли провайдера; аватар подставляет Notification Service Extension
- Звонок сменщику без раскрытия номера: SDK провайдера звонков (LiveKit / Agora): адресация по идентификатору профиля, PushKit и CallKit на клиенте
- Поиск заведений и расстояний: <code>MKLocalSearch</code> и <code>MKDirections</code> — карты Apple, своего геосервиса нет
- Знакомые среди людей своих точек: Локальная сверка <code>CNContactStore</code> со списком, уже загруженным на устройство
- Рабочие логины точки: Keychain общей группы плюс Credential Provider extension; записи публикует управляющий точкой
- Заработок за период: CoreData на устройстве: часы из табеля умножаются на ставку, записанную в карточке точки. Расчётного листа приложение не выдаёт
- Монетизация без подписки: Рекламный SDK, ставки и креативы на стороне сети; ATT после экрана-объяснения

## Loading, empty, error, denied, and offline states

| State | Required behavior |
|---|---|
| loading | Сохранять контекст задачи и блокировать повторную отправку. |
| empty | Объяснить отсутствие смена и предложить первое полезное действие. |
| error | Назвать неуспешную операцию, сохранить ввод и дать повтор или альтернативу. |
| denied | Продолжить задачу через объявленный denied fallback. |
| offline | Показать сохранённые данные и явно отделить их от свежих. |

## Privacy, security, and trust

**Data inventory**

- Продуктовая единица «Смена»
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

- Доля подмен, завершившихся подтверждённой отметкой и сдачей
- Повтор основного цикла
- Завершение задачи после denied fallback

**Core-loop hypothesis.** Единый жизненный цикл снижает время закрытия подмен и споры о часах

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
- join--default
- manual--default
- shifts--default
- import--default
- shift--default
- checkin--default
- netqr--default
- scan--default
- handover--default
- shoot--default
- brief--default
- record--default
- player--default
- swaps--default
- swap--default
- people--default
- mates--default
- person--default
- call--default
- chat--default
- lockscreen--default
- menu--default
- lock--default
- money--default
- passwords--default
- fill--default
- settings--default
- background--default
- widget--default
- ads--default

**Evidence provenance**

- peresmenka-web-evidence · user-input · observed · platform/concepts/peresmenka/concept.json and screens
- peresmenka-reference · reference-profile · approved · approved differentiation strategy
- peresmenka-market-assumption · assumption · needs-validation · curated migration portfolio; real research not yet supplied

## Setup, build, and run

**Prerequisites**

- Node 22
- Xcode и iOS simulator

**Build**

- `npm run build -- peresmenka`

**Run and verify**

- `npm run check -- peresmenka`
- `npm run capture -- peresmenka`

## Generated and owned file map

| Generated — do not hand-edit | Product-owned source |
|---|---|
| native/build/peresmenka<br>concepts/peresmenka/docs/developer-guide.md | concepts/peresmenka/concept.json<br>native/apps/peresmenka |

## Limitations, risks, and acceptance criteria

**Limitations**

- Market demand ещё не подтверждён
- Web screens являются migration evidence, а не native layout
- Медиа требуют отдельной проверки лицензии
- Physical device и VoiceOver остаются ручными воротами

**Risks**

- risk: Работодатель не признаёт сетевую отметку достаточным фактом; mitigation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; killSignal: Более 10% закрытых смен оспариваются работодателем
- risk: Набор разрешений окажется шире реальной ценности; mitigation: Проверять каждое разрешение через достижимый flow; killSignal: Разрешение нельзя защитить наблюдаемым исходом

**Assumptions still requiring evidence**

- claim: Единый жизненный цикл снижает время закрытия подмен и споры о часах; risk: high; validation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; status: needs-validation
- claim: В одной точке достаточно работников и открытых подмен для полезного совпадения; risk: high; validation: Проверить supply и completion на пилотной когорте; status: needs-validation

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
- «Пересменка» — сеть тех, кто работает сменами: бариста, поваров, кассиров, официантов. Здесь нет резюме и откликов на вакансии. Есть один вопрос, вокруг которого всё построено: кто встанет на вашу смену в четверг в ночь.
