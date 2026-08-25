# Хвосты: developer product guide

> Generated from Product Contract `product-22f06361067049de` and the compiled native manifest. Do not edit by hand.
> UX Specification: `ux-e772386e916c7edb`; source: `explicit-product-delivery`.
> Contract status: `mature`; maturity floor: `3/4`.

## Product vision and scope

**Thesis.** «Хвосты» превращают профиль питомца и его ограничения в подтверждённую совместимую прогулку, а не просто в ещё одну ленту фотографий.

**Audience.** Городские владельцы собак и кошек 18–40 лет

**Situation.** Хочется компании для прогулки, совета или помощи рядом; владельцу проще начать разговор с имени собаки, чем с собственного

**Job.** Городские владельцы собак и кошек 18–40 лет wants to Не писать в шумный районный чат и не рисковать несовместимой встречей so that Найти подходящую компанию для питомца и договориться о конкретной прогулке.

**Wedge.** Предложение прогулки связывает питомца, темперамент, место, время и подтверждение обеих сторон

**Observable differentiation.** Владельцы переходят из профиля совместимого питомца к подтверждённой прогулке и повторному контакту; measured by Доля открытых предложений, завершившихся подтверждённой прогулкой; threshold: Не менее 30% активированных участников завершают основной исход в пилоте.

**In scope**

- Совместимая прогулка
- Снять публикацию питомца
- Публикация из медиатеки
- Голосовые в личном чате
- Прогулки рядом
- Ответы и изменения прогулки
- Чаты с аватарами в уведомлениях
- Актуальный состав прогулки
- Свежая лента к запуску
- Зарегистрированная задача обновления
- Виджет ближайшей прогулки
- Один вход для приложения и виджета
- Вход на сайт сохранённой связкой
- Отметка «я на месте» в партнёрском дог-парке
- Кто из ваших контактов уже гуляет рядом
- Реклама зоомагазинов, кормов и ветклиник вместо платной подписки
- Замок на ветпаспорте: диагнозы, номер чипа и адрес выгула
- Заметка о самочувствии голосом: текст ложится в карточку питомца и ищется словом
- Курс послушания слушают на прогулке: руки заняты поводком, на локскрине — Now Playing и ±15 секунд
- Созвон с догситтером и передержкой без обмена номерами
- Прививки и обработка от клещей в системном календаре, с правкой при переносе и удалением при отмене
- Поделиться в «Хвосты» из Safari и «Фото» — объявление о найденной собаке падает в черновик
- Гостевая сеть дог-парка по QR — без неё отметка на площадке не проходит

**Non-goals**

- Ветеринарная телемедицина
- Маркетплейс животных
- Анонимные знакомства

## Domain glossary

| Term | Definition |
|---|---|
| Питомец | Социальная идентичность животного, которой управляет его владелец. |
| Совместимость | Набор ограничений питомца, влияющих на безопасную совместную прогулку. |
| Прогулка | Ограниченная по месту и времени встреча владельцев с питомцами. |
| Момент | Публикация питомца, способная привести к знакомству или прогулке. |

## Personas and jobs

| Persona | Context | Job |
|---|---|---|
| Основной участник | Хочется компании для прогулки, совета или помощи рядом | Найти подходящую компанию для питомца и договориться о конкретной прогулке |
| Контрагент | Владельцы связаны через питомцев, совместимость и подтверждённые совместные прогулки | Ответить на совместимая прогулка и закрыть следующий шаг |
| Возвращающийся участник | Новые моменты друзей | Продолжить незавершённый совместимая прогулка |

## Core loop and critical flows

**Core loop:** Наступило обычное окно прогулки или пришло предложение совместимого питомца → Проверить совместимость и подтвердить прогулку с конкретным питомцем → Найти подходящую компанию для питомца и договориться о конкретной прогулке → Подтвердить результат и сделать следующий совместимая прогулка полезнее.
**Habit loop:** Наступило обычное окно прогулки или пришло предложение совместимого питомца → Проверить совместимость и подтвердить прогулку с конкретным питомцем → Найти подходящую компанию для питомца и договориться о конкретной прогулке; cadence: Событийно, без искусственного ежедневного обещания.
**Activation:** Участник завершил первый значимый шаг в «Совместимая прогулка»; signal: compatible-walk-network_activated; window: Первые семь дней.

| Flow | Trigger | Steps | Outcome |
|---|---|---|---|
| Весь продукт | phone | phone<br>code<br>codefail<br>home<br>pet<br>nearby<br>walk<br>create | Лента, прогулка, публикация, чат и системные функции |
| Найти прогулку | walk | walk<br>netqr<br>nearby<br>background<br>home | От ленты до встречи |
| Опубликовать момент | create | create<br>home<br>nearby<br>chats<br>profile<br>camera<br>media<br>shareext | Камера и медиатека |

## Information architecture and navigation

**Navigation model.** Идентифицированные люди публикуют социальные единицы, отвечают, переписываются и возвращаются через знакомую плотную структуру VK.
**Reference fit.** Питомец естественно становится профилем, Момент — социальной единицей, а Прогулка — ответом и перепиской в узнаваемой модели VK.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| home | tab | — | tab:home<br>permission:refresh.bgtask<br>permission:widget.keychain | present:null<br>present:null<br>present:null<br>navigate:open-pet<br>permission:location | session.authenticated<br>capability.bgtask.requested<br>capability.keychain.requested | none:none |
| pet | push | home | parent:home<br>action:home.open-pet | present:null<br>present:null<br>navigate:open-vetnote<br>permission:speech | always | pop:home |
| nearby | tab | — | tab:nearby<br>permission:home.location | present:null<br>navigate:open-walk | session.authenticated<br>capability.location.requested | none:none |
| walk | push | nearby | parent:nearby<br>action:nearby.open-walk<br>permission:walk.remotenotif<br>permission:walk.wifiinfo | present:null<br>navigate:open-netqr<br>permission:remotenotif<br>permission:wifiinfo | always<br>capability.remotenotif.requested<br>capability.wifiinfo.requested | pop:nearby |
| create | tab | — | tab:create | present:null<br>present:null<br>navigate:open-camera<br>permission:camera<br>permission:photos | session.authenticated | none:none |
| camera | cover | create | parent:create<br>action:create.open-camera<br>permission:create.camera | mutate:complete-camera | always<br>capability.camera.requested | dismiss:create; interactive-or-action:create |
| media | push | create | parent:create<br>permission:create.photos | mutate:complete-media | capability.photos.requested | pop:create |
| places | push | home | parent:home | mutate:complete-places | none | pop:home |
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
| vetnote | push | pet | parent:pet<br>action:pet.open-vetnote<br>permission:pet.speech | mutate:complete-vetnote | always<br>capability.speech.requested | pop:pet |
| course | push | home | parent:home | present:null<br>navigate:open-background<br>permission:audio | none | pop:home |
| background | cover | course | parent:course<br>action:course.open-background<br>permission:course.audio | mutate:complete-background | always<br>capability.audio.requested | dismiss:course; interactive-or-action:course |
| call | cover | chat | parent:chat<br>permission:chat.voip | mutate:complete-call | capability.voip.requested | dismiss:chat; interactive-or-action:chat |
| vaccine | push | pet | parent:pet<br>permission:vaccine.calendar | mutate:complete-vaccine<br>permission:calendar | capability.calendar.requested | pop:pet |
| netqr | sheet | walk | parent:walk<br>action:walk.open-netqr<br>permission:netqr.hotspot | mutate:complete-netqr<br>permission:hotspot | always<br>capability.hotspot.requested | dismiss:walk; interactive-or-action:walk |
| shareext | sheet | settings | parent:settings<br>permission:settings.shareext | mutate:complete-shareext | capability.shareext.requested | dismiss:settings; interactive-or-action:settings |

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

## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | open-code | open-code:navigate→code | screen.phone.state.loading.recovery | fixture.tails.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | open-code | open-code:navigate→code | screen.phone.state.populated-default.recovery | fixture.tails.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | open-code | open-code:navigate→code | screen.phone.state.error.recovery | fixture.tails.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | open-code | open-code:navigate→code | screen.phone.state.offline.recovery | fixture.tails.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.loading.recovery | fixture.tails.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.populated-default.recovery | fixture.tails.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.error.recovery | fixture.tails.code.error |
| code | offline | yes | screen.code.state.offline.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.offline.recovery | fixture.tails.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.loading.recovery | fixture.tails.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.populated-default.recovery | fixture.tails.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.error.recovery | fixture.tails.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.offline.recovery | fixture.tails.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| home | loading | yes | screen.home.state.loading.body | open-pet | open-pet:navigate→pet | screen.home.state.loading.recovery | fixture.tails.home.loading |
| home | populated/default | yes | screen.home.state.populated-default.body | open-pet | open-pet:navigate→pet | screen.home.state.populated-default.recovery | fixture.tails.home.default |
| home | empty | yes | screen.home.state.empty.body | open-pet | open-pet:navigate→pet | screen.home.state.empty.recovery | fixture.tails.home.empty |
| home | error | yes | screen.home.state.error.body | open-pet | open-pet:navigate→pet | screen.home.state.error.recovery | fixture.tails.home.error |
| home | offline | yes | screen.home.state.offline.body | open-pet | open-pet:navigate→pet | screen.home.state.offline.recovery | fixture.tails.home.offline |
| home | permission-needed | yes | screen.home.state.permission-needed.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-needed.recovery | fixture.tails.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-denied.recovery | fixture.tails.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-restricted.recovery | fixture.tails.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-limited.recovery | fixture.tails.home.permission-limited |
| pet | loading | yes | screen.pet.state.loading.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.loading.recovery | fixture.tails.pet.loading |
| pet | populated/default | yes | screen.pet.state.populated-default.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.populated-default.recovery | fixture.tails.pet.default |
| pet | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| pet | error | yes | screen.pet.state.error.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.error.recovery | fixture.tails.pet.error |
| pet | offline | yes | screen.pet.state.offline.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.offline.recovery | fixture.tails.pet.offline |
| pet | permission-needed | yes | screen.pet.state.permission-needed.body | open-vetnote<br>permission.speech.fallback | open-vetnote:navigate→vetnote | screen.pet.state.permission-needed.recovery | fixture.tails.pet.permission-needed |
| pet | permission-denied | yes | screen.pet.state.permission-denied.body | open-vetnote<br>permission.speech.fallback | open-vetnote:navigate→vetnote | screen.pet.state.permission-denied.recovery | fixture.tails.pet.permission-denied |
| pet | permission-restricted | yes | screen.pet.state.permission-restricted.body | open-vetnote<br>permission.speech.fallback | open-vetnote:navigate→vetnote | screen.pet.state.permission-restricted.recovery | fixture.tails.pet.permission-restricted |
| pet | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| nearby | loading | yes | screen.nearby.state.loading.body | open-walk | open-walk:navigate→walk | screen.nearby.state.loading.recovery | fixture.tails.nearby.loading |
| nearby | populated/default | yes | screen.nearby.state.populated-default.body | open-walk | open-walk:navigate→walk | screen.nearby.state.populated-default.recovery | fixture.tails.nearby.default |
| nearby | empty | yes | screen.nearby.state.empty.body | open-walk | open-walk:navigate→walk | screen.nearby.state.empty.recovery | fixture.tails.nearby.empty |
| nearby | error | yes | screen.nearby.state.error.body | open-walk | open-walk:navigate→walk | screen.nearby.state.error.recovery | fixture.tails.nearby.error |
| nearby | offline | yes | screen.nearby.state.offline.body | open-walk | open-walk:navigate→walk | screen.nearby.state.offline.recovery | fixture.tails.nearby.offline |
| nearby | permission-needed | yes | screen.nearby.state.permission-needed.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-needed.recovery | fixture.tails.nearby.permission-needed |
| nearby | permission-denied | yes | screen.nearby.state.permission-denied.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-denied.recovery | fixture.tails.nearby.permission-denied |
| nearby | permission-restricted | yes | screen.nearby.state.permission-restricted.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-restricted.recovery | fixture.tails.nearby.permission-restricted |
| nearby | permission-limited | yes | screen.nearby.state.permission-limited.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-limited.recovery | fixture.tails.nearby.permission-limited |
| walk | loading | yes | screen.walk.state.loading.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.loading.recovery | fixture.tails.walk.loading |
| walk | populated/default | yes | screen.walk.state.populated-default.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.populated-default.recovery | fixture.tails.walk.default |
| walk | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| walk | error | yes | screen.walk.state.error.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.error.recovery | fixture.tails.walk.error |
| walk | offline | yes | screen.walk.state.offline.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.offline.recovery | fixture.tails.walk.offline |
| walk | permission-needed | yes | screen.walk.state.permission-needed.body | open-netqr<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.walk.state.permission-needed.recovery | fixture.tails.walk.permission-needed |
| walk | permission-denied | yes | screen.walk.state.permission-denied.body | open-netqr<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.walk.state.permission-denied.recovery | fixture.tails.walk.permission-denied |
| walk | permission-restricted | yes | screen.walk.state.permission-restricted.body | open-netqr<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.walk.state.permission-restricted.recovery | fixture.tails.walk.permission-restricted |
| walk | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| create | loading | yes | screen.create.state.loading.body | open-camera | open-camera:navigate→camera | screen.create.state.loading.recovery | fixture.tails.create.loading |
| create | populated/default | yes | screen.create.state.populated-default.body | open-camera | open-camera:navigate→camera | screen.create.state.populated-default.recovery | fixture.tails.create.default<br>fixture.tails.create.success |
| create | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| create | error | yes | screen.create.state.error.body | open-camera | open-camera:navigate→camera | screen.create.state.error.recovery | fixture.tails.create.error |
| create | offline | yes | screen.create.state.offline.body | open-camera | open-camera:navigate→camera | screen.create.state.offline.recovery | fixture.tails.create.offline |
| create | permission-needed | yes | screen.create.state.permission-needed.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-needed.recovery | fixture.tails.create.permission-needed |
| create | permission-denied | yes | screen.create.state.permission-denied.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-denied.recovery | fixture.tails.create.permission-denied |
| create | permission-restricted | yes | screen.create.state.permission-restricted.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-restricted.recovery | fixture.tails.create.permission-restricted |
| create | permission-limited | yes | screen.create.state.permission-limited.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-limited.recovery | fixture.tails.create.permission-limited |
| camera | loading | yes | screen.camera.state.loading.body | complete-camera | complete-camera:mutate | screen.camera.state.loading.recovery | fixture.tails.camera.loading |
| camera | populated/default | yes | screen.camera.state.populated-default.body | complete-camera | complete-camera:mutate | screen.camera.state.populated-default.recovery | fixture.tails.camera.default |
| camera | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| camera | error | yes | screen.camera.state.error.body | complete-camera | complete-camera:mutate | screen.camera.state.error.recovery | fixture.tails.camera.error |
| camera | offline | yes | screen.camera.state.offline.body | complete-camera | complete-camera:mutate | screen.camera.state.offline.recovery | fixture.tails.camera.offline |
| camera | permission-needed | yes | screen.camera.state.permission-needed.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-needed.recovery | fixture.tails.camera.permission-needed |
| camera | permission-denied | yes | screen.camera.state.permission-denied.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-denied.recovery | fixture.tails.camera.denied |
| camera | permission-restricted | yes | screen.camera.state.permission-restricted.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-restricted.recovery | fixture.tails.camera.permission-restricted |
| camera | permission-limited | yes | screen.camera.state.permission-limited.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-limited.recovery | fixture.tails.camera.permission-limited |
| media | loading | yes | screen.media.state.loading.body | complete-media | complete-media:mutate | screen.media.state.loading.recovery | fixture.tails.media.loading |
| media | populated/default | yes | screen.media.state.populated-default.body | complete-media | complete-media:mutate | screen.media.state.populated-default.recovery | fixture.tails.media.default |
| media | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| media | error | yes | screen.media.state.error.body | complete-media | complete-media:mutate | screen.media.state.error.recovery | fixture.tails.media.error |
| media | offline | yes | screen.media.state.offline.body | complete-media | complete-media:mutate | screen.media.state.offline.recovery | fixture.tails.media.offline |
| media | permission-needed | yes | screen.media.state.permission-needed.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-needed.recovery | fixture.tails.media.permission-needed |
| media | permission-denied | yes | screen.media.state.permission-denied.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-denied.recovery | fixture.tails.media.permission-denied |
| media | permission-restricted | yes | screen.media.state.permission-restricted.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-restricted.recovery | fixture.tails.media.permission-restricted |
| media | permission-limited | yes | screen.media.state.permission-limited.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-limited.recovery | fixture.tails.media.permission-limited |
| places | loading | yes | screen.places.state.loading.body | complete-places | complete-places:mutate | screen.places.state.loading.recovery | fixture.tails.places.loading |
| places | populated/default | yes | screen.places.state.populated-default.body | complete-places | complete-places:mutate | screen.places.state.populated-default.recovery | fixture.tails.places.default |
| places | empty | yes | screen.places.state.empty.body | complete-places | complete-places:mutate | screen.places.state.empty.recovery | fixture.tails.places.empty |
| places | error | yes | screen.places.state.error.body | complete-places | complete-places:mutate | screen.places.state.error.recovery | fixture.tails.places.error |
| places | offline | yes | screen.places.state.offline.body | complete-places | complete-places:mutate | screen.places.state.offline.recovery | fixture.tails.places.offline |
| places | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| places | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| places | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| places | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chats | loading | yes | screen.chats.state.loading.body | open-chat | open-chat:navigate→chat | screen.chats.state.loading.recovery | fixture.tails.chats.loading |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.tails.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.tails.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.tails.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.tails.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-voice | open-voice:navigate→voice | screen.chat.state.loading.recovery | fixture.tails.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-voice | open-voice:navigate→voice | screen.chat.state.populated-default.recovery | fixture.tails.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-voice | open-voice:navigate→voice | screen.chat.state.error.recovery | fixture.tails.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-voice | open-voice:navigate→voice | screen.chat.state.offline.recovery | fixture.tails.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-needed.recovery | fixture.tails.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-denied.recovery | fixture.tails.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-restricted.recovery | fixture.tails.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | yes | screen.voice.state.loading.body | complete-voice | complete-voice:mutate | screen.voice.state.loading.recovery | fixture.tails.voice.loading |
| voice | populated/default | yes | screen.voice.state.populated-default.body | complete-voice | complete-voice:mutate | screen.voice.state.populated-default.recovery | fixture.tails.voice.default |
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | complete-voice | complete-voice:mutate | screen.voice.state.error.recovery | fixture.tails.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | complete-voice | complete-voice:mutate | screen.voice.state.offline.recovery | fixture.tails.voice.offline |
| voice | permission-needed | yes | screen.voice.state.permission-needed.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-needed.recovery | fixture.tails.voice.permission-needed |
| voice | permission-denied | yes | screen.voice.state.permission-denied.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-denied.recovery | fixture.tails.voice.denied |
| voice | permission-restricted | yes | screen.voice.state.permission-restricted.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-restricted.recovery | fixture.tails.voice.permission-restricted |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| profile | loading | yes | screen.profile.state.loading.body | open-settings | open-settings:navigate→settings | screen.profile.state.loading.recovery | fixture.tails.profile.loading |
| profile | populated/default | yes | screen.profile.state.populated-default.body | open-settings | open-settings:navigate→settings | screen.profile.state.populated-default.recovery | fixture.tails.profile.default |
| profile | empty | yes | screen.profile.state.empty.body | open-settings | open-settings:navigate→settings | screen.profile.state.empty.recovery | fixture.tails.profile.empty |
| profile | error | yes | screen.profile.state.error.body | open-settings | open-settings:navigate→settings | screen.profile.state.error.recovery | fixture.tails.profile.error |
| profile | offline | yes | screen.profile.state.offline.body | open-settings | open-settings:navigate→settings | screen.profile.state.offline.recovery | fixture.tails.profile.offline |
| profile | permission-needed | yes | screen.profile.state.permission-needed.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-needed.recovery | fixture.tails.profile.permission-needed |
| profile | permission-denied | yes | screen.profile.state.permission-denied.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-denied.recovery | fixture.tails.profile.permission-denied |
| profile | permission-restricted | yes | screen.profile.state.permission-restricted.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-restricted.recovery | fixture.tails.profile.permission-restricted |
| profile | permission-limited | yes | screen.profile.state.permission-limited.body | open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-settings:navigate→settings | screen.profile.state.permission-limited.recovery | fixture.tails.profile.permission-limited |
| settings | loading | yes | screen.settings.state.loading.body | open-widget | open-widget:navigate→widget | screen.settings.state.loading.recovery | fixture.tails.settings.loading |
| settings | populated/default | yes | screen.settings.state.populated-default.body | open-widget | open-widget:navigate→widget | screen.settings.state.populated-default.recovery | fixture.tails.settings.default |
| settings | empty | yes | screen.settings.state.empty.body | open-widget | open-widget:navigate→widget | screen.settings.state.empty.recovery | fixture.tails.settings.empty |
| settings | error | yes | screen.settings.state.error.body | open-widget | open-widget:navigate→widget | screen.settings.state.error.recovery | fixture.tails.settings.error |
| settings | offline | yes | screen.settings.state.offline.body | open-widget | open-widget:navigate→widget | screen.settings.state.offline.recovery | fixture.tails.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | open-widget<br>permission.push.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | open-widget:navigate→widget | screen.settings.state.permission-needed.recovery | fixture.tails.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | open-widget<br>permission.push.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | open-widget:navigate→widget | screen.settings.state.permission-denied.recovery | fixture.tails.settings.permission-denied |
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | open-widget<br>permission.push.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | open-widget:navigate→widget | screen.settings.state.permission-restricted.recovery | fixture.tails.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | yes | screen.widget.state.loading.body | complete-widget | complete-widget:mutate | screen.widget.state.loading.recovery | fixture.tails.widget.loading |
| widget | populated/default | yes | screen.widget.state.populated-default.body | complete-widget | complete-widget:mutate | screen.widget.state.populated-default.recovery | fixture.tails.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | yes | screen.widget.state.error.body | complete-widget | complete-widget:mutate | screen.widget.state.error.recovery | fixture.tails.widget.error |
| widget | offline | yes | screen.widget.state.offline.body | complete-widget | complete-widget:mutate | screen.widget.state.offline.recovery | fixture.tails.widget.offline |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-needed.recovery | fixture.tails.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-denied.recovery | fixture.tails.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | complete-widget<br>permission.appgroups.fallback<br>permission.keychain.fallback | complete-widget:mutate | screen.widget.state.permission-restricted.recovery | fixture.tails.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | yes | screen.fill.state.loading.body | complete-fill | complete-fill:mutate | screen.fill.state.loading.recovery | fixture.tails.fill.loading |
| fill | populated/default | yes | screen.fill.state.populated-default.body | complete-fill | complete-fill:mutate | screen.fill.state.populated-default.recovery | fixture.tails.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | yes | screen.fill.state.error.body | complete-fill | complete-fill:mutate | screen.fill.state.error.recovery | fixture.tails.fill.error |
| fill | offline | yes | screen.fill.state.offline.body | complete-fill | complete-fill:mutate | screen.fill.state.offline.recovery | fixture.tails.fill.offline |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-needed.recovery | fixture.tails.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-denied.recovery | fixture.tails.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-restricted.recovery | fixture.tails.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| refresh | loading | yes | screen.refresh.state.loading.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.loading.recovery | fixture.tails.refresh.loading |
| refresh | populated/default | yes | screen.refresh.state.populated-default.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.populated-default.recovery | fixture.tails.refresh.default |
| refresh | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| refresh | error | yes | screen.refresh.state.error.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.error.recovery | fixture.tails.refresh.error |
| refresh | offline | yes | screen.refresh.state.offline.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.offline.recovery | fixture.tails.refresh.offline |
| refresh | permission-needed | yes | screen.refresh.state.permission-needed.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-needed.recovery | fixture.tails.refresh.permission-needed |
| refresh | permission-denied | yes | screen.refresh.state.permission-denied.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-denied.recovery | fixture.tails.refresh.permission-denied |
| refresh | permission-restricted | yes | screen.refresh.state.permission-restricted.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-restricted.recovery | fixture.tails.refresh.permission-restricted |
| refresh | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| mates | loading | yes | screen.mates.state.loading.body | complete-mates | complete-mates:mutate | screen.mates.state.loading.recovery | fixture.tails.mates.loading |
| mates | populated/default | yes | screen.mates.state.populated-default.body | complete-mates | complete-mates:mutate | screen.mates.state.populated-default.recovery | fixture.tails.mates.default |
| mates | empty | yes | screen.mates.state.empty.body | complete-mates | complete-mates:mutate | screen.mates.state.empty.recovery | fixture.tails.mates.empty |
| mates | error | yes | screen.mates.state.error.body | complete-mates | complete-mates:mutate | screen.mates.state.error.recovery | fixture.tails.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | complete-mates | complete-mates:mutate | screen.mates.state.offline.recovery | fixture.tails.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-needed.recovery | fixture.tails.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-denied.recovery | fixture.tails.mates.denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-restricted.recovery | fixture.tails.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-limited.recovery | fixture.tails.mates.permission-limited |
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.tails.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.tails.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.tails.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.tails.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.tails.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.tails.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.tails.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.tails.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.tails.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.tails.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.tails.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.tails.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.tails.lock.denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.tails.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| vetnote | loading | yes | screen.vetnote.state.loading.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.loading.recovery | fixture.tails.vetnote.loading |
| vetnote | populated/default | yes | screen.vetnote.state.populated-default.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.populated-default.recovery | fixture.tails.vetnote.default<br>fixture.tails.vetnote.success |
| vetnote | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| vetnote | error | yes | screen.vetnote.state.error.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.error.recovery | fixture.tails.vetnote.error |
| vetnote | offline | yes | screen.vetnote.state.offline.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.offline.recovery | fixture.tails.vetnote.offline |
| vetnote | permission-needed | yes | screen.vetnote.state.permission-needed.body | complete-vetnote<br>permission.speech.fallback | complete-vetnote:mutate | screen.vetnote.state.permission-needed.recovery | fixture.tails.vetnote.permission-needed |
| vetnote | permission-denied | yes | screen.vetnote.state.permission-denied.body | complete-vetnote<br>permission.speech.fallback | complete-vetnote:mutate | screen.vetnote.state.permission-denied.recovery | fixture.tails.vetnote.permission-denied |
| vetnote | permission-restricted | yes | screen.vetnote.state.permission-restricted.body | complete-vetnote<br>permission.speech.fallback | complete-vetnote:mutate | screen.vetnote.state.permission-restricted.recovery | fixture.tails.vetnote.permission-restricted |
| vetnote | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| course | loading | yes | screen.course.state.loading.body | open-background | open-background:navigate→background | screen.course.state.loading.recovery | fixture.tails.course.loading |
| course | populated/default | yes | screen.course.state.populated-default.body | open-background | open-background:navigate→background | screen.course.state.populated-default.recovery | fixture.tails.course.default |
| course | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| course | error | yes | screen.course.state.error.body | open-background | open-background:navigate→background | screen.course.state.error.recovery | fixture.tails.course.error |
| course | offline | yes | screen.course.state.offline.body | open-background | open-background:navigate→background | screen.course.state.offline.recovery | fixture.tails.course.offline |
| course | permission-needed | yes | screen.course.state.permission-needed.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.course.state.permission-needed.recovery | fixture.tails.course.permission-needed |
| course | permission-denied | yes | screen.course.state.permission-denied.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.course.state.permission-denied.recovery | fixture.tails.course.permission-denied |
| course | permission-restricted | yes | screen.course.state.permission-restricted.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.course.state.permission-restricted.recovery | fixture.tails.course.permission-restricted |
| course | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | complete-background | complete-background:mutate | screen.background.state.loading.recovery | fixture.tails.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | complete-background | complete-background:mutate | screen.background.state.populated-default.recovery | fixture.tails.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | complete-background | complete-background:mutate | screen.background.state.error.recovery | fixture.tails.background.error |
| background | offline | yes | screen.background.state.offline.body | complete-background | complete-background:mutate | screen.background.state.offline.recovery | fixture.tails.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-needed.recovery | fixture.tails.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-denied.recovery | fixture.tails.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-restricted.recovery | fixture.tails.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.tails.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.tails.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.tails.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.tails.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.tails.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.tails.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.tails.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| vaccine | loading | yes | screen.vaccine.state.loading.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.loading.recovery | fixture.tails.vaccine.loading |
| vaccine | populated/default | yes | screen.vaccine.state.populated-default.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.populated-default.recovery | fixture.tails.vaccine.default |
| vaccine | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| vaccine | error | yes | screen.vaccine.state.error.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.error.recovery | fixture.tails.vaccine.error |
| vaccine | offline | yes | screen.vaccine.state.offline.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.offline.recovery | fixture.tails.vaccine.offline |
| vaccine | permission-needed | yes | screen.vaccine.state.permission-needed.body | complete-vaccine<br>permission.calendar.fallback | complete-vaccine:mutate | screen.vaccine.state.permission-needed.recovery | fixture.tails.vaccine.permission-needed |
| vaccine | permission-denied | yes | screen.vaccine.state.permission-denied.body | complete-vaccine<br>permission.calendar.fallback | complete-vaccine:mutate | screen.vaccine.state.permission-denied.recovery | fixture.tails.vaccine.permission-denied |
| vaccine | permission-restricted | yes | screen.vaccine.state.permission-restricted.body | complete-vaccine<br>permission.calendar.fallback | complete-vaccine:mutate | screen.vaccine.state.permission-restricted.recovery | fixture.tails.vaccine.permission-restricted |
| vaccine | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.loading.recovery | fixture.tails.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.populated-default.recovery | fixture.tails.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.error.recovery | fixture.tails.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.offline.recovery | fixture.tails.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-needed.recovery | fixture.tails.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-denied.recovery | fixture.tails.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-restricted.recovery | fixture.tails.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shareext | loading | yes | screen.shareext.state.loading.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.loading.recovery | fixture.tails.shareext.loading |
| shareext | populated/default | yes | screen.shareext.state.populated-default.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.populated-default.recovery | fixture.tails.shareext.default<br>fixture.tails.shareext.success |
| shareext | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shareext | error | yes | screen.shareext.state.error.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.error.recovery | fixture.tails.shareext.error |
| shareext | offline | yes | screen.shareext.state.offline.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.offline.recovery | fixture.tails.shareext.offline |
| shareext | permission-needed | yes | screen.shareext.state.permission-needed.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-needed.recovery | fixture.tails.shareext.permission-needed |
| shareext | permission-denied | yes | screen.shareext.state.permission-denied.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-denied.recovery | fixture.tails.shareext.permission-denied |
| shareext | permission-restricted | yes | screen.shareext.state.permission-restricted.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-restricted.recovery | fixture.tails.shareext.permission-restricted |
| shareext | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |

## Design tokens and semantic component roles

**SwiftUI environment:** `NativeVisualLanguage`. SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.

| Token | Value |
|---|---|
| accent | #0077FF |
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
| pet | summary<br>content<br>next-action |
| nearby | collection<br>filters |
| walk | summary<br>content<br>next-action |
| create | task-intro<br>form<br>primary-action |
| camera | summary<br>content<br>next-action |
| media | summary<br>content<br>next-action |
| places | summary<br>content<br>next-action |
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
| vetnote | task-intro<br>form<br>primary-action |
| course | summary<br>content<br>next-action |
| background | summary<br>content<br>next-action |
| call | chat<br>message-list<br>composer |
| vaccine | summary<br>content<br>next-action |
| netqr | summary<br>content<br>next-action |
| shareext | summary<br>content<br>next-action |

## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.chats.label | Сообщения | none | Root tab label | chats | navigation |
| navigation.tab.create.label | Создать | none | Root tab label | create | navigation |
| navigation.tab.home.label | Главная | none | Root tab label | home | navigation |
| navigation.tab.nearby.label | Рядом | none | Root tab label | nearby | navigation |
| navigation.tab.profile.label | Профиль | none | Root tab label | profile | navigation |
| permission.appgroups.body | Виджет показывает следующую прогулку. | none | System permission explanation | settings<br>widget | permission |
| permission.appgroups.fallback | Прогулка остаётся внутри приложения | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | settings<br>widget | permission |
| permission.audio.body | Занятие продолжит звучать, когда экран погаснет. | none | System permission explanation | course<br>background | permission |
| permission.audio.fallback | Без entitlement звук обрывается — не ship | none | Denied fallback | background | recovery |
| permission.audio.title | Фоновое аудио | none | System permission pre-prompt title | course<br>background | permission |
| permission.autofill.body | Системное автозаполнение подставит сохранённый аккаунт на сайте. | none | System permission explanation | settings<br>fill | permission |
| permission.autofill.fallback | Вход вручную почтой и паролем | none | Denied fallback | fill | recovery |
| permission.autofill.title | Вход на tails.social | none | System permission pre-prompt title | settings<br>fill | permission |
| permission.bgtask.body | app.tails.refresh зарегистрирована для обновления ленты. | none | System permission explanation | refresh<br>home | permission |
| permission.bgtask.fallback | Без задачи обновление только вручную | none | Denied fallback | home | recovery |
| permission.bgtask.title | Фоновая задача | none | System permission pre-prompt title | refresh<br>home | permission |
| permission.calendar.body | Чтобы прививка попала в календарь и сдвинулась, если приём перенесут. | none | System permission explanation | vaccine | permission |
| permission.calendar.fallback | Срок остаётся в карточке питомца и в напоминании приложения | none | Denied fallback | vaccine | recovery |
| permission.calendar.title | «Хвосты» запрашивают доступ к календарю | none | System permission pre-prompt title | vaccine | permission |
| permission.camera.body | Чтобы снять момент питомца или карточку пропавшего. | none | System permission explanation | create<br>camera | permission |
| permission.camera.fallback | Можно выбрать готовый снимок | none | Denied fallback | camera | recovery |
| permission.camera.title | «Хвосты» запрашивают доступ к камере | none | System permission pre-prompt title | create<br>camera | permission |
| permission.commnotif.body | Сообщение приходит с аватаром питомца и учитывает Focus. | none | System permission explanation | chat | permission |
| permission.commnotif.fallback | Обычное уведомление без аватара | none | Denied fallback | chat | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat | permission |
| permission.contacts.body | Чтобы показать, кто из ваших контактов уже гуляет по соседству. | none | System permission explanation | profile<br>mates | permission |
| permission.contacts.fallback | Остаётся поиск по кличке и ссылка-приглашение | none | Denied fallback | mates | recovery |
| permission.contacts.title | «Хвосты» запрашивают доступ к контактам | none | System permission pre-prompt title | profile<br>mates | permission |
| permission.faceid.body | Чтобы ветпаспорт и адрес выгула открывались только вам. | none | System permission explanation | settings<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Хвосты» запрашивают доступ к Face ID | none | System permission pre-prompt title | settings<br>lock | permission |
| permission.fetch.body | Лента друзей готова к первому открытию. | none | System permission explanation | settings | permission |
| permission.fetch.fallback | Лента обновится после открытия | none | Denied fallback | settings | recovery |
| permission.fetch.title | Фоновое обновление | none | System permission pre-prompt title | settings | permission |
| permission.hotspot.body | «Хвосты» подключат телефон к гостевой сети площадки. | none | System permission explanation | netqr | permission |
| permission.hotspot.fallback | Сеть выбирается вручную в Настройках | none | Denied fallback | netqr | recovery |
| permission.hotspot.title | Подключение к сети | none | System permission pre-prompt title | netqr | permission |
| permission.keychain.body | Приложение и расширения используют один защищённый вход. | none | System permission explanation | widget<br>home | permission |
| permission.keychain.fallback | Виджет открывает приложение для входа | none | Denied fallback | home | recovery |
| permission.keychain.title | Общая сессия | none | System permission pre-prompt title | widget<br>home | permission |
| permission.location.body | Чтобы показать прогулки в пешей доступности. | none | System permission explanation | home<br>nearby | permission |
| permission.location.fallback | Район выбирается вручную | none | Denied fallback | nearby | recovery |
| permission.location.title | «Хвосты» запрашивают геопозицию | none | System permission pre-prompt title | home<br>nearby | permission |
| permission.mic.body | Чтобы записать голосовое владельцу питомца. | none | System permission explanation | chat<br>voice | permission |
| permission.mic.fallback | Остаются текст и фото | none | Denied fallback | voice | recovery |
| permission.mic.title | «Хвосты» запрашивают доступ к микрофону | none | System permission pre-prompt title | chat<br>voice | permission |
| permission.photos.body | Чтобы выбрать моменты питомца для публикации. | none | System permission explanation | create<br>media | permission |
| permission.photos.fallback | Можно снять новый кадр камерой | none | Denied fallback | media | recovery |
| permission.photos.title | «Хвосты» запрашивают доступ к фото | none | System permission pre-prompt title | create<br>media | permission |
| permission.push.body | Сообщим об ответах и прогулках, на которые вы записались. | none | System permission explanation | settings | permission |
| permission.push.fallback | Обновления помечаются точкой внутри приложения | none | Denied fallback | settings | recovery |
| permission.push.title | Разрешить уведомления от «Хвостов»? | none | System permission pre-prompt title | settings | permission |
| permission.remotenotif.body | Список прогулки обновится до открытия приложения. | none | System permission explanation | walk | permission |
| permission.remotenotif.fallback | Состав обновляется при открытии | none | Denied fallback | walk | recovery |
| permission.remotenotif.title | Тихое обновление | none | System permission pre-prompt title | walk | permission |
| permission.shareext.body | Отдельный target: «Хвосты» появятся в системном меню «Поделиться». | none | System permission explanation | settings<br>shareext | permission |
| permission.shareext.fallback | Остаётся создание записи внутри приложения | none | Denied fallback | shareext | recovery |
| permission.shareext.title | Расширение «Поделиться» | none | System permission pre-prompt title | settings<br>shareext | permission |
| permission.speech.body | Чтобы надиктованная заметка о самочувствии стала текстом в карточке питомца. | none | System permission explanation | pet<br>vetnote | permission |
| permission.speech.fallback | Заметка остаётся звуком: её можно слушать, но не искать словом | none | Denied fallback | vetnote | recovery |
| permission.speech.title | «Хвосты» запрашивают доступ к распознаванию речи | none | System permission pre-prompt title | pet<br>vetnote | permission |
| permission.tracking.body | Так объявления кормов и ветклиник будут к месту, а приложение останется бесплатным. | none | System permission explanation | ads<br>profile | permission |
| permission.tracking.fallback | Реклама остаётся, но перестаёт быть персональной | none | Denied fallback | profile | recovery |
| permission.tracking.title | Разрешить отслеживание? | none | System permission pre-prompt title | ads<br>profile | permission |
| permission.voip.body | Входящий звонок догситтера поднимется обычным экраном вызова. | none | System permission explanation | chat<br>call | permission |
| permission.voip.fallback | Остаётся переписка в чате | none | Denied fallback | call | recovery |
| permission.voip.title | Звонки в приложении | none | System permission pre-prompt title | chat<br>call | permission |
| permission.wifiinfo.body | Имя Wi‑Fi помогает подтвердить, что группа собралась в выбранном дог-парке. | none | System permission explanation | walk | permission |
| permission.wifiinfo.fallback | Отметка по кнопке без автоматической проверки | none | Denied fallback | walk | recovery |
| permission.wifiinfo.title | Сеть площадки | none | System permission pre-prompt title | walk | permission |
| scenario.all.failure.name | Весь продукт: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>pet<br>nearby<br>walk<br>create | acceptance |
| scenario.all.happy.name | Весь продукт: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>pet<br>nearby<br>walk<br>create | acceptance |
| scenario.all.offline.name | Весь продукт: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>pet<br>nearby<br>walk<br>create | acceptance |
| scenario.all.persistence.name | Весь продукт: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>pet<br>nearby<br>walk<br>create | acceptance |
| scenario.permission.appgroups.denied.name | Виджет ближайшей прогулки: отказ и запасной путь | none | Acceptance scenario name | settings<br>widget | acceptance |
| scenario.permission.audio.denied.name | Курс послушания слушают на прогулке: руки заняты поводком, на локскрине — Now Playing и ±15 секунд: отказ и запасной путь | none | Acceptance scenario name | course<br>background | acceptance |
| scenario.permission.autofill.denied.name | Вход на сайт сохранённой связкой: отказ и запасной путь | none | Acceptance scenario name | settings<br>fill | acceptance |
| scenario.permission.bgtask.denied.name | Зарегистрированная задача обновления: отказ и запасной путь | none | Acceptance scenario name | refresh<br>home | acceptance |
| scenario.permission.calendar.denied.name | Прививки и обработка от клещей в системном календаре, с правкой при переносе и удалением при отмене: отказ и запасной путь | none | Acceptance scenario name | vaccine | acceptance |
| scenario.permission.camera.denied.name | Снять публикацию питомца: отказ и запасной путь | none | Acceptance scenario name | create<br>camera | acceptance |
| scenario.permission.commnotif.denied.name | Чаты с аватарами в уведомлениях: отказ и запасной путь | none | Acceptance scenario name | chat | acceptance |
| scenario.permission.contacts.denied.name | Кто из ваших контактов уже гуляет рядом: отказ и запасной путь | none | Acceptance scenario name | profile<br>mates | acceptance |
| scenario.permission.faceid.denied.name | Замок на ветпаспорте: диагнозы, номер чипа и адрес выгула: отказ и запасной путь | none | Acceptance scenario name | settings<br>lock | acceptance |
| scenario.permission.fetch.denied.name | Свежая лента к запуску: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.hotspot.denied.name | Гостевая сеть дог-парка по QR — без неё отметка на площадке не проходит: отказ и запасной путь | none | Acceptance scenario name | netqr | acceptance |
| scenario.permission.keychain.denied.name | Один вход для приложения и виджета: отказ и запасной путь | none | Acceptance scenario name | widget<br>home | acceptance |
| scenario.permission.location.denied.name | Прогулки рядом: отказ и запасной путь | none | Acceptance scenario name | home<br>nearby | acceptance |
| scenario.permission.mic.denied.name | Голосовые в личном чате: отказ и запасной путь | none | Acceptance scenario name | chat<br>voice | acceptance |
| scenario.permission.photos.denied.name | Публикация из медиатеки: отказ и запасной путь | none | Acceptance scenario name | create<br>media | acceptance |
| scenario.permission.push.denied.name | Ответы и изменения прогулки: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.remotenotif.denied.name | Актуальный состав прогулки: отказ и запасной путь | none | Acceptance scenario name | walk | acceptance |
| scenario.permission.shareext.denied.name | Поделиться в «Хвосты» из Safari и «Фото» — объявление о найденной собаке падает в черновик: отказ и запасной путь | none | Acceptance scenario name | settings<br>shareext | acceptance |
| scenario.permission.speech.denied.name | Заметка о самочувствии голосом: текст ложится в карточку питомца и ищется словом: отказ и запасной путь | none | Acceptance scenario name | pet<br>vetnote | acceptance |
| scenario.permission.tracking.denied.name | Реклама зоомагазинов, кормов и ветклиник вместо платной подписки: отказ и запасной путь | none | Acceptance scenario name | ads<br>profile | acceptance |
| scenario.permission.voip.denied.name | Созвон с догситтером и передержкой без обмена номерами: отказ и запасной путь | none | Acceptance scenario name | chat<br>call | acceptance |
| scenario.permission.wifiinfo.denied.name | Отметка «я на месте» в партнёрском дог-парке: отказ и запасной путь | none | Acceptance scenario name | walk | acceptance |
| scenario.publish.failure.name | Опубликовать момент: ошибка и восстановление | none | Acceptance scenario name | create<br>home<br>nearby<br>chats<br>profile<br>camera<br>media<br>shareext | acceptance |
| scenario.publish.happy.name | Опубликовать момент: основной путь | none | Acceptance scenario name | create<br>home<br>nearby<br>chats<br>profile<br>camera<br>media<br>shareext | acceptance |
| scenario.publish.offline.name | Опубликовать момент: без сети | none | Acceptance scenario name | create<br>home<br>nearby<br>chats<br>profile<br>camera<br>media<br>shareext | acceptance |
| scenario.publish.persistence.name | Опубликовать момент: возврат после перезапуска | none | Acceptance scenario name | create<br>home<br>nearby<br>chats<br>profile<br>camera<br>media<br>shareext | acceptance |
| scenario.walk.failure.name | Найти прогулку: ошибка и восстановление | none | Acceptance scenario name | walk<br>netqr<br>nearby<br>background<br>home | acceptance |
| scenario.walk.happy.name | Найти прогулку: основной путь | none | Acceptance scenario name | walk<br>netqr<br>nearby<br>background<br>home | acceptance |
| scenario.walk.offline.name | Найти прогулку: без сети | none | Acceptance scenario name | walk<br>netqr<br>nearby<br>background<br>home | acceptance |
| scenario.walk.persistence.name | Найти прогулку: возврат после перезапуска | none | Acceptance scenario name | walk<br>netqr<br>nearby<br>background<br>home | acceptance |
| screen.ads.action.complete-ads.label | Продолжить | none | Action label | ads | control |
| screen.ads.purpose | Объяснить обмен до системного запроса ATT | none | Product task | ads | accessibility-and-docs |
| screen.ads.state.error.body | Не удалось обновить «Реклама вместо подписки». Введённые данные сохранены; повторите попытку. | none | State copy: error | ads | state-body |
| screen.ads.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ads | recovery |
| screen.ads.state.loading.body | Обновляем данные раздела «Реклама вместо подписки»; текущий контекст остаётся доступен. | none | State copy: loading | ads | state-body |
| screen.ads.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | ads | recovery |
| screen.ads.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | ads | state-body |
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
| screen.background.action.complete-background.label | Продолжить | none | Action label | background | control |
| screen.background.purpose | Показать, что занятие продолжается при погашенном экране | none | Product task | background | accessibility-and-docs |
| screen.background.state.error.body | Не удалось обновить «Экран погас». Введённые данные сохранены; повторите попытку. | none | State copy: error | background | state-body |
| screen.background.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | background | recovery |
| screen.background.state.loading.body | Обновляем данные раздела «Экран погас»; текущий контекст остаётся доступен. | none | State copy: loading | background | state-body |
| screen.background.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | background | recovery |
| screen.background.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | background | state-body |
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
| screen.call.action.complete-call.label | Продолжить | none | Action label | call | control |
| screen.call.purpose | Договориться о передержке, не раскрывая номер | none | Product task | call | accessibility-and-docs |
| screen.call.state.error.body | Не удалось обновить «Звонок догситтеру». Введённые данные сохранены; повторите попытку. | none | State copy: error | call | state-body |
| screen.call.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | call | recovery |
| screen.call.state.loading.body | Обновляем данные раздела «Звонок догситтеру»; текущий контекст остаётся доступен. | none | State copy: loading | call | state-body |
| screen.call.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | call | recovery |
| screen.call.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | call | state-body |
| screen.call.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | call | recovery |
| screen.call.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | call | state-body |
| screen.call.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | call | recovery |
| screen.call.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | call | state-body |
| screen.call.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | call | recovery |
| screen.call.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | call | state-body |
| screen.call.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | call | recovery |
| screen.call.state.populated-default.body | Актуальные данные раздела «Звонок догситтеру» готовы к следующему действию. | none | State copy: populated/default | call | state-body |
| screen.call.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | call | recovery |
| screen.call.title | Звонок догситтеру | none | Surface title | call | navigation-title |
| screen.camera.action.complete-camera.label | Продолжить | none | Action label | camera | control |
| screen.camera.purpose | Снять момент | none | Product task | camera | accessibility-and-docs |
| screen.camera.state.error.body | Не удалось обновить «Камера». Введённые данные сохранены; повторите попытку. | none | State copy: error | camera | state-body |
| screen.camera.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | camera | recovery |
| screen.camera.state.loading.body | Обновляем данные раздела «Камера»; текущий контекст остаётся доступен. | none | State copy: loading | camera | state-body |
| screen.camera.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | camera | recovery |
| screen.camera.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | camera | state-body |
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
| screen.chat.action.open-voice.label | Открыть «Голосовое» | none | Action label | chat | control |
| screen.chat.purpose | Договориться | none | Product task | chat | accessibility-and-docs |
| screen.chat.state.error.body | Не удалось обновить «Чат». Введённые данные сохранены; повторите попытку. | none | State copy: error | chat | state-body |
| screen.chat.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chat | recovery |
| screen.chat.state.loading.body | Обновляем данные раздела «Чат»; текущий контекст остаётся доступен. | none | State copy: loading | chat | state-body |
| screen.chat.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chat | recovery |
| screen.chat.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | chat | state-body |
| screen.chat.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chat | recovery |
| screen.chat.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chat | state-body |
| screen.chat.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chat | recovery |
| screen.chat.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chat | state-body |
| screen.chat.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chat | recovery |
| screen.chat.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chat | state-body |
| screen.chat.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chat | recovery |
| screen.chat.state.populated-default.body | Актуальные данные раздела «Чат» готовы к следующему действию. | none | State copy: populated/default | chat | state-body |
| screen.chat.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chat | recovery |
| screen.chat.title | Чат | none | Surface title | chat | navigation-title |
| screen.chats.action.open-chat.label | Открыть «Чат» | none | Action label | chats | control |
| screen.chats.purpose | Вернуться к диалогам | none | Product task | chats | accessibility-and-docs |
| screen.chats.state.empty.body | В разделе «Сообщения» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | chats | state-body |
| screen.chats.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | chats | recovery |
| screen.chats.state.error.body | Не удалось обновить «Сообщения». Введённые данные сохранены; повторите попытку. | none | State copy: error | chats | state-body |
| screen.chats.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chats | recovery |
| screen.chats.state.loading.body | Обновляем данные раздела «Сообщения»; текущий контекст остаётся доступен. | none | State copy: loading | chats | state-body |
| screen.chats.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chats | recovery |
| screen.chats.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | chats | state-body |
| screen.chats.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chats | recovery |
| screen.chats.state.populated-default.body | Актуальные данные раздела «Сообщения» готовы к следующему действию. | none | State copy: populated/default | chats | state-body |
| screen.chats.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chats | recovery |
| screen.chats.title | Сообщения | none | Surface title | chats | navigation-title |
| screen.code.action.open-codefail.label | Войти | none | Action label | code | control |
| screen.code.purpose | Подтвердить вход | none | Product task | code | accessibility-and-docs |
| screen.code.state.error.body | Не удалось обновить «Код из письма». Введённые данные сохранены; повторите попытку. | none | State copy: error | code | state-body |
| screen.code.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | code | recovery |
| screen.code.state.loading.body | Обновляем данные раздела «Код из письма»; текущий контекст остаётся доступен. | none | State copy: loading | code | state-body |
| screen.code.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | code | recovery |
| screen.code.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | code | state-body |
| screen.code.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | code | recovery |
| screen.code.state.populated-default.body | Актуальные данные раздела «Код из письма» готовы к следующему действию. | none | State copy: populated/default | code | state-body |
| screen.code.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | code | recovery |
| screen.code.title | Код из письма | none | Surface title | code | navigation-title |
| screen.codefail.action.complete-codefail.label | Войти | none | Action label | codefail | control |
| screen.codefail.purpose | Показать ошибку OTP и вернуть к вводу | none | Product task | codefail | accessibility-and-docs |
| screen.codefail.state.error.body | Не удалось обновить «Неверный код». Введённые данные сохранены; повторите попытку. | none | State copy: error | codefail | state-body |
| screen.codefail.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | codefail | recovery |
| screen.codefail.state.loading.body | Обновляем данные раздела «Неверный код»; текущий контекст остаётся доступен. | none | State copy: loading | codefail | state-body |
| screen.codefail.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | codefail | recovery |
| screen.codefail.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | codefail | state-body |
| screen.codefail.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | codefail | recovery |
| screen.codefail.state.populated-default.body | Актуальные данные раздела «Неверный код» готовы к следующему действию. | none | State copy: populated/default | codefail | state-body |
| screen.codefail.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | codefail | recovery |
| screen.codefail.title | Неверный код | none | Surface title | codefail | navigation-title |
| screen.course.action.open-background.label | Слушать | none | Action label | course | control |
| screen.course.purpose | Слушать занятие и продолжать при погашенном экране | none | Product task | course | accessibility-and-docs |
| screen.course.state.error.body | Не удалось обновить «Курс послушания». Введённые данные сохранены; повторите попытку. | none | State copy: error | course | state-body |
| screen.course.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | course | recovery |
| screen.course.state.loading.body | Обновляем данные раздела «Курс послушания»; текущий контекст остаётся доступен. | none | State copy: loading | course | state-body |
| screen.course.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | course | recovery |
| screen.course.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | course | state-body |
| screen.course.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | course | recovery |
| screen.course.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | course | state-body |
| screen.course.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | course | recovery |
| screen.course.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | course | state-body |
| screen.course.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | course | recovery |
| screen.course.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | course | state-body |
| screen.course.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | course | recovery |
| screen.course.state.populated-default.body | Актуальные данные раздела «Курс послушания» готовы к следующему действию. | none | State copy: populated/default | course | state-body |
| screen.course.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | course | recovery |
| screen.course.title | Курс послушания | none | Surface title | course | navigation-title |
| screen.create.action.open-camera.label | Снять | none | Action label | create | control |
| screen.create.purpose | Опубликовать момент | none | Product task | create | accessibility-and-docs |
| screen.create.state.error.body | Не удалось обновить «Новый момент». Введённые данные сохранены; повторите попытку. | none | State copy: error | create | state-body |
| screen.create.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | create | recovery |
| screen.create.state.loading.body | Обновляем данные раздела «Новый момент»; текущий контекст остаётся доступен. | none | State copy: loading | create | state-body |
| screen.create.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | create | recovery |
| screen.create.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | create | state-body |
| screen.create.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | create | recovery |
| screen.create.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | create | state-body |
| screen.create.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | create | recovery |
| screen.create.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | create | state-body |
| screen.create.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | create | recovery |
| screen.create.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | create | state-body |
| screen.create.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | create | recovery |
| screen.create.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | create | state-body |
| screen.create.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | create | recovery |
| screen.create.state.populated-default.body | Актуальные данные раздела «Новый момент» готовы к следующему действию. | none | State copy: populated/default | create | state-body |
| screen.create.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | create | recovery |
| screen.create.title | Новый момент | none | Surface title | create | navigation-title |
| screen.fill.action.complete-fill.label | Войти | none | Action label | fill | control |
| screen.fill.purpose | Войти на сайт сохранённым в «Хвостах» входом | none | Product task | fill | accessibility-and-docs |
| screen.fill.state.error.body | Не удалось обновить «Автозаполнение на сайте». Введённые данные сохранены; повторите попытку. | none | State copy: error | fill | state-body |
| screen.fill.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | fill | recovery |
| screen.fill.state.loading.body | Обновляем данные раздела «Автозаполнение на сайте»; текущий контекст остаётся доступен. | none | State copy: loading | fill | state-body |
| screen.fill.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | fill | recovery |
| screen.fill.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | fill | state-body |
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
| screen.home.action.open-pet.label | Открыть «Профиль питомца» | none | Action label | home | control |
| screen.home.purpose | Смотреть друзей | none | Product task | home | accessibility-and-docs |
| screen.home.state.empty.body | В разделе «Главная» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | home | state-body |
| screen.home.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | home | recovery |
| screen.home.state.error.body | Не удалось обновить «Главная». Введённые данные сохранены; повторите попытку. | none | State copy: error | home | state-body |
| screen.home.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | home | recovery |
| screen.home.state.loading.body | Обновляем данные раздела «Главная»; текущий контекст остаётся доступен. | none | State copy: loading | home | state-body |
| screen.home.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | home | recovery |
| screen.home.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | home | state-body |
| screen.home.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | home | recovery |
| screen.home.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | home | state-body |
| screen.home.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | home | recovery |
| screen.home.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | home | state-body |
| screen.home.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | home | recovery |
| screen.home.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | home | state-body |
| screen.home.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | home | recovery |
| screen.home.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | home | state-body |
| screen.home.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | home | recovery |
| screen.home.state.populated-default.body | Актуальные данные раздела «Главная» готовы к следующему действию. | none | State copy: populated/default | home | state-body |
| screen.home.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | home | recovery |
| screen.home.title | Главная | none | Surface title | home | navigation-title |
| screen.lock.action.complete-lock.label | Замок Face ID | none | Action label | lock | control |
| screen.lock.purpose | Закрыть ветпаспорт и адрес выгула биометрией | none | Product task | lock | accessibility-and-docs |
| screen.lock.state.error.body | Не удалось обновить «Замок на ветпаспорте». Введённые данные сохранены; повторите попытку. | none | State copy: error | lock | state-body |
| screen.lock.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lock | recovery |
| screen.lock.state.loading.body | Обновляем данные раздела «Замок на ветпаспорте»; текущий контекст остаётся доступен. | none | State copy: loading | lock | state-body |
| screen.lock.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lock | recovery |
| screen.lock.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | lock | state-body |
| screen.lock.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lock | recovery |
| screen.lock.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lock | state-body |
| screen.lock.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lock | recovery |
| screen.lock.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lock | state-body |
| screen.lock.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lock | recovery |
| screen.lock.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lock | state-body |
| screen.lock.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lock | recovery |
| screen.lock.state.populated-default.body | Актуальные данные раздела «Замок на ветпаспорте» готовы к следующему действию. | none | State copy: populated/default | lock | state-body |
| screen.lock.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lock | recovery |
| screen.lock.title | Замок на ветпаспорте | none | Surface title | lock | navigation-title |
| screen.mates.action.complete-mates.label | Продолжить | none | Action label | mates | control |
| screen.mates.purpose | Найти знакомых среди тех, кто уже гуляет рядом | none | Product task | mates | accessibility-and-docs |
| screen.mates.state.empty.body | В разделе «Контакты в «Хвостах»» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | mates | state-body |
| screen.mates.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | mates | recovery |
| screen.mates.state.error.body | Не удалось обновить «Контакты в «Хвостах»». Введённые данные сохранены; повторите попытку. | none | State copy: error | mates | state-body |
| screen.mates.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | mates | recovery |
| screen.mates.state.loading.body | Обновляем данные раздела «Контакты в «Хвостах»»; текущий контекст остаётся доступен. | none | State copy: loading | mates | state-body |
| screen.mates.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | mates | recovery |
| screen.mates.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | mates | state-body |
| screen.mates.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | mates | recovery |
| screen.mates.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | mates | state-body |
| screen.mates.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | mates | recovery |
| screen.mates.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | mates | state-body |
| screen.mates.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | mates | recovery |
| screen.mates.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | mates | state-body |
| screen.mates.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | mates | recovery |
| screen.mates.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | mates | state-body |
| screen.mates.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | mates | recovery |
| screen.mates.state.populated-default.body | Актуальные данные раздела «Контакты в «Хвостах»» готовы к следующему действию. | none | State copy: populated/default | mates | state-body |
| screen.mates.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | mates | recovery |
| screen.mates.title | Контакты в «Хвостах» | none | Surface title | mates | navigation-title |
| screen.media.action.complete-media.label | Продолжить | none | Action label | media | control |
| screen.media.purpose | Выбрать фото | none | Product task | media | accessibility-and-docs |
| screen.media.state.error.body | Не удалось обновить «Фото». Введённые данные сохранены; повторите попытку. | none | State copy: error | media | state-body |
| screen.media.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | media | recovery |
| screen.media.state.loading.body | Обновляем данные раздела «Фото»; текущий контекст остаётся доступен. | none | State copy: loading | media | state-body |
| screen.media.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | media | recovery |
| screen.media.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | media | state-body |
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
| screen.nearby.action.open-walk.label | Открыть «Прогулка» | none | Action label | nearby | control |
| screen.nearby.purpose | Найти прогулку | none | Product task | nearby | accessibility-and-docs |
| screen.nearby.state.empty.body | В разделе «Рядом» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | nearby | state-body |
| screen.nearby.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | nearby | recovery |
| screen.nearby.state.error.body | Не удалось обновить «Рядом». Введённые данные сохранены; повторите попытку. | none | State copy: error | nearby | state-body |
| screen.nearby.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | nearby | recovery |
| screen.nearby.state.loading.body | Обновляем данные раздела «Рядом»; текущий контекст остаётся доступен. | none | State copy: loading | nearby | state-body |
| screen.nearby.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | nearby | recovery |
| screen.nearby.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | nearby | state-body |
| screen.nearby.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | nearby | recovery |
| screen.nearby.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | nearby | state-body |
| screen.nearby.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | nearby | recovery |
| screen.nearby.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | nearby | state-body |
| screen.nearby.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | nearby | recovery |
| screen.nearby.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | nearby | state-body |
| screen.nearby.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | nearby | recovery |
| screen.nearby.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | nearby | state-body |
| screen.nearby.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | nearby | recovery |
| screen.nearby.state.populated-default.body | Актуальные данные раздела «Рядом» готовы к следующему действию. | none | State copy: populated/default | nearby | state-body |
| screen.nearby.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | nearby | recovery |
| screen.nearby.title | Рядом | none | Surface title | nearby | navigation-title |
| screen.netqr.action.complete-netqr.label | Подключиться | none | Action label | netqr | control |
| screen.netqr.purpose | Подключиться к гостевой сети дог-парка | none | Product task | netqr | accessibility-and-docs |
| screen.netqr.state.error.body | Не удалось обновить «Сеть площадки по QR». Введённые данные сохранены; повторите попытку. | none | State copy: error | netqr | state-body |
| screen.netqr.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | netqr | recovery |
| screen.netqr.state.loading.body | Обновляем данные раздела «Сеть площадки по QR»; текущий контекст остаётся доступен. | none | State copy: loading | netqr | state-body |
| screen.netqr.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | netqr | recovery |
| screen.netqr.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | netqr | state-body |
| screen.netqr.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | netqr | recovery |
| screen.netqr.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | netqr | state-body |
| screen.netqr.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | netqr | recovery |
| screen.netqr.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | netqr | state-body |
| screen.netqr.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | netqr | recovery |
| screen.netqr.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | netqr | state-body |
| screen.netqr.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | netqr | recovery |
| screen.netqr.state.populated-default.body | Актуальные данные раздела «Сеть площадки по QR» готовы к следующему действию. | none | State copy: populated/default | netqr | state-body |
| screen.netqr.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | netqr | recovery |
| screen.netqr.title | Сеть площадки по QR | none | Surface title | netqr | navigation-title |
| screen.pet.action.open-vetnote.label | Написать | none | Action label | pet | control |
| screen.pet.purpose | Познакомиться | none | Product task | pet | accessibility-and-docs |
| screen.pet.state.error.body | Не удалось обновить «Профиль питомца». Введённые данные сохранены; повторите попытку. | none | State copy: error | pet | state-body |
| screen.pet.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | pet | recovery |
| screen.pet.state.loading.body | Обновляем данные раздела «Профиль питомца»; текущий контекст остаётся доступен. | none | State copy: loading | pet | state-body |
| screen.pet.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | pet | recovery |
| screen.pet.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | pet | state-body |
| screen.pet.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | pet | recovery |
| screen.pet.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | pet | state-body |
| screen.pet.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | pet | recovery |
| screen.pet.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | pet | state-body |
| screen.pet.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | pet | recovery |
| screen.pet.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | pet | state-body |
| screen.pet.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | pet | recovery |
| screen.pet.state.populated-default.body | Актуальные данные раздела «Профиль питомца» готовы к следующему действию. | none | State copy: populated/default | pet | state-body |
| screen.pet.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | pet | recovery |
| screen.pet.title | Профиль питомца | none | Surface title | pet | navigation-title |
| screen.phone.action.open-code.label | Продолжить с почтой | none | Action label | phone | control |
| screen.phone.purpose | Войти | none | Product task | phone | accessibility-and-docs |
| screen.phone.state.error.body | Не удалось обновить «Вход по почте». Введённые данные сохранены; повторите попытку. | none | State copy: error | phone | state-body |
| screen.phone.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | phone | recovery |
| screen.phone.state.loading.body | Обновляем данные раздела «Вход по почте»; текущий контекст остаётся доступен. | none | State copy: loading | phone | state-body |
| screen.phone.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | phone | recovery |
| screen.phone.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | phone | state-body |
| screen.phone.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | phone | recovery |
| screen.phone.state.populated-default.body | Актуальные данные раздела «Вход по почте» готовы к следующему действию. | none | State copy: populated/default | phone | state-body |
| screen.phone.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | phone | recovery |
| screen.phone.title | Вход по почте | none | Surface title | phone | navigation-title |
| screen.places.action.complete-places.label | Лопухинский сад | none | Action label | places | control |
| screen.places.purpose | Выбрать площадку для прогулки | none | Product task | places | accessibility-and-docs |
| screen.places.state.empty.body | В разделе «Площадки рядом» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | places | state-body |
| screen.places.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | places | recovery |
| screen.places.state.error.body | Не удалось обновить «Площадки рядом». Введённые данные сохранены; повторите попытку. | none | State copy: error | places | state-body |
| screen.places.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | places | recovery |
| screen.places.state.loading.body | Обновляем данные раздела «Площадки рядом»; текущий контекст остаётся доступен. | none | State copy: loading | places | state-body |
| screen.places.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | places | recovery |
| screen.places.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | places | state-body |
| screen.places.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | places | recovery |
| screen.places.state.populated-default.body | Актуальные данные раздела «Площадки рядом» готовы к следующему действию. | none | State copy: populated/default | places | state-body |
| screen.places.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | places | recovery |
| screen.places.title | Площадки рядом | none | Surface title | places | navigation-title |
| screen.profile.action.open-settings.label | Редактировать | none | Action label | profile | control |
| screen.profile.purpose | Показать профиль питомца и его прогулки | none | Product task | profile | accessibility-and-docs |
| screen.profile.state.empty.body | В разделе «Профиль» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | profile | state-body |
| screen.profile.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | profile | recovery |
| screen.profile.state.error.body | Не удалось обновить «Профиль». Введённые данные сохранены; повторите попытку. | none | State copy: error | profile | state-body |
| screen.profile.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | profile | recovery |
| screen.profile.state.loading.body | Обновляем данные раздела «Профиль»; текущий контекст остаётся доступен. | none | State copy: loading | profile | state-body |
| screen.profile.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | profile | recovery |
| screen.profile.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | profile | state-body |
| screen.profile.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | profile | recovery |
| screen.profile.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | profile | state-body |
| screen.profile.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | profile | recovery |
| screen.profile.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | profile | state-body |
| screen.profile.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | profile | recovery |
| screen.profile.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | profile | state-body |
| screen.profile.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | profile | recovery |
| screen.profile.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | profile | state-body |
| screen.profile.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | profile | recovery |
| screen.profile.state.populated-default.body | Актуальные данные раздела «Профиль» готовы к следующему действию. | none | State copy: populated/default | profile | state-body |
| screen.profile.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | profile | recovery |
| screen.profile.title | Профиль | none | Surface title | profile | navigation-title |
| screen.refresh.action.complete-refresh.label | Проверить задачу | none | Action label | refresh | control |
| screen.refresh.purpose | Проверить, что фоновое обновление работает | none | Product task | refresh | accessibility-and-docs |
| screen.refresh.state.error.body | Не удалось обновить «Обновление в фоне». Введённые данные сохранены; повторите попытку. | none | State copy: error | refresh | state-body |
| screen.refresh.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | refresh | recovery |
| screen.refresh.state.loading.body | Обновляем данные раздела «Обновление в фоне»; текущий контекст остаётся доступен. | none | State copy: loading | refresh | state-body |
| screen.refresh.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | refresh | recovery |
| screen.refresh.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | refresh | state-body |
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
| screen.settings.action.open-widget.label | Обновлять ленту в фоне | none | Action label | settings | control |
| screen.settings.purpose | Держать доступы и системные функции под рукой | none | Product task | settings | accessibility-and-docs |
| screen.settings.state.empty.body | В разделе «Настройки» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | settings | state-body |
| screen.settings.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | settings | recovery |
| screen.settings.state.error.body | Не удалось обновить «Настройки». Введённые данные сохранены; повторите попытку. | none | State copy: error | settings | state-body |
| screen.settings.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | settings | recovery |
| screen.settings.state.loading.body | Обновляем данные раздела «Настройки»; текущий контекст остаётся доступен. | none | State copy: loading | settings | state-body |
| screen.settings.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | settings | recovery |
| screen.settings.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | settings | state-body |
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
| screen.shareext.action.complete-shareext.label | Сохранить в черновик | none | Action label | shareext | control |
| screen.shareext.purpose | Принять ссылку или кадр из другого приложения в черновик | none | Product task | shareext | accessibility-and-docs |
| screen.shareext.state.error.body | Не удалось обновить «Поделиться в «Хвосты»». Введённые данные сохранены; повторите попытку. | none | State copy: error | shareext | state-body |
| screen.shareext.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | shareext | recovery |
| screen.shareext.state.loading.body | Обновляем данные раздела «Поделиться в «Хвосты»»; текущий контекст остаётся доступен. | none | State copy: loading | shareext | state-body |
| screen.shareext.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | shareext | recovery |
| screen.shareext.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | shareext | state-body |
| screen.shareext.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | shareext | recovery |
| screen.shareext.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | shareext | state-body |
| screen.shareext.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | shareext | recovery |
| screen.shareext.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | shareext | state-body |
| screen.shareext.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | shareext | recovery |
| screen.shareext.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | shareext | state-body |
| screen.shareext.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | shareext | recovery |
| screen.shareext.state.populated-default.body | Актуальные данные раздела «Поделиться в «Хвосты»» готовы к следующему действию. | none | State copy: populated/default | shareext | state-body |
| screen.shareext.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | shareext | recovery |
| screen.shareext.title | Поделиться в «Хвосты» | none | Surface title | shareext | navigation-title |
| screen.vaccine.action.complete-vaccine.label | Добавить в Календарь | none | Action label | vaccine | control |
| screen.vaccine.purpose | Собрать сроки прививок и положить их в календарь | none | Product task | vaccine | accessibility-and-docs |
| screen.vaccine.state.error.body | Не удалось обновить «Прививки и обработки». Введённые данные сохранены; повторите попытку. | none | State copy: error | vaccine | state-body |
| screen.vaccine.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | vaccine | recovery |
| screen.vaccine.state.loading.body | Обновляем данные раздела «Прививки и обработки»; текущий контекст остаётся доступен. | none | State copy: loading | vaccine | state-body |
| screen.vaccine.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | vaccine | recovery |
| screen.vaccine.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | vaccine | state-body |
| screen.vaccine.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | vaccine | recovery |
| screen.vaccine.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | vaccine | state-body |
| screen.vaccine.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | vaccine | recovery |
| screen.vaccine.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | vaccine | state-body |
| screen.vaccine.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | vaccine | recovery |
| screen.vaccine.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | vaccine | state-body |
| screen.vaccine.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | vaccine | recovery |
| screen.vaccine.state.populated-default.body | Актуальные данные раздела «Прививки и обработки» готовы к следующему действию. | none | State copy: populated/default | vaccine | state-body |
| screen.vaccine.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | vaccine | recovery |
| screen.vaccine.title | Прививки и обработки | none | Surface title | vaccine | navigation-title |
| screen.vetnote.action.complete-vetnote.label | Сохранить в карточку | none | Action label | vetnote | control |
| screen.vetnote.purpose | Надиктовать наблюдение и положить его в карточку питомца | none | Product task | vetnote | accessibility-and-docs |
| screen.vetnote.state.error.body | Не удалось обновить «Заметка о самочувствии». Введённые данные сохранены; повторите попытку. | none | State copy: error | vetnote | state-body |
| screen.vetnote.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | vetnote | recovery |
| screen.vetnote.state.loading.body | Обновляем данные раздела «Заметка о самочувствии»; текущий контекст остаётся доступен. | none | State copy: loading | vetnote | state-body |
| screen.vetnote.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | vetnote | recovery |
| screen.vetnote.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | vetnote | state-body |
| screen.vetnote.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | vetnote | recovery |
| screen.vetnote.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | vetnote | state-body |
| screen.vetnote.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | vetnote | recovery |
| screen.vetnote.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | vetnote | state-body |
| screen.vetnote.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | vetnote | recovery |
| screen.vetnote.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | vetnote | state-body |
| screen.vetnote.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | vetnote | recovery |
| screen.vetnote.state.populated-default.body | Актуальные данные раздела «Заметка о самочувствии» готовы к следующему действию. | none | State copy: populated/default | vetnote | state-body |
| screen.vetnote.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | vetnote | recovery |
| screen.vetnote.title | Заметка о самочувствии | none | Surface title | vetnote | navigation-title |
| screen.voice.action.complete-voice.label | Отправить | none | Action label | voice | control |
| screen.voice.purpose | Записать голос | none | Product task | voice | accessibility-and-docs |
| screen.voice.state.error.body | Не удалось обновить «Голосовое». Введённые данные сохранены; повторите попытку. | none | State copy: error | voice | state-body |
| screen.voice.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | voice | recovery |
| screen.voice.state.loading.body | Обновляем данные раздела «Голосовое»; текущий контекст остаётся доступен. | none | State copy: loading | voice | state-body |
| screen.voice.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | voice | recovery |
| screen.voice.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | voice | state-body |
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
| screen.walk.action.open-netqr.label | Открыть «Сеть площадки по QR» | none | Action label | walk | control |
| screen.walk.purpose | Встретиться | none | Product task | walk | accessibility-and-docs |
| screen.walk.state.error.body | Не удалось обновить «Прогулка». Введённые данные сохранены; повторите попытку. | none | State copy: error | walk | state-body |
| screen.walk.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | walk | recovery |
| screen.walk.state.loading.body | Обновляем данные раздела «Прогулка»; текущий контекст остаётся доступен. | none | State copy: loading | walk | state-body |
| screen.walk.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | walk | recovery |
| screen.walk.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | walk | state-body |
| screen.walk.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | walk | recovery |
| screen.walk.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | walk | state-body |
| screen.walk.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | walk | recovery |
| screen.walk.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | walk | state-body |
| screen.walk.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | walk | recovery |
| screen.walk.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | walk | state-body |
| screen.walk.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | walk | recovery |
| screen.walk.state.populated-default.body | Актуальные данные раздела «Прогулка» готовы к следующему действию. | none | State copy: populated/default | walk | state-body |
| screen.walk.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | walk | recovery |
| screen.walk.title | Прогулка | none | Surface title | walk | navigation-title |
| screen.widget.action.complete-widget.label | Открыть «Хвосты» | none | Action label | widget | control |
| screen.widget.purpose | Поставить виджет ближайшей прогулки на экран «Домой» | none | Product task | widget | accessibility-and-docs |
| screen.widget.state.error.body | Не удалось обновить «Виджет на экране «Домой»». Введённые данные сохранены; повторите попытку. | none | State copy: error | widget | state-body |
| screen.widget.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | widget | recovery |
| screen.widget.state.loading.body | Обновляем данные раздела «Виджет на экране «Домой»»; текущий контекст остаётся доступен. | none | State copy: loading | widget | state-body |
| screen.widget.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | widget | recovery |
| screen.widget.state.offline.body | Нет сети. Показаны сохранённые данные compatible-walk; свежесть отмечена явно. | none | State copy: offline | widget | state-body |
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
| all.happy | all | happy-path | surface:phone<br>fixture:fixture.tails.phone.default | perform-action:phone.open-code<br>perform-action:code.open-codefail<br>open-surface:codefail<br>perform-action:home.open-pet<br>open-surface:pet<br>perform-action:nearby.open-walk<br>open-surface:walk<br>open-surface:create | surface-visible:create<br>outcome-visible:value |
| all.failure | all | failure-recovery | surface:phone<br>fixture:fixture.tails.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| all.offline | all | offline | surface:phone<br>fixture:fixture.tails.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| all.persistence | all | persistence-return | surface:phone<br>checkpoint-flow:all | relaunch:application<br>return-to-flow:all | flow-context-restored:all<br>surface-visible:phone |
| walk.happy | walk | happy-path | surface:walk<br>fixture:fixture.tails.walk.default | perform-action:walk.open-netqr<br>open-surface:netqr<br>open-surface:nearby<br>open-surface:background<br>open-surface:home | surface-visible:home<br>outcome-visible:value |
| walk.failure | walk | failure-recovery | surface:walk<br>fixture:fixture.tails.walk.error<br>inject-state:error | invoke-recovery:walk | recovery-visible:walk<br>input-preserved:walk |
| walk.offline | walk | offline | surface:walk<br>fixture:fixture.tails.walk.offline<br>connectivity:offline | open-surface:walk | state-visible:walk.offline<br>recovery-visible:walk |
| walk.persistence | walk | persistence-return | surface:walk<br>checkpoint-flow:walk | relaunch:application<br>return-to-flow:walk | flow-context-restored:walk<br>surface-visible:walk |
| publish.happy | publish | happy-path | surface:create<br>fixture:fixture.tails.create.default | open-surface:create<br>open-surface:home<br>open-surface:nearby<br>open-surface:chats<br>open-surface:profile<br>open-surface:camera<br>open-surface:media<br>open-surface:shareext | surface-visible:shareext<br>outcome-visible:value |
| publish.failure | publish | failure-recovery | surface:create<br>fixture:fixture.tails.create.error<br>inject-state:error | invoke-recovery:create | recovery-visible:create<br>input-preserved:create |
| publish.offline | publish | offline | surface:create<br>fixture:fixture.tails.create.offline<br>connectivity:offline | open-surface:create | state-visible:create.offline<br>recovery-visible:create |
| publish.persistence | publish | persistence-return | surface:create<br>checkpoint-flow:publish | relaunch:application<br>return-to-flow:publish | flow-context-restored:publish<br>surface-visible:create |
| permission.camera.denied | permission:camera | permission-denial-fallback | surface:create<br>fixture:fixture.tails.camera.denied<br>permission-status:camera.not-determined | deny-permission:camera | state-visible:camera.permission-denied<br>fallback-visible:camera |
| permission.photos.denied | permission:photos | permission-denial-fallback | surface:create<br>fixture:fixture.tails.media.permission-denied<br>permission-status:photos.not-determined | deny-permission:photos | state-visible:media.permission-denied<br>fallback-visible:photos |
| permission.mic.denied | permission:mic | permission-denial-fallback | surface:chat<br>fixture:fixture.tails.voice.denied<br>permission-status:mic.not-determined | deny-permission:mic | state-visible:voice.permission-denied<br>fallback-visible:mic |
| permission.location.denied | permission:location | permission-denial-fallback | surface:home<br>fixture:fixture.tails.nearby.permission-denied<br>permission-status:location.not-determined | deny-permission:location | state-visible:nearby.permission-denied<br>fallback-visible:location |
| permission.push.denied | permission:push | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.settings.permission-denied<br>permission-status:push.not-determined | deny-permission:push | state-visible:settings.permission-denied<br>fallback-visible:push |
| permission.commnotif.denied | permission:commnotif | permission-denial-fallback | surface:chat<br>fixture:fixture.tails.chat.permission-denied<br>permission-status:commnotif.not-determined | deny-permission:commnotif | state-visible:chat.permission-denied<br>fallback-visible:commnotif |
| permission.remotenotif.denied | permission:remotenotif | permission-denial-fallback | surface:walk<br>fixture:fixture.tails.walk.permission-denied<br>permission-status:remotenotif.not-determined | deny-permission:remotenotif | state-visible:walk.permission-denied<br>fallback-visible:remotenotif |
| permission.fetch.denied | permission:fetch | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.settings.permission-denied<br>permission-status:fetch.not-determined | deny-permission:fetch | state-visible:settings.permission-denied<br>fallback-visible:fetch |
| permission.bgtask.denied | permission:bgtask | permission-denial-fallback | surface:refresh<br>fixture:fixture.tails.home.permission-denied<br>permission-status:bgtask.not-determined | deny-permission:bgtask | state-visible:home.permission-denied<br>fallback-visible:bgtask |
| permission.appgroups.denied | permission:appgroups | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.widget.permission-denied<br>permission-status:appgroups.not-determined | deny-permission:appgroups | state-visible:widget.permission-denied<br>fallback-visible:appgroups |
| permission.keychain.denied | permission:keychain | permission-denial-fallback | surface:widget<br>fixture:fixture.tails.home.permission-denied<br>permission-status:keychain.not-determined | deny-permission:keychain | state-visible:home.permission-denied<br>fallback-visible:keychain |
| permission.autofill.denied | permission:autofill | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.fill.permission-denied<br>permission-status:autofill.not-determined | deny-permission:autofill | state-visible:fill.permission-denied<br>fallback-visible:autofill |
| permission.wifiinfo.denied | permission:wifiinfo | permission-denial-fallback | surface:walk<br>fixture:fixture.tails.walk.permission-denied<br>permission-status:wifiinfo.not-determined | deny-permission:wifiinfo | state-visible:walk.permission-denied<br>fallback-visible:wifiinfo |
| permission.contacts.denied | permission:contacts | permission-denial-fallback | surface:profile<br>fixture:fixture.tails.mates.denied<br>permission-status:contacts.not-determined | deny-permission:contacts | state-visible:mates.permission-denied<br>fallback-visible:contacts |
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.tails.profile.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:profile.permission-denied<br>fallback-visible:tracking |
| permission.faceid.denied | permission:faceid | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.lock.denied<br>permission-status:faceid.not-determined | deny-permission:faceid | state-visible:lock.permission-denied<br>fallback-visible:faceid |
| permission.speech.denied | permission:speech | permission-denial-fallback | surface:pet<br>fixture:fixture.tails.vetnote.permission-denied<br>permission-status:speech.not-determined | deny-permission:speech | state-visible:vetnote.permission-denied<br>fallback-visible:speech |
| permission.audio.denied | permission:audio | permission-denial-fallback | surface:course<br>fixture:fixture.tails.background.permission-denied<br>permission-status:audio.not-determined | deny-permission:audio | state-visible:background.permission-denied<br>fallback-visible:audio |
| permission.voip.denied | permission:voip | permission-denial-fallback | surface:chat<br>fixture:fixture.tails.call.permission-denied<br>permission-status:voip.not-determined | deny-permission:voip | state-visible:call.permission-denied<br>fallback-visible:voip |
| permission.calendar.denied | permission:calendar | permission-denial-fallback | surface:vaccine<br>fixture:fixture.tails.vaccine.permission-denied<br>permission-status:calendar.not-determined | deny-permission:calendar | state-visible:vaccine.permission-denied<br>fallback-visible:calendar |
| permission.shareext.denied | permission:shareext | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.shareext.permission-denied<br>permission-status:shareext.not-determined | deny-permission:shareext | state-visible:shareext.permission-denied<br>fallback-visible:shareext |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:netqr<br>fixture:fixture.tails.netqr.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:netqr.permission-denied<br>fallback-visible:hotspot |

## Deterministic fixture catalog

Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.

| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |
|---|---|---|---|---|---|
| fixture.tails.phone.default | phone / default | tails.phone.default.primary.001<br>tails.phone.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.phone.loading | phone / loading | tails.phone.loading.primary.001<br>tails.phone.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.phone.error | phone / error | tails.phone.error.primary.001<br>tails.phone.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.phone.offline | phone / offline | tails.phone.offline.primary.001<br>tails.phone.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.code.default | code / default | tails.code.default.primary.001<br>tails.code.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.code.loading | code / loading | tails.code.loading.primary.001<br>tails.code.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.code.error | code / error | tails.code.error.primary.001<br>tails.code.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.code.offline | code / offline | tails.code.offline.primary.001<br>tails.code.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.codefail.default | codefail / default | tails.codefail.default.primary.001<br>tails.codefail.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.codefail.loading | codefail / loading | tails.codefail.loading.primary.001<br>tails.codefail.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.codefail.error | codefail / error | tails.codefail.error.primary.001<br>tails.codefail.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.codefail.offline | codefail / offline | tails.codefail.offline.primary.001<br>tails.codefail.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.default | home / default | tails.home.default.primary.001<br>tails.home.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.empty | home / empty | tails.home.empty.primary.001<br>tails.home.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.loading | home / loading | tails.home.loading.primary.001<br>tails.home.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.error | home / error | tails.home.error.primary.001<br>tails.home.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.offline | home / offline | tails.home.offline.primary.001<br>tails.home.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.permission-needed | home / permission-needed | tails.home.permission-needed.primary.001<br>tails.home.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.permission-denied | home / permission-denied | tails.home.permission-denied.primary.001<br>tails.home.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.permission-restricted | home / permission-restricted | tails.home.permission-restricted.primary.001<br>tails.home.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.home.permission-limited | home / permission-limited | tails.home.permission-limited.primary.001<br>tails.home.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.default | pet / default | tails.pet.default.primary.001<br>tails.pet.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.loading | pet / loading | tails.pet.loading.primary.001<br>tails.pet.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.error | pet / error | tails.pet.error.primary.001<br>tails.pet.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.offline | pet / offline | tails.pet.offline.primary.001<br>tails.pet.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.permission-needed | pet / permission-needed | tails.pet.permission-needed.primary.001<br>tails.pet.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.permission-denied | pet / permission-denied | tails.pet.permission-denied.primary.001<br>tails.pet.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.pet.permission-restricted | pet / permission-restricted | tails.pet.permission-restricted.primary.001<br>tails.pet.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.default | nearby / default | tails.nearby.default.primary.001<br>tails.nearby.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.empty | nearby / empty | tails.nearby.empty.primary.001<br>tails.nearby.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.loading | nearby / loading | tails.nearby.loading.primary.001<br>tails.nearby.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.error | nearby / error | tails.nearby.error.primary.001<br>tails.nearby.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.offline | nearby / offline | tails.nearby.offline.primary.001<br>tails.nearby.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.permission-needed | nearby / permission-needed | tails.nearby.permission-needed.primary.001<br>tails.nearby.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.permission-denied | nearby / permission-denied | tails.nearby.permission-denied.primary.001<br>tails.nearby.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.permission-restricted | nearby / permission-restricted | tails.nearby.permission-restricted.primary.001<br>tails.nearby.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.nearby.permission-limited | nearby / permission-limited | tails.nearby.permission-limited.primary.001<br>tails.nearby.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.default | walk / default | tails.walk.default.primary.001<br>tails.walk.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.loading | walk / loading | tails.walk.loading.primary.001<br>tails.walk.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.error | walk / error | tails.walk.error.primary.001<br>tails.walk.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.offline | walk / offline | tails.walk.offline.primary.001<br>tails.walk.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.permission-needed | walk / permission-needed | tails.walk.permission-needed.primary.001<br>tails.walk.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.permission-denied | walk / permission-denied | tails.walk.permission-denied.primary.001<br>tails.walk.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.walk.permission-restricted | walk / permission-restricted | tails.walk.permission-restricted.primary.001<br>tails.walk.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.default | create / default | tails.create.default.primary.001<br>tails.create.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.error | create / error | tails.create.error.primary.001<br>tails.create.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.success | create / success | tails.create.success.primary.001<br>tails.create.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.loading | create / loading | tails.create.loading.primary.001<br>tails.create.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.offline | create / offline | tails.create.offline.primary.001<br>tails.create.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.permission-needed | create / permission-needed | tails.create.permission-needed.primary.001<br>tails.create.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.permission-denied | create / permission-denied | tails.create.permission-denied.primary.001<br>tails.create.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.permission-restricted | create / permission-restricted | tails.create.permission-restricted.primary.001<br>tails.create.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.create.permission-limited | create / permission-limited | tails.create.permission-limited.primary.001<br>tails.create.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.default | camera / default | tails.camera.default.primary.001<br>tails.camera.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.denied | camera / denied | tails.camera.denied.primary.001<br>tails.camera.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.loading | camera / loading | tails.camera.loading.primary.001<br>tails.camera.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.error | camera / error | tails.camera.error.primary.001<br>tails.camera.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.offline | camera / offline | tails.camera.offline.primary.001<br>tails.camera.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.permission-needed | camera / permission-needed | tails.camera.permission-needed.primary.001<br>tails.camera.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.permission-restricted | camera / permission-restricted | tails.camera.permission-restricted.primary.001<br>tails.camera.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.camera.permission-limited | camera / permission-limited | tails.camera.permission-limited.primary.001<br>tails.camera.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.default | media / default | tails.media.default.primary.001<br>tails.media.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.loading | media / loading | tails.media.loading.primary.001<br>tails.media.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.error | media / error | tails.media.error.primary.001<br>tails.media.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.offline | media / offline | tails.media.offline.primary.001<br>tails.media.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.permission-needed | media / permission-needed | tails.media.permission-needed.primary.001<br>tails.media.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.permission-denied | media / permission-denied | tails.media.permission-denied.primary.001<br>tails.media.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.permission-restricted | media / permission-restricted | tails.media.permission-restricted.primary.001<br>tails.media.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.media.permission-limited | media / permission-limited | tails.media.permission-limited.primary.001<br>tails.media.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.places.default | places / default | tails.places.default.primary.001<br>tails.places.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.places.empty | places / empty | tails.places.empty.primary.001<br>tails.places.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.places.loading | places / loading | tails.places.loading.primary.001<br>tails.places.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.places.error | places / error | tails.places.error.primary.001<br>tails.places.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.places.offline | places / offline | tails.places.offline.primary.001<br>tails.places.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chats.default | chats / default | tails.chats.default.primary.001<br>tails.chats.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chats.empty | chats / empty | tails.chats.empty.primary.001<br>tails.chats.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chats.loading | chats / loading | tails.chats.loading.primary.001<br>tails.chats.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chats.error | chats / error | tails.chats.error.primary.001<br>tails.chats.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chats.offline | chats / offline | tails.chats.offline.primary.001<br>tails.chats.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.default | chat / default | tails.chat.default.primary.001<br>tails.chat.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.loading | chat / loading | tails.chat.loading.primary.001<br>tails.chat.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.error | chat / error | tails.chat.error.primary.001<br>tails.chat.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.offline | chat / offline | tails.chat.offline.primary.001<br>tails.chat.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.permission-needed | chat / permission-needed | tails.chat.permission-needed.primary.001<br>tails.chat.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.permission-denied | chat / permission-denied | tails.chat.permission-denied.primary.001<br>tails.chat.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.chat.permission-restricted | chat / permission-restricted | tails.chat.permission-restricted.primary.001<br>tails.chat.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.default | voice / default | tails.voice.default.primary.001<br>tails.voice.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.denied | voice / denied | tails.voice.denied.primary.001<br>tails.voice.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.loading | voice / loading | tails.voice.loading.primary.001<br>tails.voice.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.error | voice / error | tails.voice.error.primary.001<br>tails.voice.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.offline | voice / offline | tails.voice.offline.primary.001<br>tails.voice.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.permission-needed | voice / permission-needed | tails.voice.permission-needed.primary.001<br>tails.voice.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.voice.permission-restricted | voice / permission-restricted | tails.voice.permission-restricted.primary.001<br>tails.voice.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.default | profile / default | tails.profile.default.primary.001<br>tails.profile.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.loading | profile / loading | tails.profile.loading.primary.001<br>tails.profile.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.error | profile / error | tails.profile.error.primary.001<br>tails.profile.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.offline | profile / offline | tails.profile.offline.primary.001<br>tails.profile.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.empty | profile / empty | tails.profile.empty.primary.001<br>tails.profile.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.permission-needed | profile / permission-needed | tails.profile.permission-needed.primary.001<br>tails.profile.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.permission-denied | profile / permission-denied | tails.profile.permission-denied.primary.001<br>tails.profile.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.permission-restricted | profile / permission-restricted | tails.profile.permission-restricted.primary.001<br>tails.profile.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.profile.permission-limited | profile / permission-limited | tails.profile.permission-limited.primary.001<br>tails.profile.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.default | settings / default | tails.settings.default.primary.001<br>tails.settings.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.loading | settings / loading | tails.settings.loading.primary.001<br>tails.settings.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.error | settings / error | tails.settings.error.primary.001<br>tails.settings.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.offline | settings / offline | tails.settings.offline.primary.001<br>tails.settings.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.empty | settings / empty | tails.settings.empty.primary.001<br>tails.settings.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.permission-needed | settings / permission-needed | tails.settings.permission-needed.primary.001<br>tails.settings.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.permission-denied | settings / permission-denied | tails.settings.permission-denied.primary.001<br>tails.settings.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.settings.permission-restricted | settings / permission-restricted | tails.settings.permission-restricted.primary.001<br>tails.settings.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.default | widget / default | tails.widget.default.primary.001<br>tails.widget.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.loading | widget / loading | tails.widget.loading.primary.001<br>tails.widget.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.error | widget / error | tails.widget.error.primary.001<br>tails.widget.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.offline | widget / offline | tails.widget.offline.primary.001<br>tails.widget.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.permission-needed | widget / permission-needed | tails.widget.permission-needed.primary.001<br>tails.widget.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.permission-denied | widget / permission-denied | tails.widget.permission-denied.primary.001<br>tails.widget.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.widget.permission-restricted | widget / permission-restricted | tails.widget.permission-restricted.primary.001<br>tails.widget.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.default | fill / default | tails.fill.default.primary.001<br>tails.fill.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.loading | fill / loading | tails.fill.loading.primary.001<br>tails.fill.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.error | fill / error | tails.fill.error.primary.001<br>tails.fill.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.offline | fill / offline | tails.fill.offline.primary.001<br>tails.fill.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.permission-needed | fill / permission-needed | tails.fill.permission-needed.primary.001<br>tails.fill.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.permission-denied | fill / permission-denied | tails.fill.permission-denied.primary.001<br>tails.fill.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.fill.permission-restricted | fill / permission-restricted | tails.fill.permission-restricted.primary.001<br>tails.fill.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.default | refresh / default | tails.refresh.default.primary.001<br>tails.refresh.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.loading | refresh / loading | tails.refresh.loading.primary.001<br>tails.refresh.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.error | refresh / error | tails.refresh.error.primary.001<br>tails.refresh.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.offline | refresh / offline | tails.refresh.offline.primary.001<br>tails.refresh.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.permission-needed | refresh / permission-needed | tails.refresh.permission-needed.primary.001<br>tails.refresh.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.permission-denied | refresh / permission-denied | tails.refresh.permission-denied.primary.001<br>tails.refresh.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.refresh.permission-restricted | refresh / permission-restricted | tails.refresh.permission-restricted.primary.001<br>tails.refresh.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.default | mates / default | tails.mates.default.primary.001<br>tails.mates.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.empty | mates / empty | tails.mates.empty.primary.001<br>tails.mates.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.denied | mates / denied | tails.mates.denied.primary.001<br>tails.mates.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.loading | mates / loading | tails.mates.loading.primary.001<br>tails.mates.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.error | mates / error | tails.mates.error.primary.001<br>tails.mates.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.offline | mates / offline | tails.mates.offline.primary.001<br>tails.mates.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.permission-needed | mates / permission-needed | tails.mates.permission-needed.primary.001<br>tails.mates.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.permission-restricted | mates / permission-restricted | tails.mates.permission-restricted.primary.001<br>tails.mates.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.mates.permission-limited | mates / permission-limited | tails.mates.permission-limited.primary.001<br>tails.mates.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.default | ads / default | tails.ads.default.primary.001<br>tails.ads.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.loading | ads / loading | tails.ads.loading.primary.001<br>tails.ads.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.error | ads / error | tails.ads.error.primary.001<br>tails.ads.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.offline | ads / offline | tails.ads.offline.primary.001<br>tails.ads.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.permission-needed | ads / permission-needed | tails.ads.permission-needed.primary.001<br>tails.ads.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.permission-denied | ads / permission-denied | tails.ads.permission-denied.primary.001<br>tails.ads.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.ads.permission-restricted | ads / permission-restricted | tails.ads.permission-restricted.primary.001<br>tails.ads.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.default | lock / default | tails.lock.default.primary.001<br>tails.lock.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.denied | lock / denied | tails.lock.denied.primary.001<br>tails.lock.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.loading | lock / loading | tails.lock.loading.primary.001<br>tails.lock.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.error | lock / error | tails.lock.error.primary.001<br>tails.lock.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.offline | lock / offline | tails.lock.offline.primary.001<br>tails.lock.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.permission-needed | lock / permission-needed | tails.lock.permission-needed.primary.001<br>tails.lock.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.lock.permission-restricted | lock / permission-restricted | tails.lock.permission-restricted.primary.001<br>tails.lock.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.default | vetnote / default | tails.vetnote.default.primary.001<br>tails.vetnote.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.error | vetnote / error | tails.vetnote.error.primary.001<br>tails.vetnote.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.success | vetnote / success | tails.vetnote.success.primary.001<br>tails.vetnote.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.loading | vetnote / loading | tails.vetnote.loading.primary.001<br>tails.vetnote.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.offline | vetnote / offline | tails.vetnote.offline.primary.001<br>tails.vetnote.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.permission-needed | vetnote / permission-needed | tails.vetnote.permission-needed.primary.001<br>tails.vetnote.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.permission-denied | vetnote / permission-denied | tails.vetnote.permission-denied.primary.001<br>tails.vetnote.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vetnote.permission-restricted | vetnote / permission-restricted | tails.vetnote.permission-restricted.primary.001<br>tails.vetnote.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.default | course / default | tails.course.default.primary.001<br>tails.course.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.loading | course / loading | tails.course.loading.primary.001<br>tails.course.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.error | course / error | tails.course.error.primary.001<br>tails.course.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.offline | course / offline | tails.course.offline.primary.001<br>tails.course.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.permission-needed | course / permission-needed | tails.course.permission-needed.primary.001<br>tails.course.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.permission-denied | course / permission-denied | tails.course.permission-denied.primary.001<br>tails.course.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.course.permission-restricted | course / permission-restricted | tails.course.permission-restricted.primary.001<br>tails.course.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.default | background / default | tails.background.default.primary.001<br>tails.background.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.loading | background / loading | tails.background.loading.primary.001<br>tails.background.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.error | background / error | tails.background.error.primary.001<br>tails.background.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.offline | background / offline | tails.background.offline.primary.001<br>tails.background.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.permission-needed | background / permission-needed | tails.background.permission-needed.primary.001<br>tails.background.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.permission-denied | background / permission-denied | tails.background.permission-denied.primary.001<br>tails.background.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.background.permission-restricted | background / permission-restricted | tails.background.permission-restricted.primary.001<br>tails.background.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.default | call / default | tails.call.default.primary.001<br>tails.call.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.loading | call / loading | tails.call.loading.primary.001<br>tails.call.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.error | call / error | tails.call.error.primary.001<br>tails.call.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.offline | call / offline | tails.call.offline.primary.001<br>tails.call.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.permission-needed | call / permission-needed | tails.call.permission-needed.primary.001<br>tails.call.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.permission-denied | call / permission-denied | tails.call.permission-denied.primary.001<br>tails.call.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.call.permission-restricted | call / permission-restricted | tails.call.permission-restricted.primary.001<br>tails.call.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.default | vaccine / default | tails.vaccine.default.primary.001<br>tails.vaccine.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.loading | vaccine / loading | tails.vaccine.loading.primary.001<br>tails.vaccine.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.error | vaccine / error | tails.vaccine.error.primary.001<br>tails.vaccine.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.offline | vaccine / offline | tails.vaccine.offline.primary.001<br>tails.vaccine.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.permission-needed | vaccine / permission-needed | tails.vaccine.permission-needed.primary.001<br>tails.vaccine.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.permission-denied | vaccine / permission-denied | tails.vaccine.permission-denied.primary.001<br>tails.vaccine.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.vaccine.permission-restricted | vaccine / permission-restricted | tails.vaccine.permission-restricted.primary.001<br>tails.vaccine.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.default | netqr / default | tails.netqr.default.primary.001<br>tails.netqr.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.error | netqr / error | tails.netqr.error.primary.001<br>tails.netqr.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.loading | netqr / loading | tails.netqr.loading.primary.001<br>tails.netqr.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.offline | netqr / offline | tails.netqr.offline.primary.001<br>tails.netqr.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.permission-needed | netqr / permission-needed | tails.netqr.permission-needed.primary.001<br>tails.netqr.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.permission-denied | netqr / permission-denied | tails.netqr.permission-denied.primary.001<br>tails.netqr.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.netqr.permission-restricted | netqr / permission-restricted | tails.netqr.permission-restricted.primary.001<br>tails.netqr.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.default | shareext / default | tails.shareext.default.primary.001<br>tails.shareext.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.success | shareext / success | tails.shareext.success.primary.001<br>tails.shareext.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.loading | shareext / loading | tails.shareext.loading.primary.001<br>tails.shareext.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.error | shareext / error | tails.shareext.error.primary.001<br>tails.shareext.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.offline | shareext / offline | tails.shareext.offline.primary.001<br>tails.shareext.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.permission-needed | shareext / permission-needed | tails.shareext.permission-needed.primary.001<br>tails.shareext.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.permission-denied | shareext / permission-denied | tails.shareext.permission-denied.primary.001<br>tails.shareext.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |
| fixture.tails.shareext.permission-restricted | shareext / permission-restricted | tails.shareext.permission-restricted.primary.001<br>tails.shareext.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | web-migration-evidence: platform/concepts/tails/concept.json + curated native portfolio | no media |

## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| camera | Снять публикацию питомца | Только после действия ««Снять»» | Сценарий «Снять публикацию питомца» на поверхности create | Можно выбрать готовый снимок | contextual-gesture |
| photos | Публикация из медиатеки | Только после действия ««Из Фото»» | Сценарий «Публикация из медиатеки» на поверхности create | Можно снять новый кадр камерой | contextual-gesture |
| mic | Голосовые в личном чате | Только после действия ««Записать голосовое»» | Сценарий «Голосовые в личном чате» на поверхности chat | Остаются текст и фото | contextual-gesture |
| location | Прогулки рядом | Только после действия ««Кто гуляет рядом»» | Сценарий «Прогулки рядом» на поверхности home | Район выбирается вручную | contextual-gesture |
| push | Ответы и изменения прогулки | Только после действия ««Прогулки и ответы» в «Настройках»» | Сценарий «Ответы и изменения прогулки» на поверхности settings | Обновления помечаются точкой внутри приложения | contextual-gesture |
| commnotif | Чаты с аватарами в уведомлениях | Только после действия ««Сообщения с аватаром»» | Сценарий «Чаты с аватарами в уведомлениях» на поверхности chat | Обычное уведомление без аватара | build-artifact |
| remotenotif | Актуальный состав прогулки | Только после действия ««Обновлять состав»» | Сценарий «Актуальный состав прогулки» на поверхности walk | Состав обновляется при открытии | app-lifecycle |
| fetch | Свежая лента к запуску | Только после действия ««Обновлять ленту в фоне»» | Сценарий «Свежая лента к запуску» на поверхности settings | Лента обновится после открытия | app-lifecycle |
| bgtask | Зарегистрированная задача обновления | Только после действия ««Проверить задачу»» | Сценарий «Зарегистрированная задача обновления» на поверхности refresh | Без задачи обновление только вручную | app-lifecycle |
| appgroups | Виджет ближайшей прогулки | Только после действия ««Виджет»» | Сценарий «Виджет ближайшей прогулки» на поверхности settings | Прогулка остаётся внутри приложения | build-artifact |
| keychain | Один вход для приложения и виджета | Только после действия ««Открыть „Хвосты“» с виджета» | Сценарий «Один вход для приложения и виджета» на поверхности widget | Виджет открывает приложение для входа | build-artifact |
| autofill | Вход на сайт сохранённой связкой | Только после действия ««Вход на сайте»» | Сценарий «Вход на сайт сохранённой связкой» на поверхности settings | Вход вручную почтой и паролем | contextual-gesture |
| wifiinfo | Отметка «я на месте» в партнёрском дог-парке | Только после действия ««Я на месте»» | Сценарий «Отметка «я на месте» в партнёрском дог-парке» на поверхности walk | Отметка по кнопке без автоматической проверки | build-artifact |
| contacts | Кто из ваших контактов уже гуляет рядом | Только после действия ««Найти среди контактов»» | Сценарий «Кто из ваших контактов уже гуляет рядом» на поверхности profile | Остаётся поиск по кличке и ссылка-приглашение | contextual-gesture |
| tracking | Реклама зоомагазинов, кормов и ветклиник вместо платной подписки | Только после действия ««Продолжить»» | Сценарий «Реклама зоомагазинов, кормов и ветклиник вместо платной подписки» на поверхности ads | Реклама остаётся, но перестаёт быть персональной | contextual-gesture |
| faceid | Замок на ветпаспорте: диагнозы, номер чипа и адрес выгула | Только после действия ««Замок Face ID»» | Сценарий «Замок на ветпаспорте: диагнозы, номер чипа и адрес выгула» на поверхности settings | Остаётся код-пароль устройства | contextual-gesture |
| speech | Заметка о самочувствии голосом: текст ложится в карточку питомца и ищется словом | Только после действия ««Надиктовать заметку» — цепочкой с микрофоном» | Сценарий «Заметка о самочувствии голосом: текст ложится в карточку питомца и ищется словом» на поверхности pet | Заметка остаётся звуком: её можно слушать, но не искать словом | contextual-gesture |
| audio | Курс послушания слушают на прогулке: руки заняты поводком, на локскрине — Now Playing и ±15 секунд | Только после действия ««Слушать»» | Сценарий «Курс послушания слушают на прогулке: руки заняты поводком, на локскрине — Now Playing и ±15 секунд» на поверхности course | Без entitlement звук обрывается — не ship | contextual-gesture |
| voip | Созвон с догситтером и передержкой без обмена номерами | Только после действия ««Позвонить»» | Сценарий «Созвон с догситтером и передержкой без обмена номерами» на поверхности chat | Остаётся переписка в чате | contextual-gesture |
| calendar | Прививки и обработка от клещей в системном календаре, с правкой при переносе и удалением при отмене | Только после действия ««Добавить в Календарь»» | Сценарий «Прививки и обработка от клещей в системном календаре, с правкой при переносе и удалением при отмене» на поверхности vaccine | Срок остаётся в карточке питомца и в напоминании приложения | contextual-gesture |
| shareext | Поделиться в «Хвосты» из Safari и «Фото» — объявление о найденной собаке падает в черновик | Только после действия ««Поделиться» в другом приложении» | Сценарий «Поделиться в «Хвосты» из Safari и «Фото» — объявление о найденной собаке падает в черновик» на поверхности settings | Остаётся создание записи внутри приложения | contextual-gesture |
| hotspot | Гостевая сеть дог-парка по QR — без неё отметка на площадке не проходит | Только после действия ««Подключиться»» | Сценарий «Гостевая сеть дог-парка по QR — без неё отметка на площадке не проходит» на поверхности netqr | Сеть выбирается вручную в Настройках | build-artifact |

**Entitlements:** `aps-environment`, `com.apple.developer.usernotifications.communication`, `com.apple.security.application-groups`, `keychain-access-groups`, `com.apple.developer.networking.wifi-info`, `com.apple.developer.networking.HotspotConfiguration`
**Extension targets:** `notification-service`, `credential-provider`, `share-extension`

## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product domain | Владеет сущностями и состояниями Совместимая прогулка | native/apps/tails |
| Native runtime | Владеет системными разрешениями и lifecycle | native/Runtime |
| Visual language | Владеет семантической визуальной грамматикой | native/ReferenceProfiles/vk-ios |

**Boundaries**
- Продуктовое состояние не живёт в визуальных примитивах
- Разрешения доступны только через причинное действие
- Web evidence не входит в native build graph

## Data, state, persistence, and integrations

**Entities**

- Питомец
- Совместимость
- Прогулка
- Момент

**State**

- Текущая сессия
- Жизненный цикл Совместимая прогулка
- Состояния разрешений и восстановления

**Persistence**

- Локальный черновик переживает перезапуск
- Защищённые значения используют системное хранилище только по capability contract

**Integrations**

- Лента и профили: Статический контент-пак и локальные действия в прототипе
- Сообщения и уведомления: Firebase SDK и APNs без собственного API
- Прогулки рядом: MapKit и статический каталог парков

## Loading, empty, error, denied, and offline states

| State | Required behavior |
|---|---|
| loading | Сохранять контекст задачи и блокировать повторную отправку. |
| empty | Объяснить отсутствие совместимая прогулка и предложить первое полезное действие. |
| error | Назвать неуспешную операцию, сохранить ввод и дать повтор или альтернативу. |
| denied | Продолжить задачу через объявленный denied fallback. |
| offline | Показать сохранённые данные и явно отделить их от свежих. |

## Privacy, security, and trust

**Data inventory**

- Продуктовая единица «Совместимая прогулка»
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

- Доля открытых предложений, завершившихся подтверждённой прогулкой
- Повтор основного цикла
- Завершение задачи после denied fallback

**Core-loop hypothesis.** Явная совместимость повышает долю безопасно завершённых и повторных прогулок

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
- pet--default
- nearby--default
- walk--default
- create--default
- camera--default
- media--default
- places--default
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
- vetnote--default
- course--default
- background--default
- call--default
- vaccine--default
- netqr--default
- shareext--default

**Evidence provenance**

- tails-web-evidence · user-input · observed · platform/concepts/tails/concept.json and screens
- tails-reference · reference-profile · approved · native/ReferenceProfiles/vk-ios/profile.json
- tails-market-assumption · assumption · needs-validation · curated migration portfolio; real research not yet supplied

## Setup, build, and run

**Prerequisites**

- Node 22
- Xcode и iOS simulator

**Build**

- `npm run build -- tails`

**Run and verify**

- `npm run check -- tails`
- `npm run capture -- tails`

## Generated and owned file map

| Generated — do not hand-edit | Product-owned source |
|---|---|
| native/build/tails<br>concepts/tails/docs/developer-guide.md | concepts/tails/concept.json<br>native/apps/tails |

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

- claim: Явная совместимость повышает долю безопасно завершённых и повторных прогулок; risk: high; validation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; status: needs-validation
- claim: Для «Совместимая прогулка» достаточно повторяемого предложения и ответов в начальной когорте; risk: high; validation: Проверить supply и completion на пилотной когорте; status: needs-validation

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
- Социальная сеть, где профиль принадлежит питомцу.
