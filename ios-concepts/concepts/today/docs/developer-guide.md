# Сегодня: developer product guide

> Generated from Product Contract `product-c09f599227f7c0b9` and the compiled native manifest. Do not edit by hand.
> UX Specification: `ux-c814f0c463cd90fa`; source: `explicit-product-delivery`.
> Contract status: `mature`; maturity floor: `3/4`.

## Product vision and scope

**Thesis.** «Сегодня» раскрывает намерение только взаимным друзьям, находит совпавшее окно и закрывает временную группу после встречи.

**Audience.** Друзья 18–35 лет в одном городе

**Situation.** Освободился вечер, но писать каждому и собирать чат слишком долго; планы срываются не из-за отсутствия желания, а из-за слишком долгой координации

**Job.** Друзья 18–35 лет в одном городе wants to Не писать каждому другу и не создавать бессрочный групповой чат so that За несколько минут превратить совпавшее желание друзей в подтверждённую встречу.

**Wedge.** Намерение с TTL сопоставляется по взаимным друзьям, времени и допустимому расстоянию

**Observable differentiation.** Друзья подтверждают конкретное время и место вместо обмена неопределёнными сообщениями; measured by Доля созданных планов, получивших двух подтверждённых участников и место; threshold: Не менее 30% активированных участников завершают основной исход в пилоте.

**In scope**

- План сегодня
- Обложка приватного плана
- Фото для обложки
- Голосовое в группе
- Места между друзьями
- Совпадение с другом
- Чаты с аватарами в уведомлениях
- Актуальный состав плана
- Свежие планы к запуску
- Зарегистрированная задача обновления
- Виджет ближайшего плана
- Один вход для приложения и виджета
- Вход на сайт сохранённой связкой
- Статус «на месте»
- Подтверждённый план в системном календаре, с правкой при переносе времени и удалением при отмене
- Кто из контактов уже в «Сегодня»: круг близких — единственный источник совпадений
- Замок на планах: кто свободен, во сколько и где встречаетесь
- Сказать план голосом: «в семь на катке» — время и место распознаются на устройстве
- Реклама мест и событий вместо платной подписки
- Поделиться местом из Карт или ссылкой из Safari — падает прямо в план
- Гостевая сеть места встречи по QR — без неё отметка «я на месте» не проходит
- Созвон участников плана: в план зовут друзей друзей, номерами при этом не обмениваются
- Голосовые из плана играют подряд по дороге к месту: на локскрине — Now Playing и ±15 секунд

**Non-goals**

- Публичная лента
- Знакомства с незнакомцами
- Календарь на месяцы

## Domain glossary

| Term | Definition |
|---|---|
| Намерение | Приватное желание человека встретиться в ограниченном окне текущего дня. |
| Совпадение | Пересечение намерений и времени взаимных друзей. |
| План сегодня | Временная договорённость друзей с участниками, временем и местом. |
| Группа плана | Чат подтверждённых участников, архивируемый после встречи. |

## Personas and jobs

| Persona | Context | Job |
|---|---|---|
| Основной участник | Освободился вечер, но писать каждому и собирать чат слишком долго | За несколько минут превратить совпавшее желание друзей в подтверждённую встречу |
| Контрагент | Взаимные друзья раскрывают намерение только выбранному кругу и временной группе плана | Ответить на план сегодня и закрыть следующий шаг |
| Возвращающийся участник | Проверить совпадения сегодня | Продолжить незавершённый план сегодня |

## Core loop and critical flows

**Core loop:** Освободилось время или друг раскрыл совместимое намерение → Раскрыть намерение выбранным друзьям и подтвердить совпавший План сегодня → За несколько минут превратить совпавшее желание друзей в подтверждённую встречу → Подтвердить результат и сделать следующий план сегодня полезнее.
**Habit loop:** Освободилось время или друг раскрыл совместимое намерение → Раскрыть намерение выбранным друзьям и подтвердить совпавший План сегодня → За несколько минут превратить совпавшее желание друзей в подтверждённую встречу; cadence: Событийно, без искусственного ежедневного обещания.
**Activation:** Участник завершил первый значимый шаг в «План сегодня»; signal: today-intent-match_activated; window: Первые семь дней.

| Flow | Trigger | Steps | Outcome |
|---|---|---|---|
| Весь продукт | phone | phone<br>code<br>codefail<br>home<br>match<br>nearby<br>plan<br>create | От желания до временной группы и встречи |
| Собрать план | plan | plan<br>netqr<br>onway<br>nearby<br>create<br>camera<br>media<br>match | Желание, совпадение и место |
| Создать план | profile | profile<br>settings<br>groups<br>nearby<br>create<br>chats<br>mates<br>shareext | Приглашённые, время и необязательная обложка |

## Information architecture and navigation

**Navigation model.** Продукт сохраняет идентифицированные связи и коммуникацию, но строит собственную задачно-ориентированную навигацию.
**Reference fit.** Идентичность, взаимные связи и чат остаются знакомыми, но собственная навигация оптимизирована под краткоживущий план, а не публичную ленту.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| home | tab | — | tab:home<br>permission:refresh.bgtask<br>permission:widget.keychain | present:null<br>present:null<br>navigate:open-match<br>permission:location | session.authenticated<br>capability.bgtask.requested<br>capability.keychain.requested | none:none |
| match | push | home | parent:home<br>action:home.open-match | mutate:complete-match | always | pop:home |
| nearby | tab | — | tab:nearby<br>permission:home.location | present:null<br>navigate:open-plan | session.authenticated<br>capability.location.requested | none:none |
| plan | push | nearby | parent:nearby<br>action:nearby.open-plan<br>permission:plan.remotenotif<br>permission:plan.wifiinfo<br>permission:plan.calendar | present:null<br>present:null<br>navigate:open-onway<br>permission:remotenotif<br>permission:wifiinfo<br>permission:calendar | always<br>capability.remotenotif.requested<br>capability.wifiinfo.requested<br>capability.calendar.requested | pop:nearby |
| create | tab | — | tab:create | present:null<br>present:null<br>present:null<br>navigate:open-camera<br>permission:camera<br>permission:photos<br>permission:speech | session.authenticated | none:none |
| camera | cover | create | parent:create<br>action:create.open-camera<br>permission:create.camera | mutate:complete-camera | always<br>capability.camera.requested | dismiss:create; interactive-or-action:create |
| media | push | create | parent:create<br>permission:create.photos | mutate:complete-media | capability.photos.requested | pop:create |
| groups | push | home | parent:home | mutate:complete-groups | none | pop:home |
| chats | tab | — | tab:chats | present:null<br>navigate:open-chat | session.authenticated | none:none |
| chat | push | chats | parent:chats<br>action:chats.open-chat<br>permission:chat.commnotif | present:null<br>present:null<br>navigate:open-voice<br>permission:mic<br>permission:commnotif<br>permission:voip | always<br>capability.commnotif.requested | pop:chats |
| voice | sheet | chat | parent:chat<br>action:chat.open-voice<br>permission:chat.mic | mutate:complete-voice | always<br>capability.mic.requested | dismiss:chat; interactive-or-action:chat |
| profile | tab | — | tab:profile<br>permission:ads.tracking | present:null<br>present:null<br>navigate:open-settings<br>permission:contacts | session.authenticated<br>capability.tracking.requested | none:none |
| settings | push | profile | parent:profile<br>action:profile.open-settings<br>permission:settings.push<br>permission:settings.fetch | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-widget<br>permission:push<br>permission:fetch<br>permission:appgroups<br>permission:autofill<br>permission:faceid<br>permission:shareext | always<br>capability.push.requested<br>capability.fetch.requested | pop:profile |
| widget | cover | settings | parent:settings<br>action:settings.open-widget<br>permission:settings.appgroups | mutate:complete-widget<br>permission:keychain | always<br>capability.appgroups.requested | dismiss:settings; interactive-or-action:settings |
| fill | cover | settings | parent:settings<br>permission:settings.autofill | mutate:complete-fill | capability.autofill.requested | dismiss:settings; interactive-or-action:settings |
| refresh | push | settings | parent:settings | mutate:complete-refresh<br>permission:bgtask | none | pop:settings |
| mates | push | profile | parent:profile<br>permission:profile.contacts | mutate:complete-mates | capability.contacts.requested | pop:profile |
| ads | sheet | settings | parent:settings | mutate:complete-ads<br>permission:tracking | none | dismiss:settings; interactive-or-action:settings |
| lock | push | settings | parent:settings<br>permission:settings.faceid | mutate:complete-lock | capability.faceid.requested | pop:settings |
| sayplan | push | create | parent:create<br>permission:create.speech | mutate:complete-sayplan | capability.speech.requested | pop:create |
| onway | push | plan | parent:plan<br>action:plan.open-onway | present:null<br>navigate:open-background<br>permission:audio | always | pop:plan |
| background | cover | onway | parent:onway<br>action:onway.open-background<br>permission:onway.audio | mutate:complete-background | always<br>capability.audio.requested | dismiss:onway; interactive-or-action:onway |
| call | cover | chat | parent:chat<br>permission:chat.voip | mutate:complete-call | capability.voip.requested | dismiss:chat; interactive-or-action:chat |
| netqr | sheet | plan | parent:plan<br>permission:netqr.hotspot | mutate:complete-netqr<br>permission:hotspot | capability.hotspot.requested | dismiss:plan; interactive-or-action:plan |
| shareext | sheet | settings | parent:settings<br>permission:settings.shareext | mutate:complete-shareext | capability.shareext.requested | dismiss:settings; interactive-or-action:settings |

## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Войти | root | default<br>loading<br>error<br>offline | Продолжить с почтой → navigate:code |
| code | Подтвердить вход | push | default<br>loading<br>error<br>offline | Продолжить → navigate:codefail |
| codefail | Показать ошибку OTP и вернуть к вводу | push | default<br>loading<br>error<br>offline | Продолжить → mutate:codefail.completed |
| home | Отметить желание и окно времени | tab | default<br>empty<br>loading<br>error<br>offline | Показать совпадения → navigate:match |
| match | Проверить совпадение с другом | push | default<br>loading<br>error<br>offline | Собрать план → mutate:match.completed |
| nearby | Найти совпадение среди близких друзей | tab | default<br>empty<br>loading<br>error<br>offline | Открыть plan → navigate:plan |
| plan | Встретиться | push | default<br>loading<br>error<br>offline | Подтвердить план → navigate:onway |
| create | Пригласить друзей в приватный план | tab | default<br>error<br>success<br>loading<br>offline | Отправить приглашение → navigate:camera |
| camera | Снять обложку плана | cover | default<br>denied<br>loading<br>error<br>offline | Продолжить: Камера → mutate:camera.completed |
| media | Выбрать фото | push | default<br>loading<br>error<br>offline | Продолжить: Фото → mutate:media.completed |
| groups | Управлять близкими друзьями | push | default<br>empty<br>loading<br>error<br>offline | Продолжить: Друзья → mutate:groups.completed |
| chats | Вернуться к активным планам | tab | default<br>empty<br>loading<br>error<br>offline | Открыть chat → navigate:chat |
| chat | Договориться | push | default<br>loading<br>error<br>offline | Открыть voice → navigate:voice |
| voice | Записать голос | sheet | default<br>denied<br>loading<br>error<br>offline | Отправить → mutate:voice.completed |
| profile | Управлять профилем | tab | default<br>loading<br>error<br>offline | Открыть settings → navigate:settings |
| settings | Держать доступы и системные функции под рукой | push | default<br>loading<br>error<br>offline | Обновлять планы в фоне → navigate:widget |
| widget | Поставить виджет ближайшего плана на экран «Домой» | cover | default<br>loading<br>error<br>offline | Открыть «Сегодня» → mutate:widget.completed |
| fill | Войти на сайт сохранённым в «Сегодня» входом | cover | default<br>loading<br>error<br>offline | Войти → mutate:fill.completed |
| refresh | Проверить, что фоновое обновление работает | push | default<br>loading<br>error<br>offline | Проверить задачу → mutate:refresh.completed |
| mates | Найти своих среди тех, кто уже здесь | push | default<br>empty<br>denied<br>loading<br>error<br>offline | Продолжить: Контакты в «Сегодня» → mutate:mates.completed |
| ads | Объяснить обмен до системного запроса ATT | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:ads.completed |
| lock | Закрыть планы и окна свободного времени биометрией | push | default<br>denied<br>loading<br>error<br>offline | Замок Face ID → mutate:lock.completed |
| sayplan | Разобрать сказанное вслух на время и место | push | default<br>error<br>success<br>loading<br>offline | Собрать план → mutate:sayplan.completed |
| onway | Слушать голосовые участников подряд, не разблокируя телефон | push | default<br>loading<br>error<br>offline | Слушать подряд → navigate:background |
| background | Показать, что очередь голосовых играет при погашенном экране | cover | default<br>loading<br>error<br>offline | Продолжить: Экран погас → mutate:background.completed |
| call | Договориться на ходу, не раскрывая номер | cover | default<br>loading<br>error<br>offline | Продолжить: Созвон по плану → mutate:call.completed |
| netqr | Подключиться к гостевой сети места встречи | sheet | default<br>error<br>loading<br>offline | Подключиться → mutate:netqr.completed |
| shareext | Принять место или ссылку из другого приложения в план | sheet | default<br>success<br>loading<br>error<br>offline | Добавить в план → mutate:shareext.completed |

## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | open-code | open-code:navigate→code | screen.phone.state.loading.recovery | fixture.today.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | open-code | open-code:navigate→code | screen.phone.state.populated-default.recovery | fixture.today.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | open-code | open-code:navigate→code | screen.phone.state.error.recovery | fixture.today.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | open-code | open-code:navigate→code | screen.phone.state.offline.recovery | fixture.today.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.loading.recovery | fixture.today.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.populated-default.recovery | fixture.today.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.error.recovery | fixture.today.code.error |
| code | offline | yes | screen.code.state.offline.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.offline.recovery | fixture.today.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.loading.recovery | fixture.today.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.populated-default.recovery | fixture.today.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.error.recovery | fixture.today.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.offline.recovery | fixture.today.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| home | loading | yes | screen.home.state.loading.body | open-match | open-match:navigate→match | screen.home.state.loading.recovery | fixture.today.home.loading |
| home | populated/default | yes | screen.home.state.populated-default.body | open-match | open-match:navigate→match | screen.home.state.populated-default.recovery | fixture.today.home.default |
| home | empty | yes | screen.home.state.empty.body | open-match | open-match:navigate→match | screen.home.state.empty.recovery | fixture.today.home.empty |
| home | error | yes | screen.home.state.error.body | open-match | open-match:navigate→match | screen.home.state.error.recovery | fixture.today.home.error |
| home | offline | yes | screen.home.state.offline.body | open-match | open-match:navigate→match | screen.home.state.offline.recovery | fixture.today.home.offline |
| home | permission-needed | yes | screen.home.state.permission-needed.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-needed.recovery | fixture.today.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-denied.recovery | fixture.today.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-restricted.recovery | fixture.today.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-limited.recovery | fixture.today.home.permission-limited |
| match | loading | yes | screen.match.state.loading.body | complete-match | complete-match:mutate | screen.match.state.loading.recovery | fixture.today.match.loading |
| match | populated/default | yes | screen.match.state.populated-default.body | complete-match | complete-match:mutate | screen.match.state.populated-default.recovery | fixture.today.match.default |
| match | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| match | error | yes | screen.match.state.error.body | complete-match | complete-match:mutate | screen.match.state.error.recovery | fixture.today.match.error |
| match | offline | yes | screen.match.state.offline.body | complete-match | complete-match:mutate | screen.match.state.offline.recovery | fixture.today.match.offline |
| match | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| match | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| match | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| match | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| nearby | loading | yes | screen.nearby.state.loading.body | open-plan | open-plan:navigate→plan | screen.nearby.state.loading.recovery | fixture.today.nearby.loading |
| nearby | populated/default | yes | screen.nearby.state.populated-default.body | open-plan | open-plan:navigate→plan | screen.nearby.state.populated-default.recovery | fixture.today.nearby.default |
| nearby | empty | yes | screen.nearby.state.empty.body | open-plan | open-plan:navigate→plan | screen.nearby.state.empty.recovery | fixture.today.nearby.empty |
| nearby | error | yes | screen.nearby.state.error.body | open-plan | open-plan:navigate→plan | screen.nearby.state.error.recovery | fixture.today.nearby.error |
| nearby | offline | yes | screen.nearby.state.offline.body | open-plan | open-plan:navigate→plan | screen.nearby.state.offline.recovery | fixture.today.nearby.offline |
| nearby | permission-needed | yes | screen.nearby.state.permission-needed.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-needed.recovery | fixture.today.nearby.permission-needed |
| nearby | permission-denied | yes | screen.nearby.state.permission-denied.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-denied.recovery | fixture.today.nearby.permission-denied |
| nearby | permission-restricted | yes | screen.nearby.state.permission-restricted.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-restricted.recovery | fixture.today.nearby.permission-restricted |
| nearby | permission-limited | yes | screen.nearby.state.permission-limited.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-limited.recovery | fixture.today.nearby.permission-limited |
| plan | loading | yes | screen.plan.state.loading.body | open-onway | open-onway:navigate→onway | screen.plan.state.loading.recovery | fixture.today.plan.loading |
| plan | populated/default | yes | screen.plan.state.populated-default.body | open-onway | open-onway:navigate→onway | screen.plan.state.populated-default.recovery | fixture.today.plan.default |
| plan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| plan | error | yes | screen.plan.state.error.body | open-onway | open-onway:navigate→onway | screen.plan.state.error.recovery | fixture.today.plan.error |
| plan | offline | yes | screen.plan.state.offline.body | open-onway | open-onway:navigate→onway | screen.plan.state.offline.recovery | fixture.today.plan.offline |
| plan | permission-needed | yes | screen.plan.state.permission-needed.body | open-onway<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback<br>permission.calendar.fallback | open-onway:navigate→onway | screen.plan.state.permission-needed.recovery | fixture.today.plan.permission-needed |
| plan | permission-denied | yes | screen.plan.state.permission-denied.body | open-onway<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback<br>permission.calendar.fallback | open-onway:navigate→onway | screen.plan.state.permission-denied.recovery | fixture.today.plan.permission-denied |
| plan | permission-restricted | yes | screen.plan.state.permission-restricted.body | open-onway<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback<br>permission.calendar.fallback | open-onway:navigate→onway | screen.plan.state.permission-restricted.recovery | fixture.today.plan.permission-restricted |
| plan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| create | loading | yes | screen.create.state.loading.body | open-camera | open-camera:navigate→camera | screen.create.state.loading.recovery | fixture.today.create.loading |
| create | populated/default | yes | screen.create.state.populated-default.body | open-camera | open-camera:navigate→camera | screen.create.state.populated-default.recovery | fixture.today.create.default<br>fixture.today.create.success |
| create | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| create | error | yes | screen.create.state.error.body | open-camera | open-camera:navigate→camera | screen.create.state.error.recovery | fixture.today.create.error |
| create | offline | yes | screen.create.state.offline.body | open-camera | open-camera:navigate→camera | screen.create.state.offline.recovery | fixture.today.create.offline |
| create | permission-needed | yes | screen.create.state.permission-needed.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-needed.recovery | fixture.today.create.permission-needed |
| create | permission-denied | yes | screen.create.state.permission-denied.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-denied.recovery | fixture.today.create.permission-denied |
| create | permission-restricted | yes | screen.create.state.permission-restricted.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-restricted.recovery | fixture.today.create.permission-restricted |
| create | permission-limited | yes | screen.create.state.permission-limited.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-limited.recovery | fixture.today.create.permission-limited |
| camera | loading | yes | screen.camera.state.loading.body | complete-camera | complete-camera:mutate | screen.camera.state.loading.recovery | fixture.today.camera.loading |
| camera | populated/default | yes | screen.camera.state.populated-default.body | complete-camera | complete-camera:mutate | screen.camera.state.populated-default.recovery | fixture.today.camera.default |
| camera | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| camera | error | yes | screen.camera.state.error.body | complete-camera | complete-camera:mutate | screen.camera.state.error.recovery | fixture.today.camera.error |
| camera | offline | yes | screen.camera.state.offline.body | complete-camera | complete-camera:mutate | screen.camera.state.offline.recovery | fixture.today.camera.offline |
| camera | permission-needed | yes | screen.camera.state.permission-needed.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-needed.recovery | fixture.today.camera.permission-needed |
| camera | permission-denied | yes | screen.camera.state.permission-denied.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-denied.recovery | fixture.today.camera.denied |
| camera | permission-restricted | yes | screen.camera.state.permission-restricted.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-restricted.recovery | fixture.today.camera.permission-restricted |
| camera | permission-limited | yes | screen.camera.state.permission-limited.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-limited.recovery | fixture.today.camera.permission-limited |
| media | loading | yes | screen.media.state.loading.body | complete-media | complete-media:mutate | screen.media.state.loading.recovery | fixture.today.media.loading |
| media | populated/default | yes | screen.media.state.populated-default.body | complete-media | complete-media:mutate | screen.media.state.populated-default.recovery | fixture.today.media.default |
| media | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| media | error | yes | screen.media.state.error.body | complete-media | complete-media:mutate | screen.media.state.error.recovery | fixture.today.media.error |
| media | offline | yes | screen.media.state.offline.body | complete-media | complete-media:mutate | screen.media.state.offline.recovery | fixture.today.media.offline |
| media | permission-needed | yes | screen.media.state.permission-needed.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-needed.recovery | fixture.today.media.permission-needed |
| media | permission-denied | yes | screen.media.state.permission-denied.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-denied.recovery | fixture.today.media.permission-denied |
| media | permission-restricted | yes | screen.media.state.permission-restricted.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-restricted.recovery | fixture.today.media.permission-restricted |
| media | permission-limited | yes | screen.media.state.permission-limited.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-limited.recovery | fixture.today.media.permission-limited |
| groups | loading | yes | screen.groups.state.loading.body | complete-groups | complete-groups:mutate | screen.groups.state.loading.recovery | fixture.today.groups.loading |
| groups | populated/default | yes | screen.groups.state.populated-default.body | complete-groups | complete-groups:mutate | screen.groups.state.populated-default.recovery | fixture.today.groups.default |
| groups | empty | yes | screen.groups.state.empty.body | complete-groups | complete-groups:mutate | screen.groups.state.empty.recovery | fixture.today.groups.empty |
| groups | error | yes | screen.groups.state.error.body | complete-groups | complete-groups:mutate | screen.groups.state.error.recovery | fixture.today.groups.error |
| groups | offline | yes | screen.groups.state.offline.body | complete-groups | complete-groups:mutate | screen.groups.state.offline.recovery | fixture.today.groups.offline |
| groups | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| groups | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| groups | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| groups | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chats | loading | yes | screen.chats.state.loading.body | open-chat | open-chat:navigate→chat | screen.chats.state.loading.recovery | fixture.today.chats.loading |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.today.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.today.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.today.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.today.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-voice | open-voice:navigate→voice | screen.chat.state.loading.recovery | fixture.today.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-voice | open-voice:navigate→voice | screen.chat.state.populated-default.recovery | fixture.today.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-voice | open-voice:navigate→voice | screen.chat.state.error.recovery | fixture.today.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-voice | open-voice:navigate→voice | screen.chat.state.offline.recovery | fixture.today.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-needed.recovery | fixture.today.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-denied.recovery | fixture.today.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-restricted.recovery | fixture.today.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | yes | screen.voice.state.loading.body | complete-voice | complete-voice:mutate | screen.voice.state.loading.recovery | fixture.today.voice.loading |
| voice | populated/default | yes | screen.voice.state.populated-default.body | complete-voice | complete-voice:mutate | screen.voice.state.populated-default.recovery | fixture.today.voice.default |
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | complete-voice | complete-voice:mutate | screen.voice.state.error.recovery | fixture.today.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | complete-voice | complete-voice:mutate | screen.voice.state.offline.recovery | fixture.today.voice.offline |
| voice | permission-needed | yes | screen.voice.state.permission-needed.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-needed.recovery | fixture.today.voice.permission-needed |
| voice | permission-denied | yes | screen.voice.state.permission-denied.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-denied.recovery | fixture.today.voice.denied |
| voice | permission-restricted | yes | screen.voice.state.permission-restricted.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-restricted.recovery | fixture.today.voice.permission-restricted |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| profile | loading | yes | screen.profile.state.loading.body | open-settings | open-settings:navigate→settings | screen.profile.state.loading.recovery | fixture.today.profile.loading |
| profile | populated/default | yes | screen.profile.state.populated-default.body | open-settings | open-settings:navigate→settings | screen.profile.state.populated-default.recovery | fixture.today.profile.default |
| profile | empty | yes | screen.profile.state.empty.body | open-settings | open-settings:navigate→settings | screen.profile.state.empty.recovery | fixture.today.profile.empty |
| profile | error | yes | screen.profile.state.error.body | open-settings | open-settings:navigate→settings | screen.profile.state.error.recovery | fixture.today.profile.error |
| profile | offline | yes | screen.profile.state.offline.body | open-settings | open-settings:navigate→settings | screen.profile.state.offline.recovery | fixture.today.profile.offline |
| profile | permission-needed | yes | screen.profile.state.permission-needed.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-needed.recovery | fixture.today.profile.permission-needed |
| profile | permission-denied | yes | screen.profile.state.permission-denied.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-denied.recovery | fixture.today.profile.permission-denied |
| profile | permission-restricted | yes | screen.profile.state.permission-restricted.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-restricted.recovery | fixture.today.profile.permission-restricted |
| profile | permission-limited | yes | screen.profile.state.permission-limited.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-limited.recovery | fixture.today.profile.permission-limited |
| settings | loading | yes | screen.settings.state.loading.body | open-widget | open-widget:navigate→widget | screen.settings.state.loading.recovery | fixture.today.settings.loading |
| settings | populated/default | yes | screen.settings.state.populated-default.body | open-widget | open-widget:navigate→widget | screen.settings.state.populated-default.recovery | fixture.today.settings.default |
| settings | empty | yes | screen.settings.state.empty.body | open-widget | open-widget:navigate→widget | screen.settings.state.empty.recovery | fixture.today.settings.empty |
| settings | error | yes | screen.settings.state.error.body | open-widget | open-widget:navigate→widget | screen.settings.state.error.recovery | fixture.today.settings.error |
| settings | offline | yes | screen.settings.state.offline.body | open-widget | open-widget:navigate→widget | screen.settings.state.offline.recovery | fixture.today.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | open-widget<br>permission.push.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | open-widget:navigate→widget | screen.settings.state.permission-needed.recovery | fixture.today.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | open-widget<br>permission.push.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | open-widget:navigate→widget | screen.settings.state.permission-denied.recovery | fixture.today.settings.permission-denied |
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | open-widget<br>permission.push.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | open-widget:navigate→widget | screen.settings.state.permission-restricted.recovery | fixture.today.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | yes | screen.widget.state.loading.body | complete-widget | complete-widget:mutate | screen.widget.state.loading.recovery | fixture.today.widget.loading |
| widget | populated/default | yes | screen.widget.state.populated-default.body | complete-widget | complete-widget:mutate | screen.widget.state.populated-default.recovery | fixture.today.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | yes | screen.widget.state.error.body | complete-widget | complete-widget:mutate | screen.widget.state.error.recovery | fixture.today.widget.error |
| widget | offline | yes | screen.widget.state.offline.body | complete-widget | complete-widget:mutate | screen.widget.state.offline.recovery | fixture.today.widget.offline |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-needed.recovery | fixture.today.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-denied.recovery | fixture.today.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-restricted.recovery | fixture.today.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | yes | screen.fill.state.loading.body | complete-fill | complete-fill:mutate | screen.fill.state.loading.recovery | fixture.today.fill.loading |
| fill | populated/default | yes | screen.fill.state.populated-default.body | complete-fill | complete-fill:mutate | screen.fill.state.populated-default.recovery | fixture.today.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | yes | screen.fill.state.error.body | complete-fill | complete-fill:mutate | screen.fill.state.error.recovery | fixture.today.fill.error |
| fill | offline | yes | screen.fill.state.offline.body | complete-fill | complete-fill:mutate | screen.fill.state.offline.recovery | fixture.today.fill.offline |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-needed.recovery | fixture.today.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-denied.recovery | fixture.today.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-restricted.recovery | fixture.today.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| refresh | loading | yes | screen.refresh.state.loading.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.loading.recovery | fixture.today.refresh.loading |
| refresh | populated/default | yes | screen.refresh.state.populated-default.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.populated-default.recovery | fixture.today.refresh.default |
| refresh | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| refresh | error | yes | screen.refresh.state.error.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.error.recovery | fixture.today.refresh.error |
| refresh | offline | yes | screen.refresh.state.offline.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.offline.recovery | fixture.today.refresh.offline |
| refresh | permission-needed | yes | screen.refresh.state.permission-needed.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-needed.recovery | fixture.today.refresh.permission-needed |
| refresh | permission-denied | yes | screen.refresh.state.permission-denied.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-denied.recovery | fixture.today.refresh.permission-denied |
| refresh | permission-restricted | yes | screen.refresh.state.permission-restricted.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-restricted.recovery | fixture.today.refresh.permission-restricted |
| refresh | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| mates | loading | yes | screen.mates.state.loading.body | complete-mates | complete-mates:mutate | screen.mates.state.loading.recovery | fixture.today.mates.loading |
| mates | populated/default | yes | screen.mates.state.populated-default.body | complete-mates | complete-mates:mutate | screen.mates.state.populated-default.recovery | fixture.today.mates.default |
| mates | empty | yes | screen.mates.state.empty.body | complete-mates | complete-mates:mutate | screen.mates.state.empty.recovery | fixture.today.mates.empty |
| mates | error | yes | screen.mates.state.error.body | complete-mates | complete-mates:mutate | screen.mates.state.error.recovery | fixture.today.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | complete-mates | complete-mates:mutate | screen.mates.state.offline.recovery | fixture.today.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-needed.recovery | fixture.today.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-denied.recovery | fixture.today.mates.denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-restricted.recovery | fixture.today.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-limited.recovery | fixture.today.mates.permission-limited |
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.today.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.today.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.today.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.today.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.today.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.today.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.today.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.today.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.today.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.today.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.today.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.today.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.today.lock.denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.today.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| sayplan | loading | yes | screen.sayplan.state.loading.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.loading.recovery | fixture.today.sayplan.loading |
| sayplan | populated/default | yes | screen.sayplan.state.populated-default.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.populated-default.recovery | fixture.today.sayplan.default<br>fixture.today.sayplan.success |
| sayplan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| sayplan | error | yes | screen.sayplan.state.error.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.error.recovery | fixture.today.sayplan.error |
| sayplan | offline | yes | screen.sayplan.state.offline.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.offline.recovery | fixture.today.sayplan.offline |
| sayplan | permission-needed | yes | screen.sayplan.state.permission-needed.body | complete-sayplan<br>permission.speech.fallback | complete-sayplan:mutate | screen.sayplan.state.permission-needed.recovery | fixture.today.sayplan.permission-needed |
| sayplan | permission-denied | yes | screen.sayplan.state.permission-denied.body | complete-sayplan<br>permission.speech.fallback | complete-sayplan:mutate | screen.sayplan.state.permission-denied.recovery | fixture.today.sayplan.permission-denied |
| sayplan | permission-restricted | yes | screen.sayplan.state.permission-restricted.body | complete-sayplan<br>permission.speech.fallback | complete-sayplan:mutate | screen.sayplan.state.permission-restricted.recovery | fixture.today.sayplan.permission-restricted |
| sayplan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| onway | loading | yes | screen.onway.state.loading.body | open-background | open-background:navigate→background | screen.onway.state.loading.recovery | fixture.today.onway.loading |
| onway | populated/default | yes | screen.onway.state.populated-default.body | open-background | open-background:navigate→background | screen.onway.state.populated-default.recovery | fixture.today.onway.default |
| onway | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| onway | error | yes | screen.onway.state.error.body | open-background | open-background:navigate→background | screen.onway.state.error.recovery | fixture.today.onway.error |
| onway | offline | yes | screen.onway.state.offline.body | open-background | open-background:navigate→background | screen.onway.state.offline.recovery | fixture.today.onway.offline |
| onway | permission-needed | yes | screen.onway.state.permission-needed.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.onway.state.permission-needed.recovery | fixture.today.onway.permission-needed |
| onway | permission-denied | yes | screen.onway.state.permission-denied.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.onway.state.permission-denied.recovery | fixture.today.onway.permission-denied |
| onway | permission-restricted | yes | screen.onway.state.permission-restricted.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.onway.state.permission-restricted.recovery | fixture.today.onway.permission-restricted |
| onway | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | complete-background | complete-background:mutate | screen.background.state.loading.recovery | fixture.today.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | complete-background | complete-background:mutate | screen.background.state.populated-default.recovery | fixture.today.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | complete-background | complete-background:mutate | screen.background.state.error.recovery | fixture.today.background.error |
| background | offline | yes | screen.background.state.offline.body | complete-background | complete-background:mutate | screen.background.state.offline.recovery | fixture.today.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-needed.recovery | fixture.today.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-denied.recovery | fixture.today.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-restricted.recovery | fixture.today.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.today.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.today.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.today.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.today.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.today.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.today.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.today.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.loading.recovery | fixture.today.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.populated-default.recovery | fixture.today.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.error.recovery | fixture.today.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.offline.recovery | fixture.today.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-needed.recovery | fixture.today.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-denied.recovery | fixture.today.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-restricted.recovery | fixture.today.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shareext | loading | yes | screen.shareext.state.loading.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.loading.recovery | fixture.today.shareext.loading |
| shareext | populated/default | yes | screen.shareext.state.populated-default.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.populated-default.recovery | fixture.today.shareext.default<br>fixture.today.shareext.success |
| shareext | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shareext | error | yes | screen.shareext.state.error.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.error.recovery | fixture.today.shareext.error |
| shareext | offline | yes | screen.shareext.state.offline.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.offline.recovery | fixture.today.shareext.offline |
| shareext | permission-needed | yes | screen.shareext.state.permission-needed.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-needed.recovery | fixture.today.shareext.permission-needed |
| shareext | permission-denied | yes | screen.shareext.state.permission-denied.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-denied.recovery | fixture.today.shareext.permission-denied |
| shareext | permission-restricted | yes | screen.shareext.state.permission-restricted.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-restricted.recovery | fixture.today.shareext.permission-restricted |
| shareext | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |

## Design tokens and semantic component roles

**SwiftUI environment:** `NativeVisualLanguage`. SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.

| Token | Value |
|---|---|
| accent | #2688EB |
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
| home | collection<br>filters |
| match | summary<br>content<br>next-action |
| nearby | collection<br>filters |
| plan | summary<br>content<br>next-action |
| create | task-intro<br>form<br>primary-action |
| camera | summary<br>content<br>next-action |
| media | summary<br>content<br>next-action |
| groups | summary<br>content<br>next-action |
| chats | chat<br>message-list<br>composer |
| chat | chat<br>message-list<br>composer |
| voice | chat<br>message-list<br>composer |
| profile | collection<br>filters |
| settings | collection<br>filters |
| widget | summary<br>content<br>next-action |
| fill | summary<br>content<br>next-action |
| refresh | summary<br>content<br>next-action |
| mates | summary<br>content<br>next-action |
| ads | summary<br>content<br>next-action |
| lock | summary<br>content<br>next-action |
| sayplan | summary<br>content<br>next-action |
| onway | summary<br>content<br>next-action |
| background | summary<br>content<br>next-action |
| call | chat<br>message-list<br>composer |
| netqr | summary<br>content<br>next-action |
| shareext | summary<br>content<br>next-action |

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
| permission.fetch.body | Активные планы готовы к первому открытию. | none | System permission explanation | settings | permission |
| permission.fetch.fallback | Планы обновятся после открытия | none | Denied fallback | settings | recovery |
| permission.fetch.title | Фоновое обновление | none | System permission pre-prompt title | settings | permission |
| permission.hotspot.body | «Сегодня» подключат телефон к гостевой сети места встречи. | none | System permission explanation | netqr | permission |
| permission.hotspot.fallback | Сеть выбирается вручную в Настройках | none | Denied fallback | netqr | recovery |
| permission.hotspot.title | Подключение к сети | none | System permission pre-prompt title | netqr | permission |
| permission.keychain.body | Приложение и расширения используют один защищённый вход. | none | System permission explanation | widget<br>home | permission |
| permission.keychain.fallback | Виджет открывает приложение для входа | none | Denied fallback | home | recovery |
| permission.keychain.title | Общая сессия | none | System permission pre-prompt title | widget<br>home | permission |
| permission.location.body | Чтобы предложить места, удобные всей компании. | none | System permission explanation | home<br>nearby | permission |
| permission.location.fallback | Район выбирается вручную | none | Denied fallback | nearby | recovery |
| permission.location.title | «Сегодня» запрашивают геопозицию | none | System permission pre-prompt title | home<br>nearby | permission |
| permission.mic.body | Чтобы быстро ответить группе голосом. | none | System permission explanation | chat<br>voice | permission |
| permission.mic.fallback | Остаются текст и фото | none | Denied fallback | voice | recovery |
| permission.mic.title | «Сегодня» запрашивают доступ к микрофону | none | System permission pre-prompt title | chat<br>voice | permission |
| permission.photos.body | Чтобы выбрать необязательную обложку приватного плана. | none | System permission explanation | create<br>media | permission |
| permission.photos.fallback | Можно снять новый кадр камерой | none | Denied fallback | media | recovery |
| permission.photos.title | «Сегодня» запрашивают доступ к фото | none | System permission pre-prompt title | create<br>media | permission |
| permission.push.body | Сообщим только когда друг совпал по желанию. | none | System permission explanation | settings | permission |
| permission.push.fallback | Обновления помечаются точкой внутри приложения | none | Denied fallback | settings | recovery |
| permission.push.title | Разрешить уведомления от «Сегодня»? | none | System permission pre-prompt title | settings | permission |
| permission.remotenotif.body | Состав плана обновится до открытия приложения. | none | System permission explanation | plan | permission |
| permission.remotenotif.fallback | Состав обновляется при открытии | none | Denied fallback | plan | recovery |
| permission.remotenotif.title | Тихое обновление | none | System permission pre-prompt title | plan | permission |
| permission.shareext.body | Отдельный target: «Сегодня» появится в системном меню «Поделиться». | none | System permission explanation | settings<br>shareext | permission |
| permission.shareext.fallback | Место добавляется поиском внутри приложения | none | Denied fallback | shareext | recovery |
| permission.shareext.title | Расширение «Поделиться» | none | System permission pre-prompt title | settings<br>shareext | permission |
| permission.speech.body | Чтобы из сказанного вслух собрать время и место плана. | none | System permission explanation | create<br>sayplan | permission |
| permission.speech.fallback | Время и место выбираются списком, как раньше | none | Denied fallback | sayplan | recovery |
| permission.speech.title | «Сегодня» запрашивает доступ к распознаванию речи | none | System permission pre-prompt title | create<br>sayplan | permission |
| permission.tracking.body | Так подборки мест будут к месту, а приложение останется бесплатным. | none | System permission explanation | ads<br>profile | permission |
| permission.tracking.fallback | Подборки остаются, но перестают подбираться под вас | none | Denied fallback | profile | recovery |
| permission.tracking.title | Разрешить отслеживание? | none | System permission pre-prompt title | ads<br>profile | permission |
| permission.voip.body | Входящий звонок по плану поднимется обычным экраном вызова. | none | System permission explanation | chat<br>call | permission |
| permission.voip.fallback | Остаётся переписка в плане | none | Denied fallback | call | recovery |
| permission.voip.title | Звонки в приложении | none | System permission pre-prompt title | chat<br>call | permission |
| permission.wifiinfo.body | Wi‑Fi выбранного места помогает группе увидеть, кто уже пришёл. | none | System permission explanation | plan | permission |
| permission.wifiinfo.fallback | Отметка по кнопке без автоматической проверки | none | Denied fallback | plan | recovery |
| permission.wifiinfo.title | Сеть площадки | none | System permission pre-prompt title | plan | permission |
| scenario.all.failure.name | Весь продукт: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>match<br>nearby<br>plan<br>create | acceptance |
| scenario.all.happy.name | Весь продукт: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>match<br>nearby<br>plan<br>create | acceptance |
| scenario.all.offline.name | Весь продукт: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>match<br>nearby<br>plan<br>create | acceptance |
| scenario.all.persistence.name | Весь продукт: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>match<br>nearby<br>plan<br>create | acceptance |
| scenario.memory.failure.name | Создать план: ошибка и восстановление | none | Acceptance scenario name | profile<br>settings<br>groups<br>nearby<br>create<br>chats<br>mates<br>shareext | acceptance |
| scenario.memory.happy.name | Создать план: основной путь | none | Acceptance scenario name | profile<br>settings<br>groups<br>nearby<br>create<br>chats<br>mates<br>shareext | acceptance |
| scenario.memory.offline.name | Создать план: без сети | none | Acceptance scenario name | profile<br>settings<br>groups<br>nearby<br>create<br>chats<br>mates<br>shareext | acceptance |
| scenario.memory.persistence.name | Создать план: возврат после перезапуска | none | Acceptance scenario name | profile<br>settings<br>groups<br>nearby<br>create<br>chats<br>mates<br>shareext | acceptance |
| scenario.permission.appgroups.denied.name | Виджет ближайшего плана: отказ и запасной путь | none | Acceptance scenario name | settings<br>widget | acceptance |
| scenario.permission.audio.denied.name | Голосовые из плана играют подряд по дороге к месту: на локскрине — Now Playing и ±15 секунд: отказ и запасной путь | none | Acceptance scenario name | onway<br>background | acceptance |
| scenario.permission.autofill.denied.name | Вход на сайт сохранённой связкой: отказ и запасной путь | none | Acceptance scenario name | settings<br>fill | acceptance |
| scenario.permission.bgtask.denied.name | Зарегистрированная задача обновления: отказ и запасной путь | none | Acceptance scenario name | refresh<br>home | acceptance |
| scenario.permission.calendar.denied.name | Подтверждённый план в системном календаре, с правкой при переносе времени и удалением при отмене: отказ и запасной путь | none | Acceptance scenario name | plan | acceptance |
| scenario.permission.camera.denied.name | Обложка приватного плана: отказ и запасной путь | none | Acceptance scenario name | create<br>camera | acceptance |
| scenario.permission.commnotif.denied.name | Чаты с аватарами в уведомлениях: отказ и запасной путь | none | Acceptance scenario name | chat | acceptance |
| scenario.permission.contacts.denied.name | Кто из контактов уже в «Сегодня»: круг близких — единственный источник совпадений: отказ и запасной путь | none | Acceptance scenario name | profile<br>mates | acceptance |
| scenario.permission.faceid.denied.name | Замок на планах: кто свободен, во сколько и где встречаетесь: отказ и запасной путь | none | Acceptance scenario name | settings<br>lock | acceptance |
| scenario.permission.fetch.denied.name | Свежие планы к запуску: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.hotspot.denied.name | Гостевая сеть места встречи по QR — без неё отметка «я на месте» не проходит: отказ и запасной путь | none | Acceptance scenario name | netqr | acceptance |
| scenario.permission.keychain.denied.name | Один вход для приложения и виджета: отказ и запасной путь | none | Acceptance scenario name | widget<br>home | acceptance |
| scenario.permission.location.denied.name | Места между друзьями: отказ и запасной путь | none | Acceptance scenario name | home<br>nearby | acceptance |
| scenario.permission.mic.denied.name | Голосовое в группе: отказ и запасной путь | none | Acceptance scenario name | chat<br>voice | acceptance |
| scenario.permission.photos.denied.name | Фото для обложки: отказ и запасной путь | none | Acceptance scenario name | create<br>media | acceptance |
| scenario.permission.push.denied.name | Совпадение с другом: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.remotenotif.denied.name | Актуальный состав плана: отказ и запасной путь | none | Acceptance scenario name | plan | acceptance |
| scenario.permission.shareext.denied.name | Поделиться местом из Карт или ссылкой из Safari — падает прямо в план: отказ и запасной путь | none | Acceptance scenario name | settings<br>shareext | acceptance |
| scenario.permission.speech.denied.name | Сказать план голосом: «в семь на катке» — время и место распознаются на устройстве: отказ и запасной путь | none | Acceptance scenario name | create<br>sayplan | acceptance |
| scenario.permission.tracking.denied.name | Реклама мест и событий вместо платной подписки: отказ и запасной путь | none | Acceptance scenario name | ads<br>profile | acceptance |
| scenario.permission.voip.denied.name | Созвон участников плана: в план зовут друзей друзей, номерами при этом не обмениваются: отказ и запасной путь | none | Acceptance scenario name | chat<br>call | acceptance |
| scenario.permission.wifiinfo.denied.name | Статус «на месте»: отказ и запасной путь | none | Acceptance scenario name | plan | acceptance |
| scenario.plan.failure.name | Собрать план: ошибка и восстановление | none | Acceptance scenario name | plan<br>netqr<br>onway<br>nearby<br>create<br>camera<br>media<br>match | acceptance |
| scenario.plan.happy.name | Собрать план: основной путь | none | Acceptance scenario name | plan<br>netqr<br>onway<br>nearby<br>create<br>camera<br>media<br>match | acceptance |
| scenario.plan.offline.name | Собрать план: без сети | none | Acceptance scenario name | plan<br>netqr<br>onway<br>nearby<br>create<br>camera<br>media<br>match | acceptance |
| scenario.plan.persistence.name | Собрать план: возврат после перезапуска | none | Acceptance scenario name | plan<br>netqr<br>onway<br>nearby<br>create<br>camera<br>media<br>match | acceptance |
| screen.ads.action.complete-ads.label | Продолжить | none | Action label | ads | control |
| screen.ads.purpose | Объяснить обмен до системного запроса ATT | none | Product task | ads | accessibility-and-docs |
| screen.ads.state.error.body | Не удалось обновить «Реклама вместо подписки». Введённые данные сохранены; повторите попытку. | none | State copy: error | ads | state-body |
| screen.ads.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ads | recovery |
| screen.ads.state.loading.body | Обновляем данные раздела «Реклама вместо подписки»; текущий контекст остаётся доступен. | none | State copy: loading | ads | state-body |
| screen.ads.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | ads | recovery |
| screen.ads.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | ads | state-body |
| screen.ads.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | ads | recovery |
| screen.ads.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | ads | state-body |
| screen.ads.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | ads | recovery |
| screen.ads.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | ads | state-body |
| screen.ads.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | ads | recovery |
| screen.ads.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | ads | state-body |
| screen.ads.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | ads | recovery |
| screen.ads.state.populated-default.body | Актуальные данные раздела «Реклама вместо подписки» готовы к следующему действию. | none | State copy: populated/default | ads | state-body |
| screen.ads.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | ads | recovery |
| screen.ads.title | Реклама вместо подписки | none | Surface title | ads | navigation-title |
| screen.background.action.complete-background.label | Продолжить: Экран погас | none | Action label | background | control |
| screen.background.purpose | Показать, что очередь голосовых играет при погашенном экране | none | Product task | background | accessibility-and-docs |
| screen.background.state.error.body | Не удалось обновить «Экран погас». Введённые данные сохранены; повторите попытку. | none | State copy: error | background | state-body |
| screen.background.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | background | recovery |
| screen.background.state.loading.body | Обновляем данные раздела «Экран погас»; текущий контекст остаётся доступен. | none | State copy: loading | background | state-body |
| screen.background.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | background | recovery |
| screen.background.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | background | state-body |
| screen.background.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | background | recovery |
| screen.background.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | background | state-body |
| screen.background.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | background | recovery |
| screen.background.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | background | state-body |
| screen.background.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | background | recovery |
| screen.background.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | background | state-body |
| screen.background.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | background | recovery |
| screen.background.state.populated-default.body | Актуальные данные раздела «Экран погас» готовы к следующему действию. | none | State copy: populated/default | background | state-body |
| screen.background.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | background | recovery |
| screen.background.title | Экран погас | none | Surface title | background | navigation-title |
| screen.call.action.complete-call.label | Продолжить: Созвон по плану | none | Action label | call | control |
| screen.call.purpose | Договориться на ходу, не раскрывая номер | none | Product task | call | accessibility-and-docs |
| screen.call.state.error.body | Не удалось обновить «Созвон по плану». Введённые данные сохранены; повторите попытку. | none | State copy: error | call | state-body |
| screen.call.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | call | recovery |
| screen.call.state.loading.body | Обновляем данные раздела «Созвон по плану»; текущий контекст остаётся доступен. | none | State copy: loading | call | state-body |
| screen.call.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | call | recovery |
| screen.call.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | call | state-body |
| screen.call.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | call | recovery |
| screen.call.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | call | state-body |
| screen.call.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | call | recovery |
| screen.call.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | call | state-body |
| screen.call.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | call | recovery |
| screen.call.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | call | state-body |
| screen.call.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | call | recovery |
| screen.call.state.populated-default.body | Актуальные данные раздела «Созвон по плану» готовы к следующему действию. | none | State copy: populated/default | call | state-body |
| screen.call.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | call | recovery |
| screen.call.title | Созвон по плану | none | Surface title | call | navigation-title |
| screen.camera.action.complete-camera.label | Продолжить: Камера | none | Action label | camera | control |
| screen.camera.purpose | Снять обложку плана | none | Product task | camera | accessibility-and-docs |
| screen.camera.state.error.body | Не удалось обновить «Камера». Введённые данные сохранены; повторите попытку. | none | State copy: error | camera | state-body |
| screen.camera.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | camera | recovery |
| screen.camera.state.loading.body | Обновляем данные раздела «Камера»; текущий контекст остаётся доступен. | none | State copy: loading | camera | state-body |
| screen.camera.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | camera | recovery |
| screen.camera.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | camera | state-body |
| screen.camera.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | camera | recovery |
| screen.camera.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | camera | state-body |
| screen.camera.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | camera | recovery |
| screen.camera.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | camera | state-body |
| screen.camera.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | camera | recovery |
| screen.camera.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | camera | state-body |
| screen.camera.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | camera | recovery |
| screen.camera.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | camera | state-body |
| screen.camera.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | camera | recovery |
| screen.camera.state.populated-default.body | Актуальные данные раздела «Камера» готовы к следующему действию. | none | State copy: populated/default | camera | state-body |
| screen.camera.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | camera | recovery |
| screen.camera.title | Камера | none | Surface title | camera | navigation-title |
| screen.chat.action.open-voice.label | Открыть voice | none | Action label | chat | control |
| screen.chat.purpose | Договориться | none | Product task | chat | accessibility-and-docs |
| screen.chat.state.error.body | Не удалось обновить «Группа плана». Введённые данные сохранены; повторите попытку. | none | State copy: error | chat | state-body |
| screen.chat.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chat | recovery |
| screen.chat.state.loading.body | Обновляем данные раздела «Группа плана»; текущий контекст остаётся доступен. | none | State copy: loading | chat | state-body |
| screen.chat.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chat | recovery |
| screen.chat.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | chat | state-body |
| screen.chat.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chat | recovery |
| screen.chat.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chat | state-body |
| screen.chat.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chat | recovery |
| screen.chat.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chat | state-body |
| screen.chat.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chat | recovery |
| screen.chat.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chat | state-body |
| screen.chat.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chat | recovery |
| screen.chat.state.populated-default.body | Актуальные данные раздела «Группа плана» готовы к следующему действию. | none | State copy: populated/default | chat | state-body |
| screen.chat.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chat | recovery |
| screen.chat.title | Группа плана | none | Surface title | chat | navigation-title |
| screen.chats.action.open-chat.label | Открыть chat | none | Action label | chats | control |
| screen.chats.purpose | Вернуться к активным планам | none | Product task | chats | accessibility-and-docs |
| screen.chats.state.empty.body | В разделе «Планы» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | chats | state-body |
| screen.chats.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | chats | recovery |
| screen.chats.state.error.body | Не удалось обновить «Планы». Введённые данные сохранены; повторите попытку. | none | State copy: error | chats | state-body |
| screen.chats.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chats | recovery |
| screen.chats.state.loading.body | Обновляем данные раздела «Планы»; текущий контекст остаётся доступен. | none | State copy: loading | chats | state-body |
| screen.chats.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chats | recovery |
| screen.chats.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | chats | state-body |
| screen.chats.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chats | recovery |
| screen.chats.state.populated-default.body | Актуальные данные раздела «Планы» готовы к следующему действию. | none | State copy: populated/default | chats | state-body |
| screen.chats.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chats | recovery |
| screen.chats.title | Планы | none | Surface title | chats | navigation-title |
| screen.code.action.open-codefail.label | Продолжить | none | Action label | code | control |
| screen.code.purpose | Подтвердить вход | none | Product task | code | accessibility-and-docs |
| screen.code.state.error.body | Не удалось обновить «Код из письма». Введённые данные сохранены; повторите попытку. | none | State copy: error | code | state-body |
| screen.code.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | code | recovery |
| screen.code.state.loading.body | Обновляем данные раздела «Код из письма»; текущий контекст остаётся доступен. | none | State copy: loading | code | state-body |
| screen.code.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | code | recovery |
| screen.code.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | code | state-body |
| screen.code.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | code | recovery |
| screen.code.state.populated-default.body | Актуальные данные раздела «Код из письма» готовы к следующему действию. | none | State copy: populated/default | code | state-body |
| screen.code.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | code | recovery |
| screen.code.title | Код из письма | none | Surface title | code | navigation-title |
| screen.codefail.action.complete-codefail.label | Продолжить | none | Action label | codefail | control |
| screen.codefail.purpose | Показать ошибку OTP и вернуть к вводу | none | Product task | codefail | accessibility-and-docs |
| screen.codefail.state.error.body | Не удалось обновить «Неверный код». Введённые данные сохранены; повторите попытку. | none | State copy: error | codefail | state-body |
| screen.codefail.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | codefail | recovery |
| screen.codefail.state.loading.body | Обновляем данные раздела «Неверный код»; текущий контекст остаётся доступен. | none | State copy: loading | codefail | state-body |
| screen.codefail.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | codefail | recovery |
| screen.codefail.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | codefail | state-body |
| screen.codefail.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | codefail | recovery |
| screen.codefail.state.populated-default.body | Актуальные данные раздела «Неверный код» готовы к следующему действию. | none | State copy: populated/default | codefail | state-body |
| screen.codefail.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | codefail | recovery |
| screen.codefail.title | Неверный код | none | Surface title | codefail | navigation-title |
| screen.create.action.open-camera.label | Отправить приглашение | none | Action label | create | control |
| screen.create.purpose | Пригласить друзей в приватный план | none | Product task | create | accessibility-and-docs |
| screen.create.state.error.body | Не удалось обновить «Новый план». Введённые данные сохранены; повторите попытку. | none | State copy: error | create | state-body |
| screen.create.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | create | recovery |
| screen.create.state.loading.body | Обновляем данные раздела «Новый план»; текущий контекст остаётся доступен. | none | State copy: loading | create | state-body |
| screen.create.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | create | recovery |
| screen.create.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | create | state-body |
| screen.create.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | create | recovery |
| screen.create.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | create | state-body |
| screen.create.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | create | recovery |
| screen.create.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | create | state-body |
| screen.create.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | create | recovery |
| screen.create.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | create | state-body |
| screen.create.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | create | recovery |
| screen.create.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | create | state-body |
| screen.create.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | create | recovery |
| screen.create.state.populated-default.body | Актуальные данные раздела «Новый план» готовы к следующему действию. | none | State copy: populated/default | create | state-body |
| screen.create.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | create | recovery |
| screen.create.title | Новый план | none | Surface title | create | navigation-title |
| screen.fill.action.complete-fill.label | Войти | none | Action label | fill | control |
| screen.fill.purpose | Войти на сайт сохранённым в «Сегодня» входом | none | Product task | fill | accessibility-and-docs |
| screen.fill.state.error.body | Не удалось обновить «Автозаполнение на сайте». Введённые данные сохранены; повторите попытку. | none | State copy: error | fill | state-body |
| screen.fill.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | fill | recovery |
| screen.fill.state.loading.body | Обновляем данные раздела «Автозаполнение на сайте»; текущий контекст остаётся доступен. | none | State copy: loading | fill | state-body |
| screen.fill.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | fill | recovery |
| screen.fill.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | fill | state-body |
| screen.fill.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | fill | recovery |
| screen.fill.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | fill | state-body |
| screen.fill.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | fill | recovery |
| screen.fill.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | fill | state-body |
| screen.fill.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | fill | recovery |
| screen.fill.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | fill | state-body |
| screen.fill.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | fill | recovery |
| screen.fill.state.populated-default.body | Актуальные данные раздела «Автозаполнение на сайте» готовы к следующему действию. | none | State copy: populated/default | fill | state-body |
| screen.fill.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | fill | recovery |
| screen.fill.title | Автозаполнение на сайте | none | Surface title | fill | navigation-title |
| screen.groups.action.complete-groups.label | Продолжить: Друзья | none | Action label | groups | control |
| screen.groups.purpose | Управлять близкими друзьями | none | Product task | groups | accessibility-and-docs |
| screen.groups.state.empty.body | В разделе «Друзья» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | groups | state-body |
| screen.groups.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | groups | recovery |
| screen.groups.state.error.body | Не удалось обновить «Друзья». Введённые данные сохранены; повторите попытку. | none | State copy: error | groups | state-body |
| screen.groups.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | groups | recovery |
| screen.groups.state.loading.body | Обновляем данные раздела «Друзья»; текущий контекст остаётся доступен. | none | State copy: loading | groups | state-body |
| screen.groups.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | groups | recovery |
| screen.groups.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | groups | state-body |
| screen.groups.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | groups | recovery |
| screen.groups.state.populated-default.body | Актуальные данные раздела «Друзья» готовы к следующему действию. | none | State copy: populated/default | groups | state-body |
| screen.groups.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | groups | recovery |
| screen.groups.title | Друзья | none | Surface title | groups | navigation-title |
| screen.home.action.open-match.label | Показать совпадения | none | Action label | home | control |
| screen.home.purpose | Отметить желание и окно времени | none | Product task | home | accessibility-and-docs |
| screen.home.state.empty.body | В разделе «Сегодня» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | home | state-body |
| screen.home.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | home | recovery |
| screen.home.state.error.body | Не удалось обновить «Сегодня». Введённые данные сохранены; повторите попытку. | none | State copy: error | home | state-body |
| screen.home.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | home | recovery |
| screen.home.state.loading.body | Обновляем данные раздела «Сегодня»; текущий контекст остаётся доступен. | none | State copy: loading | home | state-body |
| screen.home.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | home | recovery |
| screen.home.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | home | state-body |
| screen.home.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | home | recovery |
| screen.home.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | home | state-body |
| screen.home.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | home | recovery |
| screen.home.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | home | state-body |
| screen.home.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | home | recovery |
| screen.home.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | home | state-body |
| screen.home.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | home | recovery |
| screen.home.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | home | state-body |
| screen.home.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | home | recovery |
| screen.home.state.populated-default.body | Актуальные данные раздела «Сегодня» готовы к следующему действию. | none | State copy: populated/default | home | state-body |
| screen.home.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | home | recovery |
| screen.home.title | Сегодня | none | Surface title | home | navigation-title |
| screen.lock.action.complete-lock.label | Замок Face ID | none | Action label | lock | control |
| screen.lock.purpose | Закрыть планы и окна свободного времени биометрией | none | Product task | lock | accessibility-and-docs |
| screen.lock.state.error.body | Не удалось обновить «Замок на планах». Введённые данные сохранены; повторите попытку. | none | State copy: error | lock | state-body |
| screen.lock.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lock | recovery |
| screen.lock.state.loading.body | Обновляем данные раздела «Замок на планах»; текущий контекст остаётся доступен. | none | State copy: loading | lock | state-body |
| screen.lock.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lock | recovery |
| screen.lock.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | lock | state-body |
| screen.lock.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lock | recovery |
| screen.lock.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lock | state-body |
| screen.lock.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lock | recovery |
| screen.lock.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lock | state-body |
| screen.lock.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lock | recovery |
| screen.lock.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lock | state-body |
| screen.lock.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lock | recovery |
| screen.lock.state.populated-default.body | Актуальные данные раздела «Замок на планах» готовы к следующему действию. | none | State copy: populated/default | lock | state-body |
| screen.lock.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lock | recovery |
| screen.lock.title | Замок на планах | none | Surface title | lock | navigation-title |
| screen.match.action.complete-match.label | Собрать план | none | Action label | match | control |
| screen.match.purpose | Проверить совпадение с другом | none | Product task | match | accessibility-and-docs |
| screen.match.state.error.body | Не удалось обновить «Совпадение». Введённые данные сохранены; повторите попытку. | none | State copy: error | match | state-body |
| screen.match.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | match | recovery |
| screen.match.state.loading.body | Обновляем данные раздела «Совпадение»; текущий контекст остаётся доступен. | none | State copy: loading | match | state-body |
| screen.match.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | match | recovery |
| screen.match.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | match | state-body |
| screen.match.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | match | recovery |
| screen.match.state.populated-default.body | Актуальные данные раздела «Совпадение» готовы к следующему действию. | none | State copy: populated/default | match | state-body |
| screen.match.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | match | recovery |
| screen.match.title | Совпадение | none | Surface title | match | navigation-title |
| screen.mates.action.complete-mates.label | Продолжить: Контакты в «Сегодня» | none | Action label | mates | control |
| screen.mates.purpose | Найти своих среди тех, кто уже здесь | none | Product task | mates | accessibility-and-docs |
| screen.mates.state.empty.body | В разделе «Контакты в «Сегодня»» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | mates | state-body |
| screen.mates.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | mates | recovery |
| screen.mates.state.error.body | Не удалось обновить «Контакты в «Сегодня»». Введённые данные сохранены; повторите попытку. | none | State copy: error | mates | state-body |
| screen.mates.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | mates | recovery |
| screen.mates.state.loading.body | Обновляем данные раздела «Контакты в «Сегодня»»; текущий контекст остаётся доступен. | none | State copy: loading | mates | state-body |
| screen.mates.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | mates | recovery |
| screen.mates.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | mates | state-body |
| screen.mates.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | mates | recovery |
| screen.mates.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | mates | state-body |
| screen.mates.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | mates | recovery |
| screen.mates.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | mates | state-body |
| screen.mates.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | mates | recovery |
| screen.mates.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | mates | state-body |
| screen.mates.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | mates | recovery |
| screen.mates.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | mates | state-body |
| screen.mates.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | mates | recovery |
| screen.mates.state.populated-default.body | Актуальные данные раздела «Контакты в «Сегодня»» готовы к следующему действию. | none | State copy: populated/default | mates | state-body |
| screen.mates.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | mates | recovery |
| screen.mates.title | Контакты в «Сегодня» | none | Surface title | mates | navigation-title |
| screen.media.action.complete-media.label | Продолжить: Фото | none | Action label | media | control |
| screen.media.purpose | Выбрать фото | none | Product task | media | accessibility-and-docs |
| screen.media.state.error.body | Не удалось обновить «Фото». Введённые данные сохранены; повторите попытку. | none | State copy: error | media | state-body |
| screen.media.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | media | recovery |
| screen.media.state.loading.body | Обновляем данные раздела «Фото»; текущий контекст остаётся доступен. | none | State copy: loading | media | state-body |
| screen.media.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | media | recovery |
| screen.media.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | media | state-body |
| screen.media.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | media | recovery |
| screen.media.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | media | state-body |
| screen.media.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | media | recovery |
| screen.media.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | media | state-body |
| screen.media.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | media | recovery |
| screen.media.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | media | state-body |
| screen.media.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | media | recovery |
| screen.media.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | media | state-body |
| screen.media.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | media | recovery |
| screen.media.state.populated-default.body | Актуальные данные раздела «Фото» готовы к следующему действию. | none | State copy: populated/default | media | state-body |
| screen.media.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | media | recovery |
| screen.media.title | Фото | none | Surface title | media | navigation-title |
| screen.nearby.action.open-plan.label | Открыть plan | none | Action label | nearby | control |
| screen.nearby.purpose | Найти совпадение среди близких друзей | none | Product task | nearby | accessibility-and-docs |
| screen.nearby.state.empty.body | В разделе «Совпадения» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | nearby | state-body |
| screen.nearby.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | nearby | recovery |
| screen.nearby.state.error.body | Не удалось обновить «Совпадения». Введённые данные сохранены; повторите попытку. | none | State copy: error | nearby | state-body |
| screen.nearby.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | nearby | recovery |
| screen.nearby.state.loading.body | Обновляем данные раздела «Совпадения»; текущий контекст остаётся доступен. | none | State copy: loading | nearby | state-body |
| screen.nearby.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | nearby | recovery |
| screen.nearby.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | nearby | state-body |
| screen.nearby.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | nearby | recovery |
| screen.nearby.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | nearby | state-body |
| screen.nearby.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | nearby | recovery |
| screen.nearby.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | nearby | state-body |
| screen.nearby.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | nearby | recovery |
| screen.nearby.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | nearby | state-body |
| screen.nearby.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | nearby | recovery |
| screen.nearby.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | nearby | state-body |
| screen.nearby.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | nearby | recovery |
| screen.nearby.state.populated-default.body | Актуальные данные раздела «Совпадения» готовы к следующему действию. | none | State copy: populated/default | nearby | state-body |
| screen.nearby.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | nearby | recovery |
| screen.nearby.title | Совпадения | none | Surface title | nearby | navigation-title |
| screen.netqr.action.complete-netqr.label | Подключиться | none | Action label | netqr | control |
| screen.netqr.purpose | Подключиться к гостевой сети места встречи | none | Product task | netqr | accessibility-and-docs |
| screen.netqr.state.error.body | Не удалось обновить «Сеть места по QR». Введённые данные сохранены; повторите попытку. | none | State copy: error | netqr | state-body |
| screen.netqr.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | netqr | recovery |
| screen.netqr.state.loading.body | Обновляем данные раздела «Сеть места по QR»; текущий контекст остаётся доступен. | none | State copy: loading | netqr | state-body |
| screen.netqr.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | netqr | recovery |
| screen.netqr.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | netqr | state-body |
| screen.netqr.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | netqr | recovery |
| screen.netqr.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | netqr | state-body |
| screen.netqr.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | netqr | recovery |
| screen.netqr.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | netqr | state-body |
| screen.netqr.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | netqr | recovery |
| screen.netqr.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | netqr | state-body |
| screen.netqr.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | netqr | recovery |
| screen.netqr.state.populated-default.body | Актуальные данные раздела «Сеть места по QR» готовы к следующему действию. | none | State copy: populated/default | netqr | state-body |
| screen.netqr.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | netqr | recovery |
| screen.netqr.title | Сеть места по QR | none | Surface title | netqr | navigation-title |
| screen.onway.action.open-background.label | Слушать подряд | none | Action label | onway | control |
| screen.onway.purpose | Слушать голосовые участников подряд, не разблокируя телефон | none | Product task | onway | accessibility-and-docs |
| screen.onway.state.error.body | Не удалось обновить «По дороге». Введённые данные сохранены; повторите попытку. | none | State copy: error | onway | state-body |
| screen.onway.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | onway | recovery |
| screen.onway.state.loading.body | Обновляем данные раздела «По дороге»; текущий контекст остаётся доступен. | none | State copy: loading | onway | state-body |
| screen.onway.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | onway | recovery |
| screen.onway.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | onway | state-body |
| screen.onway.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | onway | recovery |
| screen.onway.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | onway | state-body |
| screen.onway.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | onway | recovery |
| screen.onway.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | onway | state-body |
| screen.onway.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | onway | recovery |
| screen.onway.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | onway | state-body |
| screen.onway.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | onway | recovery |
| screen.onway.state.populated-default.body | Актуальные данные раздела «По дороге» готовы к следующему действию. | none | State copy: populated/default | onway | state-body |
| screen.onway.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | onway | recovery |
| screen.onway.title | По дороге | none | Surface title | onway | navigation-title |
| screen.phone.action.open-code.label | Продолжить с почтой | none | Action label | phone | control |
| screen.phone.purpose | Войти | none | Product task | phone | accessibility-and-docs |
| screen.phone.state.error.body | Не удалось обновить «Вход по почте». Введённые данные сохранены; повторите попытку. | none | State copy: error | phone | state-body |
| screen.phone.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | phone | recovery |
| screen.phone.state.loading.body | Обновляем данные раздела «Вход по почте»; текущий контекст остаётся доступен. | none | State copy: loading | phone | state-body |
| screen.phone.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | phone | recovery |
| screen.phone.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | phone | state-body |
| screen.phone.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | phone | recovery |
| screen.phone.state.populated-default.body | Актуальные данные раздела «Вход по почте» готовы к следующему действию. | none | State copy: populated/default | phone | state-body |
| screen.phone.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | phone | recovery |
| screen.phone.title | Вход по почте | none | Surface title | phone | navigation-title |
| screen.plan.action.open-onway.label | Подтвердить план | none | Action label | plan | control |
| screen.plan.purpose | Встретиться | none | Product task | plan | accessibility-and-docs |
| screen.plan.state.error.body | Не удалось обновить «План». Введённые данные сохранены; повторите попытку. | none | State copy: error | plan | state-body |
| screen.plan.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | plan | recovery |
| screen.plan.state.loading.body | Обновляем данные раздела «План»; текущий контекст остаётся доступен. | none | State copy: loading | plan | state-body |
| screen.plan.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | plan | recovery |
| screen.plan.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | plan | state-body |
| screen.plan.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | plan | recovery |
| screen.plan.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | plan | state-body |
| screen.plan.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | plan | recovery |
| screen.plan.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | plan | state-body |
| screen.plan.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | plan | recovery |
| screen.plan.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | plan | state-body |
| screen.plan.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | plan | recovery |
| screen.plan.state.populated-default.body | Актуальные данные раздела «План» готовы к следующему действию. | none | State copy: populated/default | plan | state-body |
| screen.plan.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | plan | recovery |
| screen.plan.title | План | none | Surface title | plan | navigation-title |
| screen.profile.action.open-settings.label | Открыть settings | none | Action label | profile | control |
| screen.profile.purpose | Управлять профилем | none | Product task | profile | accessibility-and-docs |
| screen.profile.state.empty.body | В разделе «Вы» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | profile | state-body |
| screen.profile.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | profile | recovery |
| screen.profile.state.error.body | Не удалось обновить «Вы». Введённые данные сохранены; повторите попытку. | none | State copy: error | profile | state-body |
| screen.profile.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | profile | recovery |
| screen.profile.state.loading.body | Обновляем данные раздела «Вы»; текущий контекст остаётся доступен. | none | State copy: loading | profile | state-body |
| screen.profile.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | profile | recovery |
| screen.profile.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | profile | state-body |
| screen.profile.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | profile | recovery |
| screen.profile.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | profile | state-body |
| screen.profile.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | profile | recovery |
| screen.profile.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | profile | state-body |
| screen.profile.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | profile | recovery |
| screen.profile.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | profile | state-body |
| screen.profile.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | profile | recovery |
| screen.profile.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | profile | state-body |
| screen.profile.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | profile | recovery |
| screen.profile.state.populated-default.body | Актуальные данные раздела «Вы» готовы к следующему действию. | none | State copy: populated/default | profile | state-body |
| screen.profile.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | profile | recovery |
| screen.profile.title | Вы | none | Surface title | profile | navigation-title |
| screen.refresh.action.complete-refresh.label | Проверить задачу | none | Action label | refresh | control |
| screen.refresh.purpose | Проверить, что фоновое обновление работает | none | Product task | refresh | accessibility-and-docs |
| screen.refresh.state.error.body | Не удалось обновить «Обновление в фоне». Введённые данные сохранены; повторите попытку. | none | State copy: error | refresh | state-body |
| screen.refresh.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | refresh | recovery |
| screen.refresh.state.loading.body | Обновляем данные раздела «Обновление в фоне»; текущий контекст остаётся доступен. | none | State copy: loading | refresh | state-body |
| screen.refresh.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | refresh | recovery |
| screen.refresh.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | refresh | state-body |
| screen.refresh.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | refresh | recovery |
| screen.refresh.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | refresh | state-body |
| screen.refresh.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | refresh | recovery |
| screen.refresh.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | refresh | state-body |
| screen.refresh.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | refresh | recovery |
| screen.refresh.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | refresh | state-body |
| screen.refresh.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | refresh | recovery |
| screen.refresh.state.populated-default.body | Актуальные данные раздела «Обновление в фоне» готовы к следующему действию. | none | State copy: populated/default | refresh | state-body |
| screen.refresh.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | refresh | recovery |
| screen.refresh.title | Обновление в фоне | none | Surface title | refresh | navigation-title |
| screen.sayplan.action.complete-sayplan.label | Собрать план | none | Action label | sayplan | control |
| screen.sayplan.purpose | Разобрать сказанное вслух на время и место | none | Product task | sayplan | accessibility-and-docs |
| screen.sayplan.state.error.body | Не удалось обновить «План голосом». Введённые данные сохранены; повторите попытку. | none | State copy: error | sayplan | state-body |
| screen.sayplan.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | sayplan | recovery |
| screen.sayplan.state.loading.body | Обновляем данные раздела «План голосом»; текущий контекст остаётся доступен. | none | State copy: loading | sayplan | state-body |
| screen.sayplan.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | sayplan | recovery |
| screen.sayplan.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | sayplan | state-body |
| screen.sayplan.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | sayplan | recovery |
| screen.sayplan.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | sayplan | state-body |
| screen.sayplan.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | sayplan | recovery |
| screen.sayplan.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | sayplan | state-body |
| screen.sayplan.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | sayplan | recovery |
| screen.sayplan.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | sayplan | state-body |
| screen.sayplan.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | sayplan | recovery |
| screen.sayplan.state.populated-default.body | Актуальные данные раздела «План голосом» готовы к следующему действию. | none | State copy: populated/default | sayplan | state-body |
| screen.sayplan.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | sayplan | recovery |
| screen.sayplan.title | План голосом | none | Surface title | sayplan | navigation-title |
| screen.settings.action.open-widget.label | Обновлять планы в фоне | none | Action label | settings | control |
| screen.settings.purpose | Держать доступы и системные функции под рукой | none | Product task | settings | accessibility-and-docs |
| screen.settings.state.empty.body | В разделе «Настройки» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | settings | state-body |
| screen.settings.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | settings | recovery |
| screen.settings.state.error.body | Не удалось обновить «Настройки». Введённые данные сохранены; повторите попытку. | none | State copy: error | settings | state-body |
| screen.settings.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | settings | recovery |
| screen.settings.state.loading.body | Обновляем данные раздела «Настройки»; текущий контекст остаётся доступен. | none | State copy: loading | settings | state-body |
| screen.settings.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | settings | recovery |
| screen.settings.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | settings | state-body |
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
| screen.shareext.action.complete-shareext.label | Добавить в план | none | Action label | shareext | control |
| screen.shareext.purpose | Принять место или ссылку из другого приложения в план | none | Product task | shareext | accessibility-and-docs |
| screen.shareext.state.error.body | Не удалось обновить «Поделиться в «Сегодня»». Введённые данные сохранены; повторите попытку. | none | State copy: error | shareext | state-body |
| screen.shareext.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | shareext | recovery |
| screen.shareext.state.loading.body | Обновляем данные раздела «Поделиться в «Сегодня»»; текущий контекст остаётся доступен. | none | State copy: loading | shareext | state-body |
| screen.shareext.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | shareext | recovery |
| screen.shareext.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | shareext | state-body |
| screen.shareext.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | shareext | recovery |
| screen.shareext.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | shareext | state-body |
| screen.shareext.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | shareext | recovery |
| screen.shareext.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | shareext | state-body |
| screen.shareext.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | shareext | recovery |
| screen.shareext.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | shareext | state-body |
| screen.shareext.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | shareext | recovery |
| screen.shareext.state.populated-default.body | Актуальные данные раздела «Поделиться в «Сегодня»» готовы к следующему действию. | none | State copy: populated/default | shareext | state-body |
| screen.shareext.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | shareext | recovery |
| screen.shareext.title | Поделиться в «Сегодня» | none | Surface title | shareext | navigation-title |
| screen.voice.action.complete-voice.label | Отправить | none | Action label | voice | control |
| screen.voice.purpose | Записать голос | none | Product task | voice | accessibility-and-docs |
| screen.voice.state.error.body | Не удалось обновить «Голосовое». Введённые данные сохранены; повторите попытку. | none | State copy: error | voice | state-body |
| screen.voice.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | voice | recovery |
| screen.voice.state.loading.body | Обновляем данные раздела «Голосовое»; текущий контекст остаётся доступен. | none | State copy: loading | voice | state-body |
| screen.voice.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | voice | recovery |
| screen.voice.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | voice | state-body |
| screen.voice.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | voice | recovery |
| screen.voice.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | voice | state-body |
| screen.voice.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | voice | recovery |
| screen.voice.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | voice | state-body |
| screen.voice.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | voice | recovery |
| screen.voice.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | voice | state-body |
| screen.voice.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | voice | recovery |
| screen.voice.state.populated-default.body | Актуальные данные раздела «Голосовое» готовы к следующему действию. | none | State copy: populated/default | voice | state-body |
| screen.voice.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | voice | recovery |
| screen.voice.title | Голосовое | none | Surface title | voice | navigation-title |
| screen.widget.action.complete-widget.label | Открыть «Сегодня» | none | Action label | widget | control |
| screen.widget.purpose | Поставить виджет ближайшего плана на экран «Домой» | none | Product task | widget | accessibility-and-docs |
| screen.widget.state.error.body | Не удалось обновить «Виджет на экране «Домой»». Введённые данные сохранены; повторите попытку. | none | State copy: error | widget | state-body |
| screen.widget.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | widget | recovery |
| screen.widget.state.loading.body | Обновляем данные раздела «Виджет на экране «Домой»»; текущий контекст остаётся доступен. | none | State copy: loading | widget | state-body |
| screen.widget.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | widget | recovery |
| screen.widget.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | widget | state-body |
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
| all.happy | all | happy-path | surface:phone<br>fixture:fixture.today.phone.default | perform-action:phone.open-code<br>perform-action:code.open-codefail<br>open-surface:codefail<br>perform-action:home.open-match<br>open-surface:match<br>perform-action:nearby.open-plan<br>open-surface:plan<br>open-surface:create | surface-visible:create<br>outcome-visible:value |
| all.failure | all | failure-recovery | surface:phone<br>fixture:fixture.today.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| all.offline | all | offline | surface:phone<br>fixture:fixture.today.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| all.persistence | all | persistence-return | surface:phone<br>checkpoint-flow:all | relaunch:application<br>return-to-flow:all | flow-context-restored:all<br>surface-visible:phone |
| plan.happy | plan | happy-path | surface:plan<br>fixture:fixture.today.plan.default | open-surface:plan<br>open-surface:netqr<br>open-surface:onway<br>open-surface:nearby<br>perform-action:create.open-camera<br>open-surface:camera<br>open-surface:media<br>open-surface:match | surface-visible:match<br>outcome-visible:value |
| plan.failure | plan | failure-recovery | surface:plan<br>fixture:fixture.today.plan.error<br>inject-state:error | invoke-recovery:plan | recovery-visible:plan<br>input-preserved:plan |
| plan.offline | plan | offline | surface:plan<br>fixture:fixture.today.plan.offline<br>connectivity:offline | open-surface:plan | state-visible:plan.offline<br>recovery-visible:plan |
| plan.persistence | plan | persistence-return | surface:plan<br>checkpoint-flow:plan | relaunch:application<br>return-to-flow:plan | flow-context-restored:plan<br>surface-visible:plan |
| memory.happy | memory | happy-path | surface:profile<br>fixture:fixture.today.profile.default | perform-action:profile.open-settings<br>open-surface:settings<br>open-surface:groups<br>open-surface:nearby<br>open-surface:create<br>open-surface:chats<br>open-surface:mates<br>open-surface:shareext | surface-visible:shareext<br>outcome-visible:value |
| memory.failure | memory | failure-recovery | surface:profile<br>fixture:fixture.today.profile.error<br>inject-state:error | invoke-recovery:profile | recovery-visible:profile<br>input-preserved:profile |
| memory.offline | memory | offline | surface:profile<br>fixture:fixture.today.profile.offline<br>connectivity:offline | open-surface:profile | state-visible:profile.offline<br>recovery-visible:profile |
| memory.persistence | memory | persistence-return | surface:profile<br>checkpoint-flow:memory | relaunch:application<br>return-to-flow:memory | flow-context-restored:memory<br>surface-visible:profile |
| permission.camera.denied | permission:camera | permission-denial-fallback | surface:create<br>fixture:fixture.today.camera.denied<br>permission-status:camera.not-determined | deny-permission:camera | state-visible:camera.permission-denied<br>fallback-visible:camera |
| permission.photos.denied | permission:photos | permission-denial-fallback | surface:create<br>fixture:fixture.today.media.permission-denied<br>permission-status:photos.not-determined | deny-permission:photos | state-visible:media.permission-denied<br>fallback-visible:photos |
| permission.mic.denied | permission:mic | permission-denial-fallback | surface:chat<br>fixture:fixture.today.voice.denied<br>permission-status:mic.not-determined | deny-permission:mic | state-visible:voice.permission-denied<br>fallback-visible:mic |
| permission.location.denied | permission:location | permission-denial-fallback | surface:home<br>fixture:fixture.today.nearby.permission-denied<br>permission-status:location.not-determined | deny-permission:location | state-visible:nearby.permission-denied<br>fallback-visible:location |
| permission.push.denied | permission:push | permission-denial-fallback | surface:settings<br>fixture:fixture.today.settings.permission-denied<br>permission-status:push.not-determined | deny-permission:push | state-visible:settings.permission-denied<br>fallback-visible:push |
| permission.commnotif.denied | permission:commnotif | permission-denial-fallback | surface:chat<br>fixture:fixture.today.chat.permission-denied<br>permission-status:commnotif.not-determined | deny-permission:commnotif | state-visible:chat.permission-denied<br>fallback-visible:commnotif |
| permission.remotenotif.denied | permission:remotenotif | permission-denial-fallback | surface:plan<br>fixture:fixture.today.plan.permission-denied<br>permission-status:remotenotif.not-determined | deny-permission:remotenotif | state-visible:plan.permission-denied<br>fallback-visible:remotenotif |
| permission.fetch.denied | permission:fetch | permission-denial-fallback | surface:settings<br>fixture:fixture.today.settings.permission-denied<br>permission-status:fetch.not-determined | deny-permission:fetch | state-visible:settings.permission-denied<br>fallback-visible:fetch |
| permission.bgtask.denied | permission:bgtask | permission-denial-fallback | surface:refresh<br>fixture:fixture.today.home.permission-denied<br>permission-status:bgtask.not-determined | deny-permission:bgtask | state-visible:home.permission-denied<br>fallback-visible:bgtask |
| permission.appgroups.denied | permission:appgroups | permission-denial-fallback | surface:settings<br>fixture:fixture.today.widget.permission-denied<br>permission-status:appgroups.not-determined | deny-permission:appgroups | state-visible:widget.permission-denied<br>fallback-visible:appgroups |
| permission.keychain.denied | permission:keychain | permission-denial-fallback | surface:widget<br>fixture:fixture.today.home.permission-denied<br>permission-status:keychain.not-determined | deny-permission:keychain | state-visible:home.permission-denied<br>fallback-visible:keychain |
| permission.autofill.denied | permission:autofill | permission-denial-fallback | surface:settings<br>fixture:fixture.today.fill.permission-denied<br>permission-status:autofill.not-determined | deny-permission:autofill | state-visible:fill.permission-denied<br>fallback-visible:autofill |
| permission.wifiinfo.denied | permission:wifiinfo | permission-denial-fallback | surface:plan<br>fixture:fixture.today.plan.permission-denied<br>permission-status:wifiinfo.not-determined | deny-permission:wifiinfo | state-visible:plan.permission-denied<br>fallback-visible:wifiinfo |
| permission.calendar.denied | permission:calendar | permission-denial-fallback | surface:plan<br>fixture:fixture.today.plan.permission-denied<br>permission-status:calendar.not-determined | deny-permission:calendar | state-visible:plan.permission-denied<br>fallback-visible:calendar |
| permission.contacts.denied | permission:contacts | permission-denial-fallback | surface:profile<br>fixture:fixture.today.mates.denied<br>permission-status:contacts.not-determined | deny-permission:contacts | state-visible:mates.permission-denied<br>fallback-visible:contacts |
| permission.faceid.denied | permission:faceid | permission-denial-fallback | surface:settings<br>fixture:fixture.today.lock.denied<br>permission-status:faceid.not-determined | deny-permission:faceid | state-visible:lock.permission-denied<br>fallback-visible:faceid |
| permission.speech.denied | permission:speech | permission-denial-fallback | surface:create<br>fixture:fixture.today.sayplan.permission-denied<br>permission-status:speech.not-determined | deny-permission:speech | state-visible:sayplan.permission-denied<br>fallback-visible:speech |
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.today.profile.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:profile.permission-denied<br>fallback-visible:tracking |
| permission.shareext.denied | permission:shareext | permission-denial-fallback | surface:settings<br>fixture:fixture.today.shareext.permission-denied<br>permission-status:shareext.not-determined | deny-permission:shareext | state-visible:shareext.permission-denied<br>fallback-visible:shareext |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:netqr<br>fixture:fixture.today.netqr.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:netqr.permission-denied<br>fallback-visible:hotspot |
| permission.voip.denied | permission:voip | permission-denial-fallback | surface:chat<br>fixture:fixture.today.call.permission-denied<br>permission-status:voip.not-determined | deny-permission:voip | state-visible:call.permission-denied<br>fallback-visible:voip |
| permission.audio.denied | permission:audio | permission-denial-fallback | surface:onway<br>fixture:fixture.today.background.permission-denied<br>permission-status:audio.not-determined | deny-permission:audio | state-visible:background.permission-denied<br>fallback-visible:audio |

## Deterministic fixture catalog

Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.

| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |
|---|---|---|---|---|---|
| fixture.today.phone.default | phone / default | today.phone.default.primary.001<br>today.phone.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.phone.loading | phone / loading | today.phone.loading.primary.001<br>today.phone.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.phone.error | phone / error | today.phone.error.primary.001<br>today.phone.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.phone.offline | phone / offline | today.phone.offline.primary.001<br>today.phone.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.code.default | code / default | today.code.default.primary.001<br>today.code.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.code.loading | code / loading | today.code.loading.primary.001<br>today.code.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.code.error | code / error | today.code.error.primary.001<br>today.code.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.code.offline | code / offline | today.code.offline.primary.001<br>today.code.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.codefail.default | codefail / default | today.codefail.default.primary.001<br>today.codefail.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.codefail.loading | codefail / loading | today.codefail.loading.primary.001<br>today.codefail.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.codefail.error | codefail / error | today.codefail.error.primary.001<br>today.codefail.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.codefail.offline | codefail / offline | today.codefail.offline.primary.001<br>today.codefail.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.default | home / default | today.home.default.primary.001<br>today.home.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.empty | home / empty | today.home.empty.primary.001<br>today.home.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.loading | home / loading | today.home.loading.primary.001<br>today.home.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.error | home / error | today.home.error.primary.001<br>today.home.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.offline | home / offline | today.home.offline.primary.001<br>today.home.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.permission-needed | home / permission-needed | today.home.permission-needed.primary.001<br>today.home.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.permission-denied | home / permission-denied | today.home.permission-denied.primary.001<br>today.home.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.permission-restricted | home / permission-restricted | today.home.permission-restricted.primary.001<br>today.home.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.home.permission-limited | home / permission-limited | today.home.permission-limited.primary.001<br>today.home.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.match.default | match / default | today.match.default.primary.001<br>today.match.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.match.loading | match / loading | today.match.loading.primary.001<br>today.match.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.match.error | match / error | today.match.error.primary.001<br>today.match.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.match.offline | match / offline | today.match.offline.primary.001<br>today.match.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.default | nearby / default | today.nearby.default.primary.001<br>today.nearby.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.empty | nearby / empty | today.nearby.empty.primary.001<br>today.nearby.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.loading | nearby / loading | today.nearby.loading.primary.001<br>today.nearby.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.error | nearby / error | today.nearby.error.primary.001<br>today.nearby.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.offline | nearby / offline | today.nearby.offline.primary.001<br>today.nearby.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.permission-needed | nearby / permission-needed | today.nearby.permission-needed.primary.001<br>today.nearby.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.permission-denied | nearby / permission-denied | today.nearby.permission-denied.primary.001<br>today.nearby.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.permission-restricted | nearby / permission-restricted | today.nearby.permission-restricted.primary.001<br>today.nearby.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.nearby.permission-limited | nearby / permission-limited | today.nearby.permission-limited.primary.001<br>today.nearby.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.default | plan / default | today.plan.default.primary.001<br>today.plan.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.loading | plan / loading | today.plan.loading.primary.001<br>today.plan.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.error | plan / error | today.plan.error.primary.001<br>today.plan.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.offline | plan / offline | today.plan.offline.primary.001<br>today.plan.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.permission-needed | plan / permission-needed | today.plan.permission-needed.primary.001<br>today.plan.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.permission-denied | plan / permission-denied | today.plan.permission-denied.primary.001<br>today.plan.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.plan.permission-restricted | plan / permission-restricted | today.plan.permission-restricted.primary.001<br>today.plan.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.default | create / default | today.create.default.primary.001<br>today.create.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.error | create / error | today.create.error.primary.001<br>today.create.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.success | create / success | today.create.success.primary.001<br>today.create.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.loading | create / loading | today.create.loading.primary.001<br>today.create.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.offline | create / offline | today.create.offline.primary.001<br>today.create.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.permission-needed | create / permission-needed | today.create.permission-needed.primary.001<br>today.create.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.permission-denied | create / permission-denied | today.create.permission-denied.primary.001<br>today.create.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.permission-restricted | create / permission-restricted | today.create.permission-restricted.primary.001<br>today.create.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.create.permission-limited | create / permission-limited | today.create.permission-limited.primary.001<br>today.create.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.default | camera / default | today.camera.default.primary.001<br>today.camera.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.denied | camera / denied | today.camera.denied.primary.001<br>today.camera.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.loading | camera / loading | today.camera.loading.primary.001<br>today.camera.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.error | camera / error | today.camera.error.primary.001<br>today.camera.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.offline | camera / offline | today.camera.offline.primary.001<br>today.camera.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.permission-needed | camera / permission-needed | today.camera.permission-needed.primary.001<br>today.camera.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.permission-restricted | camera / permission-restricted | today.camera.permission-restricted.primary.001<br>today.camera.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.camera.permission-limited | camera / permission-limited | today.camera.permission-limited.primary.001<br>today.camera.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.default | media / default | today.media.default.primary.001<br>today.media.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.loading | media / loading | today.media.loading.primary.001<br>today.media.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.error | media / error | today.media.error.primary.001<br>today.media.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.offline | media / offline | today.media.offline.primary.001<br>today.media.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.permission-needed | media / permission-needed | today.media.permission-needed.primary.001<br>today.media.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.permission-denied | media / permission-denied | today.media.permission-denied.primary.001<br>today.media.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.permission-restricted | media / permission-restricted | today.media.permission-restricted.primary.001<br>today.media.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.media.permission-limited | media / permission-limited | today.media.permission-limited.primary.001<br>today.media.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.groups.default | groups / default | today.groups.default.primary.001<br>today.groups.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.groups.empty | groups / empty | today.groups.empty.primary.001<br>today.groups.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.groups.loading | groups / loading | today.groups.loading.primary.001<br>today.groups.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.groups.error | groups / error | today.groups.error.primary.001<br>today.groups.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.groups.offline | groups / offline | today.groups.offline.primary.001<br>today.groups.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chats.default | chats / default | today.chats.default.primary.001<br>today.chats.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chats.empty | chats / empty | today.chats.empty.primary.001<br>today.chats.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chats.loading | chats / loading | today.chats.loading.primary.001<br>today.chats.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chats.error | chats / error | today.chats.error.primary.001<br>today.chats.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chats.offline | chats / offline | today.chats.offline.primary.001<br>today.chats.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.default | chat / default | today.chat.default.primary.001<br>today.chat.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.loading | chat / loading | today.chat.loading.primary.001<br>today.chat.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.error | chat / error | today.chat.error.primary.001<br>today.chat.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.offline | chat / offline | today.chat.offline.primary.001<br>today.chat.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.permission-needed | chat / permission-needed | today.chat.permission-needed.primary.001<br>today.chat.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.permission-denied | chat / permission-denied | today.chat.permission-denied.primary.001<br>today.chat.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.chat.permission-restricted | chat / permission-restricted | today.chat.permission-restricted.primary.001<br>today.chat.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.default | voice / default | today.voice.default.primary.001<br>today.voice.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.denied | voice / denied | today.voice.denied.primary.001<br>today.voice.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.loading | voice / loading | today.voice.loading.primary.001<br>today.voice.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.error | voice / error | today.voice.error.primary.001<br>today.voice.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.offline | voice / offline | today.voice.offline.primary.001<br>today.voice.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.permission-needed | voice / permission-needed | today.voice.permission-needed.primary.001<br>today.voice.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.voice.permission-restricted | voice / permission-restricted | today.voice.permission-restricted.primary.001<br>today.voice.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.default | profile / default | today.profile.default.primary.001<br>today.profile.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.loading | profile / loading | today.profile.loading.primary.001<br>today.profile.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.error | profile / error | today.profile.error.primary.001<br>today.profile.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.offline | profile / offline | today.profile.offline.primary.001<br>today.profile.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.empty | profile / empty | today.profile.empty.primary.001<br>today.profile.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.permission-needed | profile / permission-needed | today.profile.permission-needed.primary.001<br>today.profile.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.permission-denied | profile / permission-denied | today.profile.permission-denied.primary.001<br>today.profile.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.permission-restricted | profile / permission-restricted | today.profile.permission-restricted.primary.001<br>today.profile.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.profile.permission-limited | profile / permission-limited | today.profile.permission-limited.primary.001<br>today.profile.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.default | settings / default | today.settings.default.primary.001<br>today.settings.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.loading | settings / loading | today.settings.loading.primary.001<br>today.settings.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.error | settings / error | today.settings.error.primary.001<br>today.settings.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.offline | settings / offline | today.settings.offline.primary.001<br>today.settings.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.empty | settings / empty | today.settings.empty.primary.001<br>today.settings.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.permission-needed | settings / permission-needed | today.settings.permission-needed.primary.001<br>today.settings.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.permission-denied | settings / permission-denied | today.settings.permission-denied.primary.001<br>today.settings.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.settings.permission-restricted | settings / permission-restricted | today.settings.permission-restricted.primary.001<br>today.settings.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.default | widget / default | today.widget.default.primary.001<br>today.widget.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.loading | widget / loading | today.widget.loading.primary.001<br>today.widget.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.error | widget / error | today.widget.error.primary.001<br>today.widget.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.offline | widget / offline | today.widget.offline.primary.001<br>today.widget.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.permission-needed | widget / permission-needed | today.widget.permission-needed.primary.001<br>today.widget.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.permission-denied | widget / permission-denied | today.widget.permission-denied.primary.001<br>today.widget.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.widget.permission-restricted | widget / permission-restricted | today.widget.permission-restricted.primary.001<br>today.widget.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.default | fill / default | today.fill.default.primary.001<br>today.fill.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.loading | fill / loading | today.fill.loading.primary.001<br>today.fill.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.error | fill / error | today.fill.error.primary.001<br>today.fill.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.offline | fill / offline | today.fill.offline.primary.001<br>today.fill.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.permission-needed | fill / permission-needed | today.fill.permission-needed.primary.001<br>today.fill.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.permission-denied | fill / permission-denied | today.fill.permission-denied.primary.001<br>today.fill.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.fill.permission-restricted | fill / permission-restricted | today.fill.permission-restricted.primary.001<br>today.fill.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.default | refresh / default | today.refresh.default.primary.001<br>today.refresh.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.loading | refresh / loading | today.refresh.loading.primary.001<br>today.refresh.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.error | refresh / error | today.refresh.error.primary.001<br>today.refresh.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.offline | refresh / offline | today.refresh.offline.primary.001<br>today.refresh.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.permission-needed | refresh / permission-needed | today.refresh.permission-needed.primary.001<br>today.refresh.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.permission-denied | refresh / permission-denied | today.refresh.permission-denied.primary.001<br>today.refresh.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.refresh.permission-restricted | refresh / permission-restricted | today.refresh.permission-restricted.primary.001<br>today.refresh.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.default | mates / default | today.mates.default.primary.001<br>today.mates.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.empty | mates / empty | today.mates.empty.primary.001<br>today.mates.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.denied | mates / denied | today.mates.denied.primary.001<br>today.mates.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.loading | mates / loading | today.mates.loading.primary.001<br>today.mates.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.error | mates / error | today.mates.error.primary.001<br>today.mates.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.offline | mates / offline | today.mates.offline.primary.001<br>today.mates.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.permission-needed | mates / permission-needed | today.mates.permission-needed.primary.001<br>today.mates.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.permission-restricted | mates / permission-restricted | today.mates.permission-restricted.primary.001<br>today.mates.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.mates.permission-limited | mates / permission-limited | today.mates.permission-limited.primary.001<br>today.mates.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.default | ads / default | today.ads.default.primary.001<br>today.ads.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.loading | ads / loading | today.ads.loading.primary.001<br>today.ads.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.error | ads / error | today.ads.error.primary.001<br>today.ads.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.offline | ads / offline | today.ads.offline.primary.001<br>today.ads.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.permission-needed | ads / permission-needed | today.ads.permission-needed.primary.001<br>today.ads.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.permission-denied | ads / permission-denied | today.ads.permission-denied.primary.001<br>today.ads.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.ads.permission-restricted | ads / permission-restricted | today.ads.permission-restricted.primary.001<br>today.ads.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.default | lock / default | today.lock.default.primary.001<br>today.lock.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.denied | lock / denied | today.lock.denied.primary.001<br>today.lock.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.loading | lock / loading | today.lock.loading.primary.001<br>today.lock.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.error | lock / error | today.lock.error.primary.001<br>today.lock.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.offline | lock / offline | today.lock.offline.primary.001<br>today.lock.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.permission-needed | lock / permission-needed | today.lock.permission-needed.primary.001<br>today.lock.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.lock.permission-restricted | lock / permission-restricted | today.lock.permission-restricted.primary.001<br>today.lock.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.default | sayplan / default | today.sayplan.default.primary.001<br>today.sayplan.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.error | sayplan / error | today.sayplan.error.primary.001<br>today.sayplan.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.success | sayplan / success | today.sayplan.success.primary.001<br>today.sayplan.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.loading | sayplan / loading | today.sayplan.loading.primary.001<br>today.sayplan.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.offline | sayplan / offline | today.sayplan.offline.primary.001<br>today.sayplan.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.permission-needed | sayplan / permission-needed | today.sayplan.permission-needed.primary.001<br>today.sayplan.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.permission-denied | sayplan / permission-denied | today.sayplan.permission-denied.primary.001<br>today.sayplan.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.sayplan.permission-restricted | sayplan / permission-restricted | today.sayplan.permission-restricted.primary.001<br>today.sayplan.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.default | onway / default | today.onway.default.primary.001<br>today.onway.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.loading | onway / loading | today.onway.loading.primary.001<br>today.onway.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.error | onway / error | today.onway.error.primary.001<br>today.onway.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.offline | onway / offline | today.onway.offline.primary.001<br>today.onway.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.permission-needed | onway / permission-needed | today.onway.permission-needed.primary.001<br>today.onway.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.permission-denied | onway / permission-denied | today.onway.permission-denied.primary.001<br>today.onway.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.onway.permission-restricted | onway / permission-restricted | today.onway.permission-restricted.primary.001<br>today.onway.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.default | background / default | today.background.default.primary.001<br>today.background.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.loading | background / loading | today.background.loading.primary.001<br>today.background.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.error | background / error | today.background.error.primary.001<br>today.background.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.offline | background / offline | today.background.offline.primary.001<br>today.background.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.permission-needed | background / permission-needed | today.background.permission-needed.primary.001<br>today.background.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.permission-denied | background / permission-denied | today.background.permission-denied.primary.001<br>today.background.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.background.permission-restricted | background / permission-restricted | today.background.permission-restricted.primary.001<br>today.background.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.default | call / default | today.call.default.primary.001<br>today.call.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.loading | call / loading | today.call.loading.primary.001<br>today.call.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.error | call / error | today.call.error.primary.001<br>today.call.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.offline | call / offline | today.call.offline.primary.001<br>today.call.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.permission-needed | call / permission-needed | today.call.permission-needed.primary.001<br>today.call.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.permission-denied | call / permission-denied | today.call.permission-denied.primary.001<br>today.call.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.call.permission-restricted | call / permission-restricted | today.call.permission-restricted.primary.001<br>today.call.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.default | netqr / default | today.netqr.default.primary.001<br>today.netqr.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.error | netqr / error | today.netqr.error.primary.001<br>today.netqr.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.loading | netqr / loading | today.netqr.loading.primary.001<br>today.netqr.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.offline | netqr / offline | today.netqr.offline.primary.001<br>today.netqr.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.permission-needed | netqr / permission-needed | today.netqr.permission-needed.primary.001<br>today.netqr.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.permission-denied | netqr / permission-denied | today.netqr.permission-denied.primary.001<br>today.netqr.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.netqr.permission-restricted | netqr / permission-restricted | today.netqr.permission-restricted.primary.001<br>today.netqr.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.default | shareext / default | today.shareext.default.primary.001<br>today.shareext.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.success | shareext / success | today.shareext.success.primary.001<br>today.shareext.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.loading | shareext / loading | today.shareext.loading.primary.001<br>today.shareext.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.error | shareext / error | today.shareext.error.primary.001<br>today.shareext.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.offline | shareext / offline | today.shareext.offline.primary.001<br>today.shareext.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.permission-needed | shareext / permission-needed | today.shareext.permission-needed.primary.001<br>today.shareext.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.permission-denied | shareext / permission-denied | today.shareext.permission-denied.primary.001<br>today.shareext.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |
| fixture.today.shareext.permission-restricted | shareext / permission-restricted | today.shareext.permission-restricted.primary.001<br>today.shareext.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/today/concept.json + curated native portfolio | no media |

## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| camera | Обложка приватного плана | Только после действия ««Снять»» | Сценарий «Обложка приватного плана» на поверхности create | Можно выбрать готовый снимок | contextual-gesture |
| photos | Фото для обложки | Только после действия ««Из Фото»» | Сценарий «Фото для обложки» на поверхности create | Можно снять новый кадр камерой | contextual-gesture |
| mic | Голосовое в группе | Только после действия ««Записать голосовое»» | Сценарий «Голосовое в группе» на поверхности chat | Остаются текст и фото | contextual-gesture |
| location | Места между друзьями | Только после действия ««Показать совпадения»» | Сценарий «Места между друзьями» на поверхности home | Район выбирается вручную | contextual-gesture |
| push | Совпадение с другом | Только после действия ««Совпадения по времени» в «Настройках»» | Сценарий «Совпадение с другом» на поверхности settings | Обновления помечаются точкой внутри приложения | contextual-gesture |
| commnotif | Чаты с аватарами в уведомлениях | Только после действия ««Сообщения с аватаром»» | Сценарий «Чаты с аватарами в уведомлениях» на поверхности chat | Обычное уведомление без аватара | build-artifact |
| remotenotif | Актуальный состав плана | Только после действия ««Обновлять состав»» | Сценарий «Актуальный состав плана» на поверхности plan | Состав обновляется при открытии | app-lifecycle |
| fetch | Свежие планы к запуску | Только после действия ««Обновлять планы в фоне»» | Сценарий «Свежие планы к запуску» на поверхности settings | Планы обновятся после открытия | app-lifecycle |
| bgtask | Зарегистрированная задача обновления | Только после действия ««Проверить задачу»» | Сценарий «Зарегистрированная задача обновления» на поверхности refresh | Без задачи обновление только вручную | app-lifecycle |
| appgroups | Виджет ближайшего плана | Только после действия ««Виджет»» | Сценарий «Виджет ближайшего плана» на поверхности settings | План остаётся внутри приложения | build-artifact |
| keychain | Один вход для приложения и виджета | Только после действия ««Открыть „Сегодня“» с виджета» | Сценарий «Один вход для приложения и виджета» на поверхности widget | Виджет открывает приложение для входа | build-artifact |
| autofill | Вход на сайт сохранённой связкой | Только после действия ««Вход на сайте»» | Сценарий «Вход на сайт сохранённой связкой» на поверхности settings | Вход вручную почтой и паролем | contextual-gesture |
| wifiinfo | Статус «на месте» | Только после действия ««Я на месте»» | Сценарий «Статус «на месте»» на поверхности plan | Отметка по кнопке без автоматической проверки | build-artifact |
| calendar | Подтверждённый план в системном календаре, с правкой при переносе времени и удалением при отмене | Только после действия ««Добавить в Календарь»» | Сценарий «Подтверждённый план в системном календаре, с правкой при переносе времени и удалением при отмене» на поверхности plan | Время остаётся в карточке плана и в напоминании приложения | contextual-gesture |
| contacts | Кто из контактов уже в «Сегодня»: круг близких — единственный источник совпадений | Только после действия ««Найти среди контактов»» | Сценарий «Кто из контактов уже в «Сегодня»: круг близких — единственный источник совпадений» на поверхности profile | Остаётся поиск по имени и ссылка-приглашение | contextual-gesture |
| faceid | Замок на планах: кто свободен, во сколько и где встречаетесь | Только после действия ««Замок Face ID»» | Сценарий «Замок на планах: кто свободен, во сколько и где встречаетесь» на поверхности settings | Остаётся код-пароль устройства | contextual-gesture |
| speech | Сказать план голосом: «в семь на катке» — время и место распознаются на устройстве | Только после действия ««Сказать план» — цепочкой с микрофоном» | Сценарий «Сказать план голосом: «в семь на катке» — время и место распознаются на устройстве» на поверхности create | Время и место выбираются списком, как раньше | contextual-gesture |
| tracking | Реклама мест и событий вместо платной подписки | Только после действия ««Продолжить»» | Сценарий «Реклама мест и событий вместо платной подписки» на поверхности ads | Подборки остаются, но перестают подбираться под вас | contextual-gesture |
| shareext | Поделиться местом из Карт или ссылкой из Safari — падает прямо в план | Только после действия ««Поделиться» в другом приложении» | Сценарий «Поделиться местом из Карт или ссылкой из Safari — падает прямо в план» на поверхности settings | Место добавляется поиском внутри приложения | contextual-gesture |
| hotspot | Гостевая сеть места встречи по QR — без неё отметка «я на месте» не проходит | Только после действия ««Подключиться»» | Сценарий «Гостевая сеть места встречи по QR — без неё отметка «я на месте» не проходит» на поверхности netqr | Сеть выбирается вручную в Настройках | build-artifact |
| voip | Созвон участников плана: в план зовут друзей друзей, номерами при этом не обмениваются | Только после действия ««Позвонить»» | Сценарий «Созвон участников плана: в план зовут друзей друзей, номерами при этом не обмениваются» на поверхности chat | Остаётся переписка в плане | contextual-gesture |
| audio | Голосовые из плана играют подряд по дороге к месту: на локскрине — Now Playing и ±15 секунд | Только после действия ««Слушать подряд»» | Сценарий «Голосовые из плана играют подряд по дороге к месту: на локскрине — Now Playing и ±15 секунд» на поверхности onway | Без entitlement очередь обрывается на первом сообщении — не ship | contextual-gesture |

**Entitlements:** `aps-environment`, `com.apple.developer.usernotifications.communication`, `com.apple.security.application-groups`, `keychain-access-groups`, `com.apple.developer.networking.wifi-info`, `com.apple.developer.networking.HotspotConfiguration`
**Extension targets:** `notification-service`, `credential-provider`, `share-extension`

## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product domain | Владеет сущностями и состояниями План сегодня | native/apps/today |
| Native runtime | Владеет системными разрешениями и lifecycle | native/Runtime |
| Visual language | Владеет семантической визуальной грамматикой | native/DesignSystem |

**Boundaries**
- Продуктовое состояние не живёт в визуальных примитивах
- Разрешения доступны только через причинное действие
- Web evidence не входит в native build graph

## Data, state, persistence, and integrations

**Entities**

- Намерение
- Совпадение
- План сегодня
- Группа плана

**State**

- Текущая сессия
- Жизненный цикл План сегодня
- Состояния разрешений и восстановления

**Persistence**

- Локальный черновик переживает перезапуск
- Защищённые значения используют системное хранилище только по capability contract

**Integrations**

- Статусы друзей: Статический демо-граф и локальные статусы в прототипе
- Подбор места: MapKit local search на устройстве
- Сообщения: Firebase SDK без собственного API

## Loading, empty, error, denied, and offline states

| State | Required behavior |
|---|---|
| loading | Сохранять контекст задачи и блокировать повторную отправку. |
| empty | Объяснить отсутствие план сегодня и предложить первое полезное действие. |
| error | Назвать неуспешную операцию, сохранить ввод и дать повтор или альтернативу. |
| denied | Продолжить задачу через объявленный denied fallback. |
| offline | Показать сохранённые данные и явно отделить их от свежих. |

## Privacy, security, and trust

**Data inventory**

- Продуктовая единица «План сегодня»
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

- Доля созданных планов, получивших двух подтверждённых участников и место
- Повтор основного цикла
- Завершение задачи после denied fallback

**Core-loop hypothesis.** Приватное намерение с TTL сокращает время от желания до подтверждённого плана

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
- home--default
- match--default
- nearby--default
- plan--default
- create--default
- camera--default
- media--default
- groups--default
- chats--default
- chat--default
- voice--default
- profile--default
- settings--default
- widget--default
- fill--default
- refresh--default
- mates--default
- ads--default
- lock--default
- sayplan--default
- onway--default
- background--default
- call--default
- netqr--default
- shareext--default

**Evidence provenance**

- today-web-evidence · user-input · observed · platform/concepts/today/concept.json and screens
- today-reference · reference-profile · approved · approved differentiation strategy
- today-market-assumption · assumption · needs-validation · curated migration portfolio; real research not yet supplied

## Setup, build, and run

**Prerequisites**

- Node 22
- Xcode и iOS simulator

**Build**

- `npm run build -- today`

**Run and verify**

- `npm run check -- today`
- `npm run capture -- today`

## Generated and owned file map

| Generated — do not hand-edit | Product-owned source |
|---|---|
| native/build/today<br>concepts/today/docs/developer-guide.md | concepts/today/concept.json<br>native/apps/today |

## Limitations, risks, and acceptance criteria

**Limitations**

- Market demand ещё не подтверждён
- Web screens являются migration evidence, а не native layout
- Медиа требуют отдельной проверки лицензии
- Physical device и VoiceOver остаются ручными воротами

**Risks**

- risk: Участники не переходят от просмотра к завершению задачи; mitigation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; killSignal: Менее 15% активированных участников завершают исход после четырёх недель
- risk: Набор разрешений окажется шире реальной ценности; mitigation: Проверять каждое разрешение через достижимый flow; killSignal: Разрешение нельзя защитить наблюдаемым исходом

**Assumptions still requiring evidence**

- claim: Приватное намерение с TTL сокращает время от желания до подтверждённого плана; risk: high; validation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; status: needs-validation
- claim: Для «План сегодня» достаточно повторяемого предложения и ответов в начальной когорте; risk: high; validation: Проверить supply и completion на пилотной когорте; status: needs-validation

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
- Закрытый сервис спонтанных планов с друзьями.
