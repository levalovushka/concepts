# Двор: developer product guide

> Generated from Product Contract `product-d05a9d23c76a0a9d` and the compiled native manifest. Do not edit by hand.
> UX Specification: `ux-2b4a546a6536021d`; source: `explicit-product-delivery`.
> Contract status: `mature`; maturity floor: `3/4`.

## Product vision and scope

**Thesis.** «Двор» превращает разрознённое сообщение соседа в адресное Дело дома: его видят подтверждённые жильцы, понимают следующий шаг и наблюдают статус решения.

**Audience.** Жильцы многоквартирного дома, которым нужно совместно решать бытовые вопросы с понятным адресным контекстом и доверием к участникам.

**Situation.** В доме возникает инцидент или вопрос, который требует наблюдаемого следующего действия нескольких жильцов; Жителю нужно выполнить регулярную задачу дома и сохранить подтверждение результата

**Job.** Жильцы многоквартирного дома, которым нужно совместно решать бытовые вопросы с понятным адресным контекстом и доверием к участникам. wants to Видеть актуальные объявления, инциденты и сроки именно своего дома so that Увидеть актуальное дело своего House и безопасно продвинуть его к результату.

**Wedge.** Residence ограничивает право записи, а Дело дома связывает автора, место, статус, доказательства и следующее действие

**Observable differentiation.** Жилец не просто пишет в общий чат: он создаёт или открывает адресное Дело дома и видит наблюдаемое изменение его статуса; measured by Доля открытых Дел дома, по которым выполнено следующее действие и зафиксирован новый статус; threshold: Не менее 30% релевантных открытий приводят к действию, а половина активных дел получает статус результата в пилоте.

**In scope**

- Дело дома
- Пропуск в ветку дома: место плюс домашняя сеть: Чтобы проверить, что вы в границах своего двора, и получить право прочитать имя домашней сети.
- Подтверждение «я дома» по имени домашней сети: Entitlement без системного запроса: имя текущей сети сверяется с сохранённым в профиле дома.
- Съёмка проблемы во дворе и сканер QR: Чтобы снять то, что сломалось, и сканировать QR-код гостевой сети двора.
- Хроника двора: снимки из медиатеки, попавшие в границы двора: Чтобы найти ваши снимки, сделанные в границах двора, — вы не помните, какие из них здешние.
- Голосовое сообщение в чат подъезда: Чтобы записать голосовое в чат подъезда, когда руки заняты сумками.
- Расшифровка голосового в текст рядом с сообщением: Чтобы рядом с голосовым появилась расшифровка — соседи читают, не включая звук.
- Уведомление, когда по теме появился ответ: Пришлём, когда управляющая компания ответит на тему, за которой вы следите.
- Сообщение соседа приходит с аватаром и попадает в сводку Focus: Entitlement без системного запроса: уведомление о сообщении соседа показывается с его аватаром.
- Тихий пуш обновляет счётчики и виджет при закрытом приложении: Entitlement без системного запроса: тихий пуш обновляет показания и срок, пока приложение закрыто.
- Объявления дома и срок показаний готовы к первому открытию: Entitlement без системного запроса: объявления дома и срок передачи показаний подтягиваются к утру.
- Идентификатор app.dvor.refresh — под ним планируется обновление: Entitlement без системного запроса: app.dvor.refresh объявлен в Info.plist и зарегистрирован в коде.
- Виджет «Двор» и Share Extension видят данные приложения: Entitlement без системного запроса: виджет и расширения читают данные приложения.
- Одна сессия: из виджета приложение открывается уже войденным: Entitlement без системного запроса: одна сессия на приложение, виджет и расширения.
- Пароли дома подставляются в Safari без копирования: Entitlement без системного запроса: пароли дома подставляются в Safari системным автозаполнением.
- Подключение к гостевой сети двора по QR-коду с лавочки: Приложение настроит подключение к гостевой сети двора по параметрам из QR-кода.
- Кто из ваших контактов уже в доме: Чтобы показать, кто из ваших знакомых уже живёт в этом доме. Книга не покидает устройство.
- События дома в календаре, с правкой при переносе даты: Чтобы добавить собрание и субботник, а при переносе — поправить уже добавленное событие.
- Замок на приложении: адрес, номера квартир и коды: Чтобы закрыть приложение: в нём адрес, номера квартир и коды от общих дверей.
- Реклама местных услуг вместо платной подписки: Тогда реклама будет про местные услуги: сантехник в вашем районе, а не случайный баннер.

**Non-goals**

- Публичная соцсеть
- Лента по интересам
- Замена управляющей компании

## Domain glossary

| Term | Definition |
|---|---|
| House | Подтверждённый многоквартирный адрес с общей инфраструктурой, членством и закрытым продуктовым пространством. |
| Жилец | Аутентифицированный человек, связанный с House и конкретным подъездом или квартирой. |
| Residence | Проверяемая связь Жильца с House, от которой зависит право записи в закрытое пространство. |
| Дело дома | Объявление, инцидент или вопрос с адресным контекстом, статусом и наблюдаемым следующим действием. |
| Защищённый доступ | Код или конфигурация инфраструктуры House, доступная только после проверки Residence и владельца устройства. |

## Personas and jobs

| Persona | Context | Job |
|---|---|---|
| Жилец с текущей задачей | Столкнулся с поломкой, сроком показаний или важным объявлением | Понять состояние дела и выполнить одно следующее действие без поиска по чатам |
| Сосед-участник | Видит дело своего подъезда и может добавить факт, комментарий или подтверждение | Помочь закрыть дело, не раскрывая лишние адресные данные |
| Старший по дому | Поддерживает сведения House и разбирает исключения подтверждения | Сохранить доверие к членству и статусам, не превращаясь в отдельную административную панель |

## Core loop and critical flows

**Core loop:** Новая релевантная ситуация или обновление Дело дома → Открыть релевантное Дело дома, выполнить следующий шаг и проверить сохранённый статус → Получить понятный результат или ответ без повторного поиска и пересказа контекста → Добавить факт, комментарий, показание или новое адресное Дело дома.
**Habit loop:** Релевантное обновление Дело дома или повторяющаяся жизненная задача → Открыть релевантное Дело дома, выполнить следующий шаг и проверить сохранённый статус → Получить понятный результат или ответ без повторного поиска и пересказа контекста; cadence: Событийная частота измеряется по cohort; ежедневная привычка заранее не предполагается.
**Activation:** Пользователь впервые завершил основное действие над Дело дома и увидел сохранённый outcome; signal: activation_completed с идентификатором surface, action и outcome; window: Первая неделя после завершения входа и необходимых guards.

| Flow | Trigger | Steps | Outcome |
|---|---|---|---|
| Подтвердить проживание | phone | phone<br>join<br>verify<br>home | Residence получает проверяемый статус, а неподтверждённый человек остаётся в честном read-only режиме |
| Продвинуть дело дома | home | home<br>post<br>chat | Дело получает наблюдаемое изменение статуса или вклада жильца |
| Создать адресное обновление | home | home<br>createpost<br>home | Подтверждённое обновление входит в снабжение своего дома |

## Information architecture and navigation

**Navigation model.** Идентифицированные люди публикуют социальные единицы, находят их в ленте или профиле, отвечают через реакции и сообщения и возвращают вклад в граф.
**Reference fit.** Дело дома естественно читается как публикация, жилец — как профиль, обсуждение — как чат, а адресный граф ограничивает знакомые VK-паттерны одним House.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>present:null<br>navigate:continue-email | none | none:none |
| code | push | phone | parent:phone<br>action:phone.continue-email<br>action:codefail.complete-codefail | present:null<br>navigate:confirm-code | input.email.valid<br>always | pop:phone |
| codefail | push | code | parent:code | navigate:complete-codefail | none | pop:code |
| join | push | phone | parent:phone<br>action:code.confirm-code | present:null<br>present:null<br>request:verify-location<br>navigate:manual-address<br>permission:location | input.code.complete | pop:phone |
| verify | sheet | join | parent:join<br>permission:join.location | request:verify-network<br>navigate:manual-verification<br>permission:wifiinfo | capability.location.requested | dismiss:join; interactive-or-action:join |
| manual | push | join | parent:join<br>action:join.manual-address<br>action:verify.manual-verification | mutate:submit-residence | always | pop:join |
| home | tab | — | tab:home<br>permission:verify.wifiinfo<br>permission:widget.keychain | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:create-post<br>navigate:open-notifications<br>navigate:open-post<br>mutate:like-post<br>external:share-post<br>permission:photos | session.authenticated<br>capability.wifiinfo.requested<br>capability.keychain.requested | none:none |
| createpost | sheet | home | parent:home<br>action:home.create-post | mutate:publish-post<br>dismiss:cancel-post<br>mutate:change-type<br>request:add-photo | always | dismiss:home; interactive-or-action:home |
| notifications | push | home | parent:home<br>action:home.open-notifications | navigate:open-source<br>mutate:mark-all-read | always | pop:home |
| post | push | home | parent:home<br>action:home.open-post<br>action:notifications.open-source<br>action:yard.open-incident<br>permission:post.push | mutate:follow-post<br>navigate:open-house-chat<br>mutate:send-comment<br>permission:push | always<br>capability.push.requested | pop:home |
| problem | sheet | home | parent:home | present:null<br>mutate:submit-problem<br>request:add-evidence<br>dismiss:cancel-problem<br>permission:camera | none | dismiss:home; interactive-or-action:home |
| shoot | system | problem | parent:problem<br>permission:problem.camera |  | capability.camera.requested | system-return:problem |
| chronicle | push | home | parent:home<br>permission:home.photos | request:select-photos<br>mutate:share-chronicle | capability.photos.requested | pop:home |
| chats | tab | — | tab:chats | present:null<br>navigate:open-chat | session.authenticated | none:none |
| chat | push | chats | parent:chats<br>action:post.open-house-chat<br>action:chats.open-chat<br>action:profile.open-neighbor-chat | present:null<br>present:null<br>mutate:send-message<br>request:attach-photo<br>request:record-voice<br>permission:mic<br>permission:speech<br>permission:commnotif | always | pop:chats |
| voice | sheet | chat | parent:chat<br>permission:chat.mic<br>permission:chat.speech | mutate:send-voice<br>dismiss:cancel-voice | capability.mic.requested<br>capability.speech.requested | dismiss:chat; interactive-or-action:chat |
| lockscreen | system | chat | parent:chat<br>permission:chat.commnotif |  | capability.commnotif.requested | system-return:chat |
| yard | tab | — | tab:yard | present:null<br>present:null<br>present:null<br>navigate:open-incident<br>navigate:open-yard-event<br>navigate:open-guest<br>navigate:open-meters<br>navigate:open-events | session.authenticated | none:none |
| guest | push | yard | parent:yard<br>action:yard.open-guest<br>permission:guest.hotspot | present:null<br>request:connect-guest<br>request:scan-guest-qr<br>permission:hotspot | always<br>capability.hotspot.requested | pop:yard |
| scan | system | guest | parent:guest |  | none | system-return:guest |
| meters | push | yard | parent:yard<br>action:yard.open-meters<br>permission:background.bgtask | present:null<br>mutate:save-readings<br>request:enable-reminder<br>permission:remotenotif | always<br>capability.bgtask.requested | pop:yard |
| background | system | meters | parent:meters<br>permission:meters.remotenotif<br>permission:settings.fetch | permission:bgtask | capability.remotenotif.requested<br>capability.fetch.requested | system-return:meters |
| events | push | yard | parent:yard<br>action:yard.open-yard-event<br>action:yard.open-events<br>permission:events.calendar | request:add-calendar<br>permission:calendar | always<br>capability.calendar.requested | pop:yard |
| menu | tab | — | tab:menu<br>permission:ads.tracking | present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-access<br>navigate:open-neighbors<br>navigate:open-settings<br>permission:contacts | session.authenticated<br>capability.tracking.requested | none:none |
| passwords | push | menu | parent:menu<br>action:menu.open-access | present:null<br>request:unlock-access<br>permission:autofill | always | pop:menu |
| fill | system | passwords | parent:passwords<br>permission:passwords.autofill |  | capability.autofill.requested | system-return:passwords |
| neighbors | push | menu | parent:menu<br>action:menu.open-neighbors<br>permission:menu.contacts | request:match-contacts<br>navigate:open-neighbor | always<br>capability.contacts.requested | pop:menu |
| profile | push | menu | parent:menu<br>action:neighbors.open-neighbor | navigate:open-neighbor-chat | always | pop:menu |
| settings | push | menu | parent:menu<br>action:menu.open-settings | present:null<br>present:null<br>present:null<br>request:enable-app-lock<br>navigate:open-personalization<br>request:enable-background-updates<br>permission:fetch<br>permission:appgroups<br>permission:faceid | always | pop:menu |
| ads | sheet | settings | parent:settings<br>action:settings.open-personalization | request:enable-personalization<br>mutate:decline-personalization<br>permission:tracking | always | dismiss:settings; interactive-or-action:settings |
| lock | system | settings | parent:settings<br>permission:settings.faceid |  | capability.faceid.requested | system-return:settings |
| widget | system | settings | parent:settings<br>permission:settings.appgroups | permission:keychain | capability.appgroups.requested | system-return:settings |
| pending | state | home | parent:home |  | none | none:none |

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
| pending | Не раскрывать чаты и защищённые сервисы по одной локальной заявке | state | default | System/contract-owned outcome |

## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | continue-email | continue-email:navigate→code | screen.phone.state.loading.recovery | fixture.dvor.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | continue-email | continue-email:navigate→code | screen.phone.state.populated-default.recovery | fixture.dvor.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | continue-email | continue-email:navigate→code | screen.phone.state.error.recovery | fixture.dvor.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | continue-email | continue-email:navigate→code | screen.phone.state.offline.recovery | fixture.dvor.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | confirm-code | confirm-code:navigate→join | screen.code.state.loading.recovery | fixture.dvor.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | confirm-code | confirm-code:navigate→join | screen.code.state.populated-default.recovery | fixture.dvor.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | confirm-code | confirm-code:navigate→join | screen.code.state.error.recovery | fixture.dvor.code.error |
| code | offline | yes | screen.code.state.offline.body | confirm-code | confirm-code:navigate→join | screen.code.state.offline.recovery | fixture.dvor.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.loading.recovery | fixture.dvor.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.populated-default.recovery | fixture.dvor.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.error.recovery | fixture.dvor.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.offline.recovery | fixture.dvor.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| join | loading | yes | screen.join.state.loading.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.loading.recovery | fixture.dvor.join.searching |
| join | populated/default | yes | screen.join.state.populated-default.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.populated-default.recovery | fixture.dvor.join.default |
| join | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| join | error | yes | screen.join.state.error.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.error.recovery | fixture.dvor.join.error |
| join | offline | yes | screen.join.state.offline.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.offline.recovery | fixture.dvor.join.offline |
| join | permission-needed | yes | screen.join.state.permission-needed.body | verify-location<br>manual-address<br>permission.location.fallback | verify-location:request<br>manual-address:navigate→manual | screen.join.state.permission-needed.recovery | fixture.dvor.join.permission-needed |
| join | permission-denied | yes | screen.join.state.permission-denied.body | verify-location<br>manual-address<br>permission.location.fallback | verify-location:request<br>manual-address:navigate→manual | screen.join.state.permission-denied.recovery | fixture.dvor.join.denied |
| join | permission-restricted | yes | screen.join.state.permission-restricted.body | verify-location<br>manual-address<br>permission.location.fallback | verify-location:request<br>manual-address:navigate→manual | screen.join.state.permission-restricted.recovery | fixture.dvor.join.permission-restricted |
| join | permission-limited | yes | screen.join.state.permission-limited.body | verify-location<br>manual-address<br>permission.location.fallback | verify-location:request<br>manual-address:navigate→manual | screen.join.state.permission-limited.recovery | fixture.dvor.join.permission-limited |
| verify | loading | yes | screen.verify.state.loading.body | verify-network<br>manual-verification | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.loading.recovery | fixture.dvor.verify.checking |
| verify | populated/default | yes | screen.verify.state.populated-default.body | verify-network<br>manual-verification | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.populated-default.recovery | fixture.dvor.verify.default<br>fixture.dvor.verify.success |
| verify | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| verify | error | yes | screen.verify.state.error.body | verify-network<br>manual-verification | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.error.recovery | fixture.dvor.verify.mismatch |
| verify | offline | yes | screen.verify.state.offline.body | verify-network<br>manual-verification | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.offline.recovery | fixture.dvor.verify.offline |
| verify | permission-needed | yes | screen.verify.state.permission-needed.body | verify-network<br>manual-verification<br>permission.location.fallback<br>permission.wifiinfo.fallback | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.permission-needed.recovery | fixture.dvor.verify.permission-needed |
| verify | permission-denied | yes | screen.verify.state.permission-denied.body | verify-network<br>manual-verification<br>permission.location.fallback<br>permission.wifiinfo.fallback | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.permission-denied.recovery | fixture.dvor.verify.denied |
| verify | permission-restricted | yes | screen.verify.state.permission-restricted.body | verify-network<br>manual-verification<br>permission.location.fallback<br>permission.wifiinfo.fallback | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.permission-restricted.recovery | fixture.dvor.verify.permission-restricted |
| verify | permission-limited | yes | screen.verify.state.permission-limited.body | verify-network<br>manual-verification<br>permission.location.fallback<br>permission.wifiinfo.fallback | verify-network:request<br>manual-verification:navigate→manual | screen.verify.state.permission-limited.recovery | fixture.dvor.verify.permission-limited |
| manual | loading | yes | screen.manual.state.loading.body | submit-residence | submit-residence:mutate | screen.manual.state.loading.recovery | fixture.dvor.manual.loading |
| manual | populated/default | yes | screen.manual.state.populated-default.body | submit-residence | submit-residence:mutate | screen.manual.state.populated-default.recovery | fixture.dvor.manual.default<br>fixture.dvor.manual.submitted |
| manual | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| manual | error | yes | screen.manual.state.error.body | submit-residence | submit-residence:mutate | screen.manual.state.error.recovery | fixture.dvor.manual.error |
| manual | offline | yes | screen.manual.state.offline.body | submit-residence | submit-residence:mutate | screen.manual.state.offline.recovery | fixture.dvor.manual.offline |
| manual | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| home | loading | yes | screen.home.state.loading.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.loading.recovery | fixture.dvor.home.loading |
| home | populated/default | yes | screen.home.state.populated-default.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.populated-default.recovery | fixture.dvor.home.default<br>fixture.dvor.home.liked<br>fixture.dvor.home.poll<br>fixture.dvor.home.poll-voted<br>fixture.dvor.home.end |
| home | empty | yes | screen.home.state.empty.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.empty.recovery | fixture.dvor.home.empty |
| home | error | yes | screen.home.state.error.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.error.recovery | fixture.dvor.home.error |
| home | offline | yes | screen.home.state.offline.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.offline.recovery | fixture.dvor.home.offline |
| home | permission-needed | yes | screen.home.state.permission-needed.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post<br>permission.wifiinfo.fallback<br>permission.photos.fallback<br>permission.keychain.fallback | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.permission-needed.recovery | fixture.dvor.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post<br>permission.wifiinfo.fallback<br>permission.photos.fallback<br>permission.keychain.fallback | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.permission-denied.recovery | fixture.dvor.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post<br>permission.wifiinfo.fallback<br>permission.photos.fallback<br>permission.keychain.fallback | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.permission-restricted.recovery | fixture.dvor.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | create-post<br>open-notifications<br>open-post<br>like-post<br>share-post<br>permission.wifiinfo.fallback<br>permission.photos.fallback<br>permission.keychain.fallback | create-post:navigate→createpost<br>open-notifications:navigate→notifications<br>open-post:navigate→post<br>like-post:mutate<br>share-post:external | screen.home.state.permission-limited.recovery | fixture.dvor.home.permission-limited |
| createpost | loading | yes | screen.createpost.state.loading.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.loading.recovery | fixture.dvor.createpost.loading |
| createpost | populated/default | yes | screen.createpost.state.populated-default.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.populated-default.recovery | fixture.dvor.createpost.default |
| createpost | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| createpost | error | yes | screen.createpost.state.error.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.error.recovery | fixture.dvor.createpost.error |
| createpost | offline | yes | screen.createpost.state.offline.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.offline.recovery | fixture.dvor.createpost.offline |
| createpost | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| createpost | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| createpost | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| createpost | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| notifications | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| notifications | populated/default | yes | screen.notifications.state.populated-default.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.populated-default.recovery | fixture.dvor.notifications.default |
| notifications | empty | yes | screen.notifications.state.empty.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.empty.recovery | fixture.dvor.notifications.empty |
| notifications | error | yes | screen.notifications.state.error.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.error.recovery | fixture.dvor.notifications.error |
| notifications | offline | yes | screen.notifications.state.offline.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.offline.recovery | fixture.dvor.notifications.offline |
| notifications | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| post | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| post | populated/default | yes | screen.post.state.populated-default.body | follow-post<br>open-house-chat<br>send-comment | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.populated-default.recovery | fixture.dvor.post.default<br>fixture.dvor.post.following<br>fixture.dvor.post.resolved |
| post | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| post | error | yes | screen.post.state.error.body | follow-post<br>open-house-chat<br>send-comment | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.error.recovery | fixture.dvor.post.error |
| post | offline | yes | screen.post.state.offline.body | follow-post<br>open-house-chat<br>send-comment | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.offline.recovery | fixture.dvor.post.offline |
| post | permission-needed | yes | screen.post.state.permission-needed.body | follow-post<br>open-house-chat<br>send-comment<br>permission.push.fallback | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.permission-needed.recovery | fixture.dvor.post.permission-needed |
| post | permission-denied | yes | screen.post.state.permission-denied.body | follow-post<br>open-house-chat<br>send-comment<br>permission.push.fallback | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.permission-denied.recovery | fixture.dvor.post.permission-denied |
| post | permission-restricted | yes | screen.post.state.permission-restricted.body | follow-post<br>open-house-chat<br>send-comment<br>permission.push.fallback | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.permission-restricted.recovery | fixture.dvor.post.permission-restricted |
| post | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| problem | loading | yes | screen.problem.state.loading.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.loading.recovery | fixture.dvor.problem.submitting |
| problem | populated/default | yes | screen.problem.state.populated-default.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.populated-default.recovery | fixture.dvor.problem.default<br>fixture.dvor.problem.success |
| problem | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| problem | error | yes | screen.problem.state.error.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.error.recovery | fixture.dvor.problem.error |
| problem | offline | yes | screen.problem.state.offline.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.offline.recovery | fixture.dvor.problem.offline |
| problem | permission-needed | yes | screen.problem.state.permission-needed.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-needed.recovery | fixture.dvor.problem.permission-needed |
| problem | permission-denied | yes | screen.problem.state.permission-denied.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-denied.recovery | fixture.dvor.problem.permission-denied |
| problem | permission-restricted | yes | screen.problem.state.permission-restricted.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-restricted.recovery | fixture.dvor.problem.permission-restricted |
| problem | permission-limited | yes | screen.problem.state.permission-limited.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-limited.recovery | fixture.dvor.problem.permission-limited |
| shoot | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| shoot | populated/default | yes | screen.shoot.state.populated-default.body |  |  | screen.shoot.state.populated-default.recovery | fixture.dvor.shoot.default |
| shoot | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shoot | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| shoot | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| shoot | permission-needed | yes | screen.shoot.state.permission-needed.body | permission.camera.fallback |  | screen.shoot.state.permission-needed.recovery | fixture.dvor.shoot.permission-needed |
| shoot | permission-denied | yes | screen.shoot.state.permission-denied.body | permission.camera.fallback |  | screen.shoot.state.permission-denied.recovery | fixture.dvor.shoot.denied |
| shoot | permission-restricted | yes | screen.shoot.state.permission-restricted.body | permission.camera.fallback |  | screen.shoot.state.permission-restricted.recovery | fixture.dvor.shoot.permission-restricted |
| shoot | permission-limited | yes | screen.shoot.state.permission-limited.body | permission.camera.fallback |  | screen.shoot.state.permission-limited.recovery | fixture.dvor.shoot.permission-limited |
| chronicle | loading | yes | screen.chronicle.state.loading.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.loading.recovery | fixture.dvor.chronicle.scanning |
| chronicle | populated/default | yes | screen.chronicle.state.populated-default.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.populated-default.recovery | fixture.dvor.chronicle.default<br>fixture.dvor.chronicle.populated<br>fixture.dvor.chronicle.selected |
| chronicle | empty | yes | screen.chronicle.state.empty.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.empty.recovery | fixture.dvor.chronicle.empty |
| chronicle | error | yes | screen.chronicle.state.error.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.error.recovery | fixture.dvor.chronicle.error |
| chronicle | offline | yes | screen.chronicle.state.offline.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.offline.recovery | fixture.dvor.chronicle.offline |
| chronicle | permission-needed | yes | screen.chronicle.state.permission-needed.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-needed.recovery | fixture.dvor.chronicle.permission-needed |
| chronicle | permission-denied | yes | screen.chronicle.state.permission-denied.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-denied.recovery | fixture.dvor.chronicle.denied |
| chronicle | permission-restricted | yes | screen.chronicle.state.permission-restricted.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-restricted.recovery | fixture.dvor.chronicle.permission-restricted |
| chronicle | permission-limited | yes | screen.chronicle.state.permission-limited.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-limited.recovery | fixture.dvor.chronicle.permission-limited |
| chats | loading | yes | screen.chats.state.loading.body | open-chat | open-chat:navigate→chat | screen.chats.state.loading.recovery | fixture.dvor.chats.loading |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.dvor.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.dvor.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.dvor.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.dvor.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.loading.recovery | fixture.dvor.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.populated-default.recovery | fixture.dvor.chat.default |
| chat | empty | yes | screen.chat.state.empty.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.empty.recovery | fixture.dvor.chat.empty |
| chat | error | yes | screen.chat.state.error.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.error.recovery | fixture.dvor.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.offline.recovery | fixture.dvor.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | send-message<br>attach-photo<br>record-voice<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.commnotif.fallback | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.permission-needed.recovery | fixture.dvor.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | send-message<br>attach-photo<br>record-voice<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.commnotif.fallback | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.permission-denied.recovery | fixture.dvor.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | send-message<br>attach-photo<br>record-voice<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.commnotif.fallback | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.permission-restricted.recovery | fixture.dvor.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | yes | screen.voice.state.loading.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.loading.recovery | fixture.dvor.voice.recording<br>fixture.dvor.voice.transcribing |
| voice | populated/default | yes | screen.voice.state.populated-default.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.populated-default.recovery | fixture.dvor.voice.default<br>fixture.dvor.voice.ready |
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.error.recovery | fixture.dvor.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.offline.recovery | fixture.dvor.voice.offline |
| voice | permission-needed | yes | screen.voice.state.permission-needed.body | send-voice<br>cancel-voice<br>permission.mic.fallback<br>permission.speech.fallback | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.permission-needed.recovery | fixture.dvor.voice.permission-needed |
| voice | permission-denied | yes | screen.voice.state.permission-denied.body | send-voice<br>cancel-voice<br>permission.mic.fallback<br>permission.speech.fallback | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.permission-denied.recovery | fixture.dvor.voice.denied |
| voice | permission-restricted | yes | screen.voice.state.permission-restricted.body | send-voice<br>cancel-voice<br>permission.mic.fallback<br>permission.speech.fallback | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.permission-restricted.recovery | fixture.dvor.voice.permission-restricted |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lockscreen | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| lockscreen | populated/default | yes | screen.lockscreen.state.populated-default.body |  |  | screen.lockscreen.state.populated-default.recovery | fixture.dvor.lockscreen.default |
| lockscreen | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lockscreen | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| lockscreen | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| lockscreen | permission-needed | yes | screen.lockscreen.state.permission-needed.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-needed.recovery | fixture.dvor.lockscreen.permission-needed |
| lockscreen | permission-denied | yes | screen.lockscreen.state.permission-denied.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-denied.recovery | fixture.dvor.lockscreen.permission-denied |
| lockscreen | permission-restricted | yes | screen.lockscreen.state.permission-restricted.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-restricted.recovery | fixture.dvor.lockscreen.permission-restricted |
| lockscreen | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| yard | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| yard | populated/default | yes | screen.yard.state.populated-default.body | open-incident<br>open-yard-event<br>open-guest<br>open-meters<br>open-events | open-incident:navigate→post<br>open-yard-event:navigate→events<br>open-guest:navigate→guest<br>open-meters:navigate→meters<br>open-events:navigate→events | screen.yard.state.populated-default.recovery | fixture.dvor.yard.default |
| yard | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| yard | error | yes | screen.yard.state.error.body | open-incident<br>open-yard-event<br>open-guest<br>open-meters<br>open-events | open-incident:navigate→post<br>open-yard-event:navigate→events<br>open-guest:navigate→guest<br>open-meters:navigate→meters<br>open-events:navigate→events | screen.yard.state.error.recovery | fixture.dvor.yard.error |
| yard | offline | yes | screen.yard.state.offline.body | open-incident<br>open-yard-event<br>open-guest<br>open-meters<br>open-events | open-incident:navigate→post<br>open-yard-event:navigate→events<br>open-guest:navigate→guest<br>open-meters:navigate→meters<br>open-events:navigate→events | screen.yard.state.offline.recovery | fixture.dvor.yard.offline |
| yard | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| yard | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| yard | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| yard | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| guest | loading | yes | screen.guest.state.loading.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.loading.recovery | fixture.dvor.guest.connecting |
| guest | populated/default | yes | screen.guest.state.populated-default.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.populated-default.recovery | fixture.dvor.guest.default<br>fixture.dvor.guest.connected |
| guest | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| guest | error | yes | screen.guest.state.error.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.error.recovery | fixture.dvor.guest.error |
| guest | offline | yes | screen.guest.state.offline.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.offline.recovery | fixture.dvor.guest.offline |
| guest | permission-needed | yes | screen.guest.state.permission-needed.body | connect-guest<br>scan-guest-qr<br>permission.hotspot.fallback | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.permission-needed.recovery | fixture.dvor.guest.permission-needed |
| guest | permission-denied | yes | screen.guest.state.permission-denied.body | connect-guest<br>scan-guest-qr<br>permission.hotspot.fallback | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.permission-denied.recovery | fixture.dvor.guest.permission-denied |
| guest | permission-restricted | yes | screen.guest.state.permission-restricted.body | connect-guest<br>scan-guest-qr<br>permission.hotspot.fallback | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.permission-restricted.recovery | fixture.dvor.guest.permission-restricted |
| guest | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| scan | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| scan | populated/default | yes | screen.scan.state.populated-default.body |  |  | screen.scan.state.populated-default.recovery | fixture.dvor.scan.default |
| scan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scan | error | yes | screen.scan.state.error.body |  |  | screen.scan.state.error.recovery | fixture.dvor.scan.error |
| scan | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| scan | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| meters | loading | yes | screen.meters.state.loading.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.loading.recovery | fixture.dvor.meters.editing |
| meters | populated/default | yes | screen.meters.state.populated-default.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.populated-default.recovery | fixture.dvor.meters.default<br>fixture.dvor.meters.submitted |
| meters | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| meters | error | yes | screen.meters.state.error.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.error.recovery | fixture.dvor.meters.error |
| meters | offline | yes | screen.meters.state.offline.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.offline.recovery | fixture.dvor.meters.offline |
| meters | permission-needed | yes | screen.meters.state.permission-needed.body | save-readings<br>enable-reminder<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | save-readings:mutate<br>enable-reminder:request | screen.meters.state.permission-needed.recovery | fixture.dvor.meters.permission-needed |
| meters | permission-denied | yes | screen.meters.state.permission-denied.body | save-readings<br>enable-reminder<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | save-readings:mutate<br>enable-reminder:request | screen.meters.state.permission-denied.recovery | fixture.dvor.meters.permission-denied |
| meters | permission-restricted | yes | screen.meters.state.permission-restricted.body | save-readings<br>enable-reminder<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | save-readings:mutate<br>enable-reminder:request | screen.meters.state.permission-restricted.recovery | fixture.dvor.meters.permission-restricted |
| meters | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| background | populated/default | yes | screen.background.state.populated-default.body |  |  | screen.background.state.populated-default.recovery | fixture.dvor.background.current |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body |  |  | screen.background.state.error.recovery | fixture.dvor.background.stale<br>fixture.dvor.background.error |
| background | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| background | permission-needed | yes | screen.background.state.permission-needed.body | permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.bgtask.fallback |  | screen.background.state.permission-needed.recovery | fixture.dvor.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.bgtask.fallback |  | screen.background.state.permission-denied.recovery | fixture.dvor.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.bgtask.fallback |  | screen.background.state.permission-restricted.recovery | fixture.dvor.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| events | loading | yes | screen.events.state.loading.body | add-calendar | add-calendar:request | screen.events.state.loading.recovery | fixture.dvor.events.loading |
| events | populated/default | yes | screen.events.state.populated-default.body | add-calendar | add-calendar:request | screen.events.state.populated-default.recovery | fixture.dvor.events.default<br>fixture.dvor.events.added |
| events | empty | yes | screen.events.state.empty.body | add-calendar | add-calendar:request | screen.events.state.empty.recovery | fixture.dvor.events.empty |
| events | error | yes | screen.events.state.error.body | add-calendar | add-calendar:request | screen.events.state.error.recovery | fixture.dvor.events.error |
| events | offline | yes | screen.events.state.offline.body | add-calendar | add-calendar:request | screen.events.state.offline.recovery | fixture.dvor.events.offline |
| events | permission-needed | yes | screen.events.state.permission-needed.body | add-calendar<br>permission.calendar.fallback | add-calendar:request | screen.events.state.permission-needed.recovery | fixture.dvor.events.permission-needed |
| events | permission-denied | yes | screen.events.state.permission-denied.body | add-calendar<br>permission.calendar.fallback | add-calendar:request | screen.events.state.permission-denied.recovery | fixture.dvor.events.permission-denied |
| events | permission-restricted | yes | screen.events.state.permission-restricted.body | add-calendar<br>permission.calendar.fallback | add-calendar:request | screen.events.state.permission-restricted.recovery | fixture.dvor.events.permission-restricted |
| events | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| menu | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| menu | populated/default | yes | screen.menu.state.populated-default.body | open-access<br>open-neighbors<br>open-settings | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.populated-default.recovery | fixture.dvor.menu.default |
| menu | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| menu | error | yes | screen.menu.state.error.body | open-access<br>open-neighbors<br>open-settings | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.error.recovery | fixture.dvor.menu.error |
| menu | offline | yes | screen.menu.state.offline.body | open-access<br>open-neighbors<br>open-settings | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.offline.recovery | fixture.dvor.menu.offline |
| menu | permission-needed | yes | screen.menu.state.permission-needed.body | open-access<br>open-neighbors<br>open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.permission-needed.recovery | fixture.dvor.menu.permission-needed |
| menu | permission-denied | yes | screen.menu.state.permission-denied.body | open-access<br>open-neighbors<br>open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.permission-denied.recovery | fixture.dvor.menu.permission-denied |
| menu | permission-restricted | yes | screen.menu.state.permission-restricted.body | open-access<br>open-neighbors<br>open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.permission-restricted.recovery | fixture.dvor.menu.permission-restricted |
| menu | permission-limited | yes | screen.menu.state.permission-limited.body | open-access<br>open-neighbors<br>open-settings<br>permission.contacts.fallback<br>permission.tracking.fallback | open-access:navigate→passwords<br>open-neighbors:navigate→neighbors<br>open-settings:navigate→settings | screen.menu.state.permission-limited.recovery | fixture.dvor.menu.permission-limited |
| passwords | loading | yes | screen.passwords.state.loading.body | unlock-access | unlock-access:request | screen.passwords.state.loading.recovery | fixture.dvor.passwords.loading |
| passwords | populated/default | yes | screen.passwords.state.populated-default.body | unlock-access | unlock-access:request | screen.passwords.state.populated-default.recovery | fixture.dvor.passwords.default<br>fixture.dvor.passwords.populated<br>fixture.dvor.passwords.locked |
| passwords | empty | yes | screen.passwords.state.empty.body | unlock-access | unlock-access:request | screen.passwords.state.empty.recovery | fixture.dvor.passwords.empty |
| passwords | error | yes | screen.passwords.state.error.body | unlock-access | unlock-access:request | screen.passwords.state.error.recovery | fixture.dvor.passwords.error |
| passwords | offline | yes | screen.passwords.state.offline.body | unlock-access | unlock-access:request | screen.passwords.state.offline.recovery | fixture.dvor.passwords.offline |
| passwords | permission-needed | yes | screen.passwords.state.permission-needed.body | unlock-access<br>permission.autofill.fallback | unlock-access:request | screen.passwords.state.permission-needed.recovery | fixture.dvor.passwords.permission-needed |
| passwords | permission-denied | yes | screen.passwords.state.permission-denied.body | unlock-access<br>permission.autofill.fallback | unlock-access:request | screen.passwords.state.permission-denied.recovery | fixture.dvor.passwords.permission-denied |
| passwords | permission-restricted | yes | screen.passwords.state.permission-restricted.body | unlock-access<br>permission.autofill.fallback | unlock-access:request | screen.passwords.state.permission-restricted.recovery | fixture.dvor.passwords.permission-restricted |
| passwords | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| fill | populated/default | yes | screen.fill.state.populated-default.body |  |  | screen.fill.state.populated-default.recovery | fixture.dvor.fill.default |
| fill | empty | yes | screen.fill.state.empty.body |  |  | screen.fill.state.empty.recovery | fixture.dvor.fill.empty |
| fill | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| fill | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | permission.autofill.fallback |  | screen.fill.state.permission-needed.recovery | fixture.dvor.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | permission.autofill.fallback |  | screen.fill.state.permission-denied.recovery | fixture.dvor.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | permission.autofill.fallback |  | screen.fill.state.permission-restricted.recovery | fixture.dvor.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| neighbors | loading | yes | screen.neighbors.state.loading.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.loading.recovery | fixture.dvor.neighbors.loading |
| neighbors | populated/default | yes | screen.neighbors.state.populated-default.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.populated-default.recovery | fixture.dvor.neighbors.default |
| neighbors | empty | yes | screen.neighbors.state.empty.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.empty.recovery | fixture.dvor.neighbors.empty |
| neighbors | error | yes | screen.neighbors.state.error.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.error.recovery | fixture.dvor.neighbors.error |
| neighbors | offline | yes | screen.neighbors.state.offline.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.offline.recovery | fixture.dvor.neighbors.offline |
| neighbors | permission-needed | yes | screen.neighbors.state.permission-needed.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-needed.recovery | fixture.dvor.neighbors.permission-needed |
| neighbors | permission-denied | yes | screen.neighbors.state.permission-denied.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-denied.recovery | fixture.dvor.neighbors.denied |
| neighbors | permission-restricted | yes | screen.neighbors.state.permission-restricted.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-restricted.recovery | fixture.dvor.neighbors.permission-restricted |
| neighbors | permission-limited | yes | screen.neighbors.state.permission-limited.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-limited.recovery | fixture.dvor.neighbors.permission-limited |
| profile | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| profile | populated/default | yes | screen.profile.state.populated-default.body | open-neighbor-chat | open-neighbor-chat:navigate→chat | screen.profile.state.populated-default.recovery | fixture.dvor.profile.default |
| profile | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| profile | error | yes | screen.profile.state.error.body | open-neighbor-chat | open-neighbor-chat:navigate→chat | screen.profile.state.error.recovery | fixture.dvor.profile.error |
| profile | offline | yes | screen.profile.state.offline.body | open-neighbor-chat | open-neighbor-chat:navigate→chat | screen.profile.state.offline.recovery | fixture.dvor.profile.offline |
| profile | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| profile | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| profile | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| profile | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| settings | loading | yes | screen.settings.state.loading.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.loading.recovery | fixture.dvor.settings.loading |
| settings | populated/default | yes | screen.settings.state.populated-default.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.populated-default.recovery | fixture.dvor.settings.default |
| settings | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| settings | error | yes | screen.settings.state.error.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.error.recovery | fixture.dvor.settings.error |
| settings | offline | yes | screen.settings.state.offline.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.offline.recovery | fixture.dvor.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | enable-app-lock<br>open-personalization<br>enable-background-updates<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.faceid.fallback | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.permission-needed.recovery | fixture.dvor.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | enable-app-lock<br>open-personalization<br>enable-background-updates<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.faceid.fallback | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.permission-denied.recovery | fixture.dvor.settings.permission-denied |
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | enable-app-lock<br>open-personalization<br>enable-background-updates<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.faceid.fallback | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.permission-restricted.recovery | fixture.dvor.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | yes | screen.ads.state.loading.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.loading.recovery | fixture.dvor.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.populated-default.recovery | fixture.dvor.ads.default<br>fixture.dvor.ads.accepted<br>fixture.dvor.ads.declined |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.error.recovery | fixture.dvor.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.offline.recovery | fixture.dvor.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | enable-personalization<br>decline-personalization<br>permission.tracking.fallback | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.permission-needed.recovery | fixture.dvor.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | enable-personalization<br>decline-personalization<br>permission.tracking.fallback | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.permission-denied.recovery | fixture.dvor.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | enable-personalization<br>decline-personalization<br>permission.tracking.fallback | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.permission-restricted.recovery | fixture.dvor.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| lock | populated/default | yes | screen.lock.state.populated-default.body |  |  | screen.lock.state.populated-default.recovery | fixture.dvor.lock.locked<br>fixture.dvor.lock.unlocked |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| lock | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | permission.faceid.fallback |  | screen.lock.state.permission-needed.recovery | fixture.dvor.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | permission.faceid.fallback |  | screen.lock.state.permission-denied.recovery | fixture.dvor.lock.permission-denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | permission.faceid.fallback |  | screen.lock.state.permission-restricted.recovery | fixture.dvor.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| widget | populated/default | yes | screen.widget.state.populated-default.body |  |  | screen.widget.state.populated-default.recovery | fixture.dvor.widget.current |
| widget | empty | yes | screen.widget.state.empty.body |  |  | screen.widget.state.empty.recovery | fixture.dvor.widget.empty |
| widget | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| widget | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-needed.recovery | fixture.dvor.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-denied.recovery | fixture.dvor.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-restricted.recovery | fixture.dvor.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| pending | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| pending | populated/default | yes | screen.pending.state.populated-default.body |  |  | screen.pending.state.populated-default.recovery | fixture.dvor.pending.default |
| pending | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| pending | error | yes | screen.pending.state.error.body |  |  | screen.pending.state.error.recovery | fixture.dvor.pending.error |
| pending | offline | yes | screen.pending.state.offline.body |  |  | screen.pending.state.offline.recovery | fixture.dvor.pending.offline |
| pending | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| pending | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| pending | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| pending | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |

## Design tokens and semantic component roles

**SwiftUI environment:** `NativeVisualLanguage`. SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.

| Token | Value |
|---|---|
| accent | #0077FF |
| background | #FFFFFF |
| groupedBackground | #F2F3F5 |
| fill | #E8EAF0 |
| separator | #E7E8EC |
| textPrimary | #000000 |
| textSecondary | #818C99 |
| badge | #FF3347 |

| Surface | Semantic component roles |
|---|---|
| phone | auth-form<br>primary-action |
| code | auth-form<br>primary-action |
| codefail | auth-form<br>primary-action |
| join | form<br>primary-action |
| verify | form<br>primary-action |
| manual | form<br>primary-action |
| home | social-feed |
| createpost | form<br>primary-action |
| notifications | collection |
| post | matter-summary<br>thread<br>next-action |
| problem | form<br>primary-action |
| shoot | system-surface |
| chronicle | collection |
| chats | collection |
| chat | chat<br>message-list<br>composer |
| voice | summary<br>content<br>next-action |
| lockscreen | system-surface |
| yard | service-list |
| guest | task-intro<br>access-data<br>primary-action<br>fallback-action |
| scan | system-surface |
| meters | form<br>primary-action |
| background | system-surface |
| events | collection |
| menu | service-grid |
| passwords | task-intro<br>access-data<br>primary-action<br>fallback-action |
| fill | system-surface |
| neighbors | collection |
| profile | summary<br>content<br>next-action |
| settings | summary<br>content<br>next-action |
| ads | summary<br>content<br>next-action |
| lock | system-surface |
| widget | system-surface |
| pending | detail |

## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.chats.label | Чаты | none | Root tab label | chats | navigation |
| navigation.tab.home.label | Дом | none | Root tab label | home | navigation |
| navigation.tab.menu.label | Меню | none | Root tab label | menu | navigation |
| navigation.tab.yard.label | Двор | none | Root tab label | yard | navigation |
| permission.appgroups.body | Entitlement без системного запроса: виджет и расширения читают данные приложения. | none | System permission explanation | settings<br>widget | permission |
| permission.appgroups.fallback | Без группы виджет пустой, а пересланное объявление не доходит — не ship | none | Denied fallback | widget | recovery |
| permission.appgroups.title | Общий контейнер | none | System permission pre-prompt title | settings<br>widget | permission |
| permission.autofill.body | Entitlement без системного запроса: пароли дома подставляются в Safari системным автозаполнением. | none | System permission explanation | passwords<br>fill | permission |
| permission.autofill.fallback | Пароль остаётся копировать руками из карточки | none | Denied fallback | fill | recovery |
| permission.autofill.title | Автозаполнение паролей | none | System permission pre-prompt title | passwords<br>fill | permission |
| permission.bgtask.body | Entitlement без системного запроса: app.dvor.refresh объявлен в Info.plist и зарегистрирован в коде. | none | System permission explanation | background<br>meters | permission |
| permission.bgtask.fallback | Незарегистрированный идентификатор — задача не запустится вообще | none | Denied fallback | meters | recovery |
| permission.bgtask.title | Идентификатор фоновой задачи | none | System permission pre-prompt title | background<br>meters | permission |
| permission.calendar.body | Чтобы добавить собрание и субботник, а при переносе — поправить уже добавленное событие. | none | System permission explanation | events | permission |
| permission.calendar.fallback | Событие остаётся только внутри «Двора», с напоминанием в приложении | none | Denied fallback | events | recovery |
| permission.calendar.title | «Двор» запрашивает доступ к календарю | none | System permission pre-prompt title | events | permission |
| permission.camera.body | Чтобы снять то, что сломалось, и сканировать QR-код гостевой сети двора. | none | System permission explanation | problem<br>shoot | permission |
| permission.camera.fallback | Остаётся фото из медиатеки и ввод имени сети с паролем руками | none | Denied fallback | shoot | recovery |
| permission.camera.title | «Двор» запрашивает доступ к камере | none | System permission pre-prompt title | problem<br>shoot | permission |
| permission.commnotif.body | Entitlement без системного запроса: уведомление о сообщении соседа показывается с его аватаром. | none | System permission explanation | chat<br>lockscreen | permission |
| permission.commnotif.fallback | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки | none | Denied fallback | lockscreen | recovery |
| permission.commnotif.title | Уведомления как сообщения | none | System permission pre-prompt title | chat<br>lockscreen | permission |
| permission.contacts.body | Чтобы показать, кто из ваших знакомых уже живёт в этом доме. Книга не покидает устройство. | none | System permission explanation | menu<br>neighbors | permission |
| permission.contacts.fallback | Остаётся поиск по номеру квартиры и по подъезду | none | Denied fallback | neighbors | recovery |
| permission.contacts.title | «Двор» запрашивает доступ к контактам | none | System permission pre-prompt title | menu<br>neighbors | permission |
| permission.faceid.body | Чтобы закрыть приложение: в нём адрес, номера квартир и коды от общих дверей. | none | System permission explanation | settings<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | «Двор» запрашивает использование Face ID | none | System permission pre-prompt title | settings<br>lock | permission |
| permission.fetch.body | Entitlement без системного запроса: объявления дома и срок передачи показаний подтягиваются к утру. | none | System permission explanation | settings<br>background | permission |
| permission.fetch.fallback | Без режима лента и срок обновляются в момент открытия | none | Denied fallback | background | recovery |
| permission.fetch.title | Обновление в фоне | none | System permission pre-prompt title | settings<br>background | permission |
| permission.hotspot.body | Приложение настроит подключение к гостевой сети двора по параметрам из QR-кода. | none | System permission explanation | guest | permission |
| permission.hotspot.fallback | Имя сети и пароль показываются текстом — вводится руками в Настройках | none | Denied fallback | guest | recovery |
| permission.hotspot.title | «Двор» подключит вас к сети Dvor-Guest | none | System permission pre-prompt title | guest | permission |
| permission.keychain.body | Entitlement без системного запроса: одна сессия на приложение, виджет и расширения. | none | System permission explanation | widget<br>home | permission |
| permission.keychain.fallback | Без общей группы вход придётся повторять в каждом расширении | none | Denied fallback | home | recovery |
| permission.keychain.title | Общая связка ключей | none | System permission pre-prompt title | widget<br>home | permission |
| permission.location.body | Чтобы проверить, что вы в границах своего двора, и получить право прочитать имя домашней сети. | none | System permission explanation | join<br>verify | permission |
| permission.location.fallback | Остаётся подтверждение адреса вручную — заявку смотрит старший по подъезду | none | Denied fallback | verify | recovery |
| permission.location.title | «Двор» запрашивает доступ к геопозиции | none | System permission pre-prompt title | join<br>verify | permission |
| permission.mic.body | Чтобы записать голосовое в чат подъезда, когда руки заняты сумками. | none | System permission explanation | chat<br>voice | permission |
| permission.mic.fallback | Остаётся текстовое сообщение | none | Denied fallback | voice | recovery |
| permission.mic.title | «Двор» запрашивает доступ к микрофону | none | System permission pre-prompt title | chat<br>voice | permission |
| permission.photos.body | Чтобы найти ваши снимки, сделанные в границах двора, — вы не помните, какие из них здешние. | none | System permission explanation | home<br>chronicle | permission |
| permission.photos.fallback | В хронике остаются только кадры, снятые в приложении | none | Denied fallback | chronicle | recovery |
| permission.photos.title | «Двор» запрашивает доступ к медиатеке | none | System permission pre-prompt title | home<br>chronicle | permission |
| permission.push.body | Пришлём, когда управляющая компания ответит на тему, за которой вы следите. | none | System permission explanation | post | permission |
| permission.push.fallback | Ответы видны при открытии, тема помечается точкой в ленте | none | Denied fallback | post | recovery |
| permission.push.title | «Двор» запрашивает разрешение на уведомления | none | System permission pre-prompt title | post | permission |
| permission.remotenotif.body | Entitlement без системного запроса: тихий пуш обновляет показания и срок, пока приложение закрыто. | none | System permission explanation | meters<br>background | permission |
| permission.remotenotif.fallback | Без режима цифры обновляются только при открытии | none | Denied fallback | background | recovery |
| permission.remotenotif.title | Тихие уведомления | none | System permission pre-prompt title | meters<br>background | permission |
| permission.speech.body | Чтобы рядом с голосовым появилась расшифровка — соседи читают, не включая звук. | none | System permission explanation | chat<br>voice | permission |
| permission.speech.fallback | Голосовое отправляется без расшифровки | none | Denied fallback | voice | recovery |
| permission.speech.title | «Двор» запрашивает доступ к распознаванию речи | none | System permission pre-prompt title | chat<br>voice | permission |
| permission.tracking.body | Тогда реклама будет про местные услуги: сантехник в вашем районе, а не случайный баннер. | none | System permission explanation | ads<br>menu | permission |
| permission.tracking.fallback | Реклама остаётся, но неперсонализированная — не по интересам | none | Denied fallback | menu | recovery |
| permission.tracking.title | Разрешить «Двору» отслеживать действия? | none | System permission pre-prompt title | ads<br>menu | permission |
| permission.wifiinfo.body | Entitlement без системного запроса: имя текущей сети сверяется с сохранённым в профиле дома. | none | System permission explanation | verify<br>home | permission |
| permission.wifiinfo.fallback | Без entitlement подтверждение остаётся только ручным — не ship | none | Denied fallback | home | recovery |
| permission.wifiinfo.title | Чтение имени сети | none | System permission pre-prompt title | verify<br>home | permission |
| scenario.contribute-house-update.failure.name | Создать адресное обновление: ошибка и восстановление | none | Acceptance scenario name | home<br>createpost | acceptance |
| scenario.contribute-house-update.happy.name | Создать адресное обновление: основной путь | none | Acceptance scenario name | home<br>createpost | acceptance |
| scenario.contribute-house-update.offline.name | Создать адресное обновление: без сети | none | Acceptance scenario name | home<br>createpost | acceptance |
| scenario.contribute-house-update.persistence.name | Создать адресное обновление: возврат после перезапуска | none | Acceptance scenario name | home<br>createpost | acceptance |
| scenario.permission.appgroups.denied.name | Виджет «Двор» и Share Extension видят данные приложения: отказ и запасной путь | none | Acceptance scenario name | settings<br>widget | acceptance |
| scenario.permission.autofill.denied.name | Пароли дома подставляются в Safari без копирования: отказ и запасной путь | none | Acceptance scenario name | passwords<br>fill | acceptance |
| scenario.permission.bgtask.denied.name | Идентификатор app.dvor.refresh — под ним планируется обновление: отказ и запасной путь | none | Acceptance scenario name | background<br>meters | acceptance |
| scenario.permission.calendar.denied.name | События дома в календаре, с правкой при переносе даты: отказ и запасной путь | none | Acceptance scenario name | events | acceptance |
| scenario.permission.camera.denied.name | Съёмка проблемы во дворе и сканер QR: отказ и запасной путь | none | Acceptance scenario name | problem<br>shoot | acceptance |
| scenario.permission.commnotif.denied.name | Сообщение соседа приходит с аватаром и попадает в сводку Focus: отказ и запасной путь | none | Acceptance scenario name | chat<br>lockscreen | acceptance |
| scenario.permission.contacts.denied.name | Кто из ваших контактов уже в доме: отказ и запасной путь | none | Acceptance scenario name | menu<br>neighbors | acceptance |
| scenario.permission.faceid.denied.name | Замок на приложении: адрес, номера квартир и коды: отказ и запасной путь | none | Acceptance scenario name | settings<br>lock | acceptance |
| scenario.permission.fetch.denied.name | Объявления дома и срок показаний готовы к первому открытию: отказ и запасной путь | none | Acceptance scenario name | settings<br>background | acceptance |
| scenario.permission.hotspot.denied.name | Подключение к гостевой сети двора по QR-коду с лавочки: отказ и запасной путь | none | Acceptance scenario name | guest | acceptance |
| scenario.permission.keychain.denied.name | Одна сессия: из виджета приложение открывается уже войденным: отказ и запасной путь | none | Acceptance scenario name | widget<br>home | acceptance |
| scenario.permission.location.denied.name | Пропуск в ветку дома: место плюс домашняя сеть: отказ и запасной путь | none | Acceptance scenario name | join<br>verify | acceptance |
| scenario.permission.mic.denied.name | Голосовое сообщение в чат подъезда: отказ и запасной путь | none | Acceptance scenario name | chat<br>voice | acceptance |
| scenario.permission.photos.denied.name | Хроника двора: снимки из медиатеки, попавшие в границы двора: отказ и запасной путь | none | Acceptance scenario name | home<br>chronicle | acceptance |
| scenario.permission.push.denied.name | Уведомление, когда по теме появился ответ: отказ и запасной путь | none | Acceptance scenario name | post | acceptance |
| scenario.permission.remotenotif.denied.name | Тихий пуш обновляет счётчики и виджет при закрытом приложении: отказ и запасной путь | none | Acceptance scenario name | meters<br>background | acceptance |
| scenario.permission.speech.denied.name | Расшифровка голосового в текст рядом с сообщением: отказ и запасной путь | none | Acceptance scenario name | chat<br>voice | acceptance |
| scenario.permission.tracking.denied.name | Реклама местных услуг вместо платной подписки: отказ и запасной путь | none | Acceptance scenario name | ads<br>menu | acceptance |
| scenario.permission.wifiinfo.denied.name | Подтверждение «я дома» по имени домашней сети: отказ и запасной путь | none | Acceptance scenario name | verify<br>home | acceptance |
| scenario.resolve-house-matter.failure.name | Продвинуть дело дома: ошибка и восстановление | none | Acceptance scenario name | home<br>post<br>chat | acceptance |
| scenario.resolve-house-matter.happy.name | Продвинуть дело дома: основной путь | none | Acceptance scenario name | home<br>post<br>chat | acceptance |
| scenario.resolve-house-matter.offline.name | Продвинуть дело дома: без сети | none | Acceptance scenario name | home<br>post<br>chat | acceptance |
| scenario.resolve-house-matter.persistence.name | Продвинуть дело дома: возврат после перезапуска | none | Acceptance scenario name | home<br>post<br>chat | acceptance |
| scenario.verify-residence.failure.name | Подтвердить проживание: ошибка и восстановление | none | Acceptance scenario name | phone<br>join<br>verify<br>home | acceptance |
| scenario.verify-residence.happy.name | Подтвердить проживание: основной путь | none | Acceptance scenario name | phone<br>join<br>verify<br>home | acceptance |
| scenario.verify-residence.offline.name | Подтвердить проживание: без сети | none | Acceptance scenario name | phone<br>join<br>verify<br>home | acceptance |
| scenario.verify-residence.persistence.name | Подтвердить проживание: возврат после перезапуска | none | Acceptance scenario name | phone<br>join<br>verify<br>home | acceptance |
| screen.ads.action.decline-personalization.label | Не сейчас | none | Action label | ads | control |
| screen.ads.action.enable-personalization.label | Учитывать интересы | none | Action label | ads | control |
| screen.ads.purpose | Объяснить выбор персонализации до системного запроса | none | Product task | ads | accessibility-and-docs |
| screen.ads.state.error.body | Не удалось обновить «Реклама». Введённые данные сохранены; повторите попытку. | none | State copy: error | ads | state-body |
| screen.ads.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ads | recovery |
| screen.ads.state.loading.body | Обновляем данные раздела «Реклама»; текущий контекст остаётся доступен. | none | State copy: loading | ads | state-body |
| screen.ads.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | ads | recovery |
| screen.ads.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | ads | state-body |
| screen.ads.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | ads | recovery |
| screen.ads.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | ads | state-body |
| screen.ads.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | ads | recovery |
| screen.ads.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | ads | state-body |
| screen.ads.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | ads | recovery |
| screen.ads.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | ads | state-body |
| screen.ads.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | ads | recovery |
| screen.ads.state.populated-default.body | Актуальные данные раздела «Реклама» готовы к следующему действию. | none | State copy: populated/default | ads | state-body |
| screen.ads.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | ads | recovery |
| screen.ads.title | Реклама | none | Surface title | ads | navigation-title |
| screen.background.purpose | Проверить свежесть фонового обновления дома | none | Product task | background | accessibility-and-docs |
| screen.background.state.error.body | Не удалось обновить «Обновление в фоне». Введённые данные сохранены; повторите попытку. | none | State copy: error | background | state-body |
| screen.background.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | background | recovery |
| screen.background.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | background | state-body |
| screen.background.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | background | recovery |
| screen.background.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | background | state-body |
| screen.background.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | background | recovery |
| screen.background.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | background | state-body |
| screen.background.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | background | recovery |
| screen.background.state.populated-default.body | Актуальные данные раздела «Обновление в фоне» готовы к следующему действию. | none | State copy: populated/default | background | state-body |
| screen.background.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | background | recovery |
| screen.background.title | Обновление в фоне | none | Surface title | background | navigation-title |
| screen.chat.action.attach-photo.label | Добавить фото | none | Action label | chat | control |
| screen.chat.action.record-voice.label | Записать голосовое | none | Action label | chat | control |
| screen.chat.action.send-message.label | Отправить сообщение | none | Action label | chat | control |
| screen.chat.purpose | Обсудить дело с подъездом | none | Product task | chat | accessibility-and-docs |
| screen.chat.state.empty.body | В разделе «Чат подъезда» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | chat | state-body |
| screen.chat.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | chat | recovery |
| screen.chat.state.error.body | Не удалось обновить «Чат подъезда». Введённые данные сохранены; повторите попытку. | none | State copy: error | chat | state-body |
| screen.chat.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chat | recovery |
| screen.chat.state.loading.body | Обновляем данные раздела «Чат подъезда»; текущий контекст остаётся доступен. | none | State copy: loading | chat | state-body |
| screen.chat.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chat | recovery |
| screen.chat.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | chat | state-body |
| screen.chat.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chat | recovery |
| screen.chat.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chat | state-body |
| screen.chat.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chat | recovery |
| screen.chat.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chat | state-body |
| screen.chat.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chat | recovery |
| screen.chat.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chat | state-body |
| screen.chat.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chat | recovery |
| screen.chat.state.populated-default.body | Актуальные данные раздела «Чат подъезда» готовы к следующему действию. | none | State copy: populated/default | chat | state-body |
| screen.chat.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chat | recovery |
| screen.chat.title | Чат подъезда | none | Surface title | chat | navigation-title |
| screen.chats.action.open-chat.label | Открыть чат | none | Action label | chats | control |
| screen.chats.purpose | Вернуться к разговорам дома и подъезда | none | Product task | chats | accessibility-and-docs |
| screen.chats.state.empty.body | В разделе «Чаты» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | chats | state-body |
| screen.chats.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | chats | recovery |
| screen.chats.state.error.body | Не удалось обновить «Чаты». Введённые данные сохранены; повторите попытку. | none | State copy: error | chats | state-body |
| screen.chats.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chats | recovery |
| screen.chats.state.loading.body | Обновляем данные раздела «Чаты»; текущий контекст остаётся доступен. | none | State copy: loading | chats | state-body |
| screen.chats.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chats | recovery |
| screen.chats.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | chats | state-body |
| screen.chats.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chats | recovery |
| screen.chats.state.populated-default.body | Актуальные данные раздела «Чаты» готовы к следующему действию. | none | State copy: populated/default | chats | state-body |
| screen.chats.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chats | recovery |
| screen.chats.title | Чаты | none | Surface title | chats | navigation-title |
| screen.chronicle.action.select-photos.label | Выбрать фотографии | none | Action label | chronicle | control |
| screen.chronicle.action.share-chronicle.label | Поделиться в ленте дома | none | Action label | chronicle | control |
| screen.chronicle.purpose | Отобрать снимки своего двора из медиатеки | none | Product task | chronicle | accessibility-and-docs |
| screen.chronicle.state.empty.body | В разделе «Хроника двора» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | chronicle | state-body |
| screen.chronicle.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | chronicle | recovery |
| screen.chronicle.state.error.body | Не удалось обновить «Хроника двора». Введённые данные сохранены; повторите попытку. | none | State copy: error | chronicle | state-body |
| screen.chronicle.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chronicle | recovery |
| screen.chronicle.state.loading.body | Обновляем данные раздела «Хроника двора»; текущий контекст остаётся доступен. | none | State copy: loading | chronicle | state-body |
| screen.chronicle.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | chronicle | recovery |
| screen.chronicle.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | chronicle | state-body |
| screen.chronicle.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chronicle | recovery |
| screen.chronicle.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chronicle | state-body |
| screen.chronicle.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chronicle | recovery |
| screen.chronicle.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | chronicle | state-body |
| screen.chronicle.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | chronicle | recovery |
| screen.chronicle.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chronicle | state-body |
| screen.chronicle.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chronicle | recovery |
| screen.chronicle.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chronicle | state-body |
| screen.chronicle.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chronicle | recovery |
| screen.chronicle.state.populated-default.body | Актуальные данные раздела «Хроника двора» готовы к следующему действию. | none | State copy: populated/default | chronicle | state-body |
| screen.chronicle.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chronicle | recovery |
| screen.chronicle.title | Хроника двора | none | Surface title | chronicle | navigation-title |
| screen.code.action.confirm-code.label | Продолжить | none | Action label | code | control |
| screen.code.purpose | Подтвердить вход перед выбором дома | none | Product task | code | accessibility-and-docs |
| screen.code.state.error.body | Не удалось обновить «Код из письма». Введённые данные сохранены; повторите попытку. | none | State copy: error | code | state-body |
| screen.code.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | code | recovery |
| screen.code.state.loading.body | Обновляем данные раздела «Код из письма»; текущий контекст остаётся доступен. | none | State copy: loading | code | state-body |
| screen.code.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | code | recovery |
| screen.code.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | code | state-body |
| screen.code.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | code | recovery |
| screen.code.state.populated-default.body | Актуальные данные раздела «Код из письма» готовы к следующему действию. | none | State copy: populated/default | code | state-body |
| screen.code.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | code | recovery |
| screen.code.title | Код из письма | none | Surface title | code | navigation-title |
| screen.codefail.action.complete-codefail.label | Ввести снова | none | Action label | codefail | control |
| screen.codefail.purpose | Объяснить ошибку и вернуть к вводу | none | Product task | codefail | accessibility-and-docs |
| screen.codefail.state.error.body | Не удалось обновить «Неверный код». Введённые данные сохранены; повторите попытку. | none | State copy: error | codefail | state-body |
| screen.codefail.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | codefail | recovery |
| screen.codefail.state.loading.body | Обновляем данные раздела «Неверный код»; текущий контекст остаётся доступен. | none | State copy: loading | codefail | state-body |
| screen.codefail.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | codefail | recovery |
| screen.codefail.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | codefail | state-body |
| screen.codefail.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | codefail | recovery |
| screen.codefail.state.populated-default.body | Актуальные данные раздела «Неверный код» готовы к следующему действию. | none | State copy: populated/default | codefail | state-body |
| screen.codefail.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | codefail | recovery |
| screen.codefail.title | Неверный код | none | Surface title | codefail | navigation-title |
| screen.createpost.action.add-photo.label | Добавить фотографию | none | Action label | createpost | control |
| screen.createpost.action.cancel-post.label | Отмена | none | Action label | createpost | control |
| screen.createpost.action.change-type.label | Изменить тип публикации | none | Action label | createpost | control |
| screen.createpost.action.publish-post.label | Опубликовать | none | Action label | createpost | control |
| screen.createpost.purpose | Создать предсказуемую публикацию для подтверждённых жильцов дома | none | Product task | createpost | accessibility-and-docs |
| screen.createpost.state.error.body | Не удалось обновить «Новая публикация». Введённые данные сохранены; повторите попытку. | none | State copy: error | createpost | state-body |
| screen.createpost.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | createpost | recovery |
| screen.createpost.state.loading.body | Обновляем данные раздела «Новая публикация»; текущий контекст остаётся доступен. | none | State copy: loading | createpost | state-body |
| screen.createpost.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | createpost | recovery |
| screen.createpost.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | createpost | state-body |
| screen.createpost.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | createpost | recovery |
| screen.createpost.state.populated-default.body | Актуальные данные раздела «Новая публикация» готовы к следующему действию. | none | State copy: populated/default | createpost | state-body |
| screen.createpost.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | createpost | recovery |
| screen.createpost.title | Новая публикация | none | Surface title | createpost | navigation-title |
| screen.events.action.add-calendar.label | Добавить в календарь | none | Action label | events | control |
| screen.events.purpose | Увидеть события дома и добавить их в календарь | none | Product task | events | accessibility-and-docs |
| screen.events.state.empty.body | В разделе «События дома» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | events | state-body |
| screen.events.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | events | recovery |
| screen.events.state.error.body | Не удалось обновить «События дома». Введённые данные сохранены; повторите попытку. | none | State copy: error | events | state-body |
| screen.events.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | events | recovery |
| screen.events.state.loading.body | Обновляем данные раздела «События дома»; текущий контекст остаётся доступен. | none | State copy: loading | events | state-body |
| screen.events.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | events | recovery |
| screen.events.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | events | state-body |
| screen.events.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | events | recovery |
| screen.events.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | events | state-body |
| screen.events.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | events | recovery |
| screen.events.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | events | state-body |
| screen.events.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | events | recovery |
| screen.events.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | events | state-body |
| screen.events.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | events | recovery |
| screen.events.state.populated-default.body | Актуальные данные раздела «События дома» готовы к следующему действию. | none | State copy: populated/default | events | state-body |
| screen.events.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | events | recovery |
| screen.events.title | События дома | none | Surface title | events | navigation-title |
| screen.fill.purpose | Подставить доступ дома через системный AutoFill | none | Product task | fill | accessibility-and-docs |
| screen.fill.state.empty.body | В разделе «Автозаполнение в Safari» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | fill | state-body |
| screen.fill.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | fill | recovery |
| screen.fill.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | fill | state-body |
| screen.fill.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | fill | recovery |
| screen.fill.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | fill | state-body |
| screen.fill.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | fill | recovery |
| screen.fill.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | fill | state-body |
| screen.fill.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | fill | recovery |
| screen.fill.state.populated-default.body | Актуальные данные раздела «Автозаполнение в Safari» готовы к следующему действию. | none | State copy: populated/default | fill | state-body |
| screen.fill.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | fill | recovery |
| screen.fill.title | Автозаполнение в Safari | none | Surface title | fill | navigation-title |
| screen.guest.action.connect-guest.label | Подключить это устройство | none | Action label | guest | control |
| screen.guest.action.scan-guest-qr.label | Сканировать QR гостя | none | Action label | guest | control |
| screen.guest.purpose | Подключить гостя к сети без ручного ввода | none | Product task | guest | accessibility-and-docs |
| screen.guest.state.error.body | Не удалось обновить «Гостевая сеть». Введённые данные сохранены; повторите попытку. | none | State copy: error | guest | state-body |
| screen.guest.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | guest | recovery |
| screen.guest.state.loading.body | Обновляем данные раздела «Гостевая сеть»; текущий контекст остаётся доступен. | none | State copy: loading | guest | state-body |
| screen.guest.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | guest | recovery |
| screen.guest.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | guest | state-body |
| screen.guest.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | guest | recovery |
| screen.guest.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | guest | state-body |
| screen.guest.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | guest | recovery |
| screen.guest.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | guest | state-body |
| screen.guest.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | guest | recovery |
| screen.guest.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | guest | state-body |
| screen.guest.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | guest | recovery |
| screen.guest.state.populated-default.body | Актуальные данные раздела «Гостевая сеть» готовы к следующему действию. | none | State copy: populated/default | guest | state-body |
| screen.guest.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | guest | recovery |
| screen.guest.title | Гостевая сеть | none | Surface title | guest | navigation-title |
| screen.home.action.create-post.label | Создать публикацию | none | Action label | home | control |
| screen.home.action.like-post.label | Поставить отметку «Нравится» | none | Action label | home | control |
| screen.home.action.open-notifications.label | Уведомления дома | none | Action label | home | control |
| screen.home.action.open-post.label | Открыть публикацию | none | Action label | home | control |
| screen.home.action.share-post.label | Поделиться публикацией | none | Action label | home | control |
| screen.home.purpose | Читать и создавать публикации соседей: фото, вопросы, объявления, события и проблемы | none | Product task | home | accessibility-and-docs |
| screen.home.state.empty.body | В разделе «Дом» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | home | state-body |
| screen.home.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | home | recovery |
| screen.home.state.error.body | Не удалось обновить «Дом». Введённые данные сохранены; повторите попытку. | none | State copy: error | home | state-body |
| screen.home.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | home | recovery |
| screen.home.state.loading.body | Обновляем данные раздела «Дом»; текущий контекст остаётся доступен. | none | State copy: loading | home | state-body |
| screen.home.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | home | recovery |
| screen.home.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | home | state-body |
| screen.home.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | home | recovery |
| screen.home.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | home | state-body |
| screen.home.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | home | recovery |
| screen.home.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | home | state-body |
| screen.home.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | home | recovery |
| screen.home.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | home | state-body |
| screen.home.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | home | recovery |
| screen.home.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | home | state-body |
| screen.home.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | home | recovery |
| screen.home.state.populated-default.body | Актуальные данные раздела «Дом» готовы к следующему действию. | none | State copy: populated/default | home | state-body |
| screen.home.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | home | recovery |
| screen.home.title | Дом | none | Surface title | home | navigation-title |
| screen.join.action.manual-address.label | Выбрать дом вручную | none | Action label | join | control |
| screen.join.action.verify-location.label | Я рядом — проверить | none | Action label | join | control |
| screen.join.purpose | Найти дом и начать подтверждение проживания | none | Product task | join | accessibility-and-docs |
| screen.join.state.error.body | Не удалось обновить «Найдите свой дом». Введённые данные сохранены; повторите попытку. | none | State copy: error | join | state-body |
| screen.join.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | join | recovery |
| screen.join.state.loading.body | Обновляем данные раздела «Найдите свой дом»; текущий контекст остаётся доступен. | none | State copy: loading | join | state-body |
| screen.join.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | join | recovery |
| screen.join.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | join | state-body |
| screen.join.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | join | recovery |
| screen.join.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | join | state-body |
| screen.join.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | join | recovery |
| screen.join.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | join | state-body |
| screen.join.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | join | recovery |
| screen.join.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | join | state-body |
| screen.join.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | join | recovery |
| screen.join.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | join | state-body |
| screen.join.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | join | recovery |
| screen.join.state.populated-default.body | Актуальные данные раздела «Найдите свой дом» готовы к следующему действию. | none | State copy: populated/default | join | state-body |
| screen.join.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | join | recovery |
| screen.join.title | Найдите свой дом | none | Surface title | join | navigation-title |
| screen.lock.purpose | Защитить адрес, квартиры и коды | none | Product task | lock | accessibility-and-docs |
| screen.lock.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lock | state-body |
| screen.lock.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lock | recovery |
| screen.lock.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lock | state-body |
| screen.lock.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lock | recovery |
| screen.lock.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lock | state-body |
| screen.lock.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lock | recovery |
| screen.lock.state.populated-default.body | Актуальные данные раздела «Замок Face ID» готовы к следующему действию. | none | State copy: populated/default | lock | state-body |
| screen.lock.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lock | recovery |
| screen.lock.title | Замок Face ID | none | Surface title | lock | navigation-title |
| screen.lockscreen.purpose | Показать сообщение соседа как системное общение | none | Product task | lockscreen | accessibility-and-docs |
| screen.lockscreen.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lockscreen | state-body |
| screen.lockscreen.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lockscreen | recovery |
| screen.lockscreen.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lockscreen | state-body |
| screen.lockscreen.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lockscreen | recovery |
| screen.lockscreen.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lockscreen | state-body |
| screen.lockscreen.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lockscreen | recovery |
| screen.lockscreen.state.populated-default.body | Актуальные данные раздела «Экран блокировки» готовы к следующему действию. | none | State copy: populated/default | lockscreen | state-body |
| screen.lockscreen.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lockscreen | recovery |
| screen.lockscreen.title | Экран блокировки | none | Surface title | lockscreen | navigation-title |
| screen.manual.action.submit-residence.label | Сохранить заявку | none | Action label | manual | control |
| screen.manual.purpose | Сохранить заявку на ручное подтверждение без ложного обещания отправки | none | Product task | manual | accessibility-and-docs |
| screen.manual.state.error.body | Не удалось обновить «Адрес вручную». Введённые данные сохранены; повторите попытку. | none | State copy: error | manual | state-body |
| screen.manual.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | manual | recovery |
| screen.manual.state.loading.body | Обновляем данные раздела «Адрес вручную»; текущий контекст остаётся доступен. | none | State copy: loading | manual | state-body |
| screen.manual.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | manual | recovery |
| screen.manual.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | manual | state-body |
| screen.manual.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | manual | recovery |
| screen.manual.state.populated-default.body | Актуальные данные раздела «Адрес вручную» готовы к следующему действию. | none | State copy: populated/default | manual | state-body |
| screen.manual.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | manual | recovery |
| screen.manual.title | Адрес вручную | none | Surface title | manual | navigation-title |
| screen.menu.action.open-access.label | Открыть доступы дома | none | Action label | menu | control |
| screen.menu.action.open-neighbors.label | Открыть соседей | none | Action label | menu | control |
| screen.menu.action.open-settings.label | Открыть настройки | none | Action label | menu | control |
| screen.menu.purpose | Открыть сервисы и защищённые данные дома | none | Product task | menu | accessibility-and-docs |
| screen.menu.state.error.body | Не удалось обновить «Меню». Введённые данные сохранены; повторите попытку. | none | State copy: error | menu | state-body |
| screen.menu.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | menu | recovery |
| screen.menu.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | menu | state-body |
| screen.menu.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | menu | recovery |
| screen.menu.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | menu | state-body |
| screen.menu.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | menu | recovery |
| screen.menu.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | menu | state-body |
| screen.menu.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | menu | recovery |
| screen.menu.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | menu | state-body |
| screen.menu.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | menu | recovery |
| screen.menu.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | menu | state-body |
| screen.menu.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | menu | recovery |
| screen.menu.state.populated-default.body | Актуальные данные раздела «Меню» готовы к следующему действию. | none | State copy: populated/default | menu | state-body |
| screen.menu.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | menu | recovery |
| screen.menu.title | Меню | none | Surface title | menu | navigation-title |
| screen.meters.action.enable-reminder.label | Напомнить о следующем сроке | none | Action label | meters | control |
| screen.meters.action.save-readings.label | Сохранить показания | none | Action label | meters | control |
| screen.meters.purpose | Передать показания вовремя и сохранить черновик локально | none | Product task | meters | accessibility-and-docs |
| screen.meters.state.error.body | Не удалось обновить «Счётчики». Введённые данные сохранены; повторите попытку. | none | State copy: error | meters | state-body |
| screen.meters.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | meters | recovery |
| screen.meters.state.loading.body | Обновляем данные раздела «Счётчики»; текущий контекст остаётся доступен. | none | State copy: loading | meters | state-body |
| screen.meters.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | meters | recovery |
| screen.meters.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | meters | state-body |
| screen.meters.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | meters | recovery |
| screen.meters.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | meters | state-body |
| screen.meters.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | meters | recovery |
| screen.meters.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | meters | state-body |
| screen.meters.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | meters | recovery |
| screen.meters.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | meters | state-body |
| screen.meters.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | meters | recovery |
| screen.meters.state.populated-default.body | Актуальные данные раздела «Счётчики» готовы к следующему действию. | none | State copy: populated/default | meters | state-body |
| screen.meters.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | meters | recovery |
| screen.meters.title | Счётчики | none | Surface title | meters | navigation-title |
| screen.neighbors.action.match-contacts.label | Найти знакомых в контактах | none | Action label | neighbors | control |
| screen.neighbors.action.open-neighbor.label | Открыть профиль соседа | none | Action label | neighbors | control |
| screen.neighbors.purpose | Найти знакомых среди подтверждённых жильцов локально | none | Product task | neighbors | accessibility-and-docs |
| screen.neighbors.state.empty.body | В разделе «Соседи из контактов» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | neighbors | state-body |
| screen.neighbors.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | neighbors | recovery |
| screen.neighbors.state.error.body | Не удалось обновить «Соседи из контактов». Введённые данные сохранены; повторите попытку. | none | State copy: error | neighbors | state-body |
| screen.neighbors.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | neighbors | recovery |
| screen.neighbors.state.loading.body | Обновляем данные раздела «Соседи из контактов»; текущий контекст остаётся доступен. | none | State copy: loading | neighbors | state-body |
| screen.neighbors.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | neighbors | recovery |
| screen.neighbors.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | neighbors | state-body |
| screen.neighbors.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | neighbors | recovery |
| screen.neighbors.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | neighbors | state-body |
| screen.neighbors.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | neighbors | recovery |
| screen.neighbors.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | neighbors | state-body |
| screen.neighbors.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | neighbors | recovery |
| screen.neighbors.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | neighbors | state-body |
| screen.neighbors.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | neighbors | recovery |
| screen.neighbors.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | neighbors | state-body |
| screen.neighbors.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | neighbors | recovery |
| screen.neighbors.state.populated-default.body | Актуальные данные раздела «Соседи из контактов» готовы к следующему действию. | none | State copy: populated/default | neighbors | state-body |
| screen.neighbors.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | neighbors | recovery |
| screen.neighbors.title | Соседи из контактов | none | Surface title | neighbors | navigation-title |
| screen.notifications.action.mark-all-read.label | Прочитать всё | none | Action label | notifications | control |
| screen.notifications.action.open-source.label | Открыть источник уведомления | none | Action label | notifications | control |
| screen.notifications.purpose | Показать изменения дома с однозначным переходом к их источнику | none | Product task | notifications | accessibility-and-docs |
| screen.notifications.state.empty.body | В разделе «Уведомления» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | notifications | state-body |
| screen.notifications.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | notifications | recovery |
| screen.notifications.state.error.body | Не удалось обновить «Уведомления». Введённые данные сохранены; повторите попытку. | none | State copy: error | notifications | state-body |
| screen.notifications.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | notifications | recovery |
| screen.notifications.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | notifications | state-body |
| screen.notifications.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | notifications | recovery |
| screen.notifications.state.populated-default.body | Актуальные данные раздела «Уведомления» готовы к следующему действию. | none | State copy: populated/default | notifications | state-body |
| screen.notifications.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | notifications | recovery |
| screen.notifications.title | Уведомления | none | Surface title | notifications | navigation-title |
| screen.passwords.action.unlock-access.label | Разблокировать доступы | none | Action label | passwords | control |
| screen.passwords.purpose | Использовать защищённые доступы дома | none | Product task | passwords | accessibility-and-docs |
| screen.passwords.state.empty.body | В разделе «Пароли дома» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | passwords | state-body |
| screen.passwords.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | passwords | recovery |
| screen.passwords.state.error.body | Не удалось обновить «Пароли дома». Введённые данные сохранены; повторите попытку. | none | State copy: error | passwords | state-body |
| screen.passwords.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | passwords | recovery |
| screen.passwords.state.loading.body | Обновляем данные раздела «Пароли дома»; текущий контекст остаётся доступен. | none | State copy: loading | passwords | state-body |
| screen.passwords.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | passwords | recovery |
| screen.passwords.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | passwords | state-body |
| screen.passwords.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | passwords | recovery |
| screen.passwords.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | passwords | state-body |
| screen.passwords.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | passwords | recovery |
| screen.passwords.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | passwords | state-body |
| screen.passwords.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | passwords | recovery |
| screen.passwords.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | passwords | state-body |
| screen.passwords.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | passwords | recovery |
| screen.passwords.state.populated-default.body | Актуальные данные раздела «Пароли дома» готовы к следующему действию. | none | State copy: populated/default | passwords | state-body |
| screen.passwords.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | passwords | recovery |
| screen.passwords.title | Пароли дома | none | Surface title | passwords | navigation-title |
| screen.pending.purpose | Объяснить read-only режим и честно отделить локальное сохранение от подтверждения дома | none | Product task | pending | accessibility-and-docs |
| screen.pending.state.error.body | Не удалось обновить «Заявка сохранена». Введённые данные сохранены; повторите попытку. | none | State copy: error | pending | state-body |
| screen.pending.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | pending | recovery |
| screen.pending.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | pending | state-body |
| screen.pending.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | pending | recovery |
| screen.pending.state.populated-default.body | Актуальные данные раздела «Заявка сохранена» готовы к следующему действию. | none | State copy: populated/default | pending | state-body |
| screen.pending.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | pending | recovery |
| screen.pending.title | Заявка сохранена | none | Surface title | pending | navigation-title |
| screen.phone.action.continue-email.label | Получить код | none | Action label | phone | control |
| screen.phone.purpose | Войти и сохранить связь со своим домом | none | Product task | phone | accessibility-and-docs |
| screen.phone.state.error.body | Не удалось обновить «Вход по почте». Введённые данные сохранены; повторите попытку. | none | State copy: error | phone | state-body |
| screen.phone.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | phone | recovery |
| screen.phone.state.loading.body | Обновляем данные раздела «Вход по почте»; текущий контекст остаётся доступен. | none | State copy: loading | phone | state-body |
| screen.phone.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | phone | recovery |
| screen.phone.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | phone | state-body |
| screen.phone.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | phone | recovery |
| screen.phone.state.populated-default.body | Актуальные данные раздела «Вход по почте» готовы к следующему действию. | none | State copy: populated/default | phone | state-body |
| screen.phone.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | phone | recovery |
| screen.phone.title | Вход по почте | none | Surface title | phone | navigation-title |
| screen.post.action.follow-post.label | Следить за изменениями | none | Action label | post | control |
| screen.post.action.open-house-chat.label | Написать в чат дома | none | Action label | post | control |
| screen.post.action.send-comment.label | Отправить комментарий | none | Action label | post | control |
| screen.post.purpose | Разобраться в одном деле дома и выполнить следующее действие | none | Product task | post | accessibility-and-docs |
| screen.post.state.error.body | Не удалось обновить «Объявление». Введённые данные сохранены; повторите попытку. | none | State copy: error | post | state-body |
| screen.post.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | post | recovery |
| screen.post.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | post | state-body |
| screen.post.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | post | recovery |
| screen.post.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | post | state-body |
| screen.post.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | post | recovery |
| screen.post.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | post | state-body |
| screen.post.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | post | recovery |
| screen.post.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | post | state-body |
| screen.post.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | post | recovery |
| screen.post.state.populated-default.body | Актуальные данные раздела «Объявление» готовы к следующему действию. | none | State copy: populated/default | post | state-body |
| screen.post.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | post | recovery |
| screen.post.title | Объявление | none | Surface title | post | navigation-title |
| screen.problem.action.add-evidence.label | Добавить фото | none | Action label | problem | control |
| screen.problem.action.cancel-problem.label | Отмена | none | Action label | problem | control |
| screen.problem.action.submit-problem.label | Сообщить | none | Action label | problem | control |
| screen.problem.purpose | Сообщить о проблеме с местом и доказательством | none | Product task | problem | accessibility-and-docs |
| screen.problem.state.error.body | Не удалось обновить «Сообщить о проблеме». Введённые данные сохранены; повторите попытку. | none | State copy: error | problem | state-body |
| screen.problem.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | problem | recovery |
| screen.problem.state.loading.body | Обновляем данные раздела «Сообщить о проблеме»; текущий контекст остаётся доступен. | none | State copy: loading | problem | state-body |
| screen.problem.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | problem | recovery |
| screen.problem.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | problem | state-body |
| screen.problem.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | problem | recovery |
| screen.problem.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | problem | state-body |
| screen.problem.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | problem | recovery |
| screen.problem.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | problem | state-body |
| screen.problem.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | problem | recovery |
| screen.problem.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | problem | state-body |
| screen.problem.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | problem | recovery |
| screen.problem.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | problem | state-body |
| screen.problem.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | problem | recovery |
| screen.problem.state.populated-default.body | Актуальные данные раздела «Сообщить о проблеме» готовы к следующему действию. | none | State copy: populated/default | problem | state-body |
| screen.problem.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | problem | recovery |
| screen.problem.title | Сообщить о проблеме | none | Surface title | problem | navigation-title |
| screen.profile.action.open-neighbor-chat.label | Написать | none | Action label | profile | control |
| screen.profile.purpose | Связаться с соседом, не раскрывая номер | none | Product task | profile | accessibility-and-docs |
| screen.profile.state.error.body | Не удалось обновить «Профиль соседа». Введённые данные сохранены; повторите попытку. | none | State copy: error | profile | state-body |
| screen.profile.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | profile | recovery |
| screen.profile.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | profile | state-body |
| screen.profile.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | profile | recovery |
| screen.profile.state.populated-default.body | Актуальные данные раздела «Профиль соседа» готовы к следующему действию. | none | State copy: populated/default | profile | state-body |
| screen.profile.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | profile | recovery |
| screen.profile.title | Профиль соседа | none | Surface title | profile | navigation-title |
| screen.scan.purpose | Считать QR-код гостевой сети | none | Product task | scan | accessibility-and-docs |
| screen.scan.state.error.body | Не удалось обновить «Сканер QR». Введённые данные сохранены; повторите попытку. | none | State copy: error | scan | state-body |
| screen.scan.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | scan | recovery |
| screen.scan.state.populated-default.body | Актуальные данные раздела «Сканер QR» готовы к следующему действию. | none | State copy: populated/default | scan | state-body |
| screen.scan.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | scan | recovery |
| screen.scan.title | Сканер QR | none | Surface title | scan | navigation-title |
| screen.settings.action.enable-app-lock.label | Защитить вход | none | Action label | settings | control |
| screen.settings.action.enable-background-updates.label | Обновлять дом в фоне | none | Action label | settings | control |
| screen.settings.action.open-personalization.label | Настроить предложения | none | Action label | settings | control |
| screen.settings.purpose | Управлять приватностью, фоновыми функциями и защитой | none | Product task | settings | accessibility-and-docs |
| screen.settings.state.error.body | Не удалось обновить «Настройки». Введённые данные сохранены; повторите попытку. | none | State copy: error | settings | state-body |
| screen.settings.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | settings | recovery |
| screen.settings.state.loading.body | Обновляем данные раздела «Настройки»; текущий контекст остаётся доступен. | none | State copy: loading | settings | state-body |
| screen.settings.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | settings | recovery |
| screen.settings.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | settings | state-body |
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
| screen.shoot.purpose | Снять доказательство проблемы | none | Product task | shoot | accessibility-and-docs |
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
| screen.verify.action.manual-verification.label | Подтвердить адрес вручную | none | Action label | verify | control |
| screen.verify.action.verify-network.label | Проверить, что я дома | none | Action label | verify | control |
| screen.verify.purpose | Сверить присутствие во дворе и домашнюю сеть | none | Product task | verify | accessibility-and-docs |
| screen.verify.state.error.body | Не удалось обновить «Проверка сети». Введённые данные сохранены; повторите попытку. | none | State copy: error | verify | state-body |
| screen.verify.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | verify | recovery |
| screen.verify.state.loading.body | Обновляем данные раздела «Проверка сети»; текущий контекст остаётся доступен. | none | State copy: loading | verify | state-body |
| screen.verify.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | verify | recovery |
| screen.verify.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | verify | state-body |
| screen.verify.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | verify | recovery |
| screen.verify.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | verify | state-body |
| screen.verify.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | verify | recovery |
| screen.verify.state.permission-limited.body | Доступ ограничен выбранными данными; можно продолжить с доступной частью или изменить выбор. | none | State copy: permission-limited | verify | state-body |
| screen.verify.state.permission-limited.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-limited | verify | recovery |
| screen.verify.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | verify | state-body |
| screen.verify.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | verify | recovery |
| screen.verify.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | verify | state-body |
| screen.verify.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | verify | recovery |
| screen.verify.state.populated-default.body | Актуальные данные раздела «Проверка сети» готовы к следующему действию. | none | State copy: populated/default | verify | state-body |
| screen.verify.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | verify | recovery |
| screen.verify.title | Проверка сети | none | Surface title | verify | navigation-title |
| screen.voice.action.cancel-voice.label | Отменить запись | none | Action label | voice | control |
| screen.voice.action.send-voice.label | Отправить голосовое | none | Action label | voice | control |
| screen.voice.purpose | Записать и расшифровать голосовое сообщение | none | Product task | voice | accessibility-and-docs |
| screen.voice.state.error.body | Не удалось обновить «Голосовое». Введённые данные сохранены; повторите попытку. | none | State copy: error | voice | state-body |
| screen.voice.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | voice | recovery |
| screen.voice.state.loading.body | Обновляем данные раздела «Голосовое»; текущий контекст остаётся доступен. | none | State copy: loading | voice | state-body |
| screen.voice.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | voice | recovery |
| screen.voice.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | voice | state-body |
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
| screen.widget.purpose | Показать отключения и срок показаний до открытия приложения | none | Product task | widget | accessibility-and-docs |
| screen.widget.state.empty.body | В разделе «Виджет на экране «Домой»» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | widget | state-body |
| screen.widget.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | widget | recovery |
| screen.widget.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | widget | state-body |
| screen.widget.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | widget | recovery |
| screen.widget.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | widget | state-body |
| screen.widget.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | widget | recovery |
| screen.widget.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | widget | state-body |
| screen.widget.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | widget | recovery |
| screen.widget.state.populated-default.body | Актуальные данные раздела «Виджет на экране «Домой»» готовы к следующему действию. | none | State copy: populated/default | widget | state-body |
| screen.widget.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | widget | recovery |
| screen.widget.title | Виджет на экране «Домой» | none | Surface title | widget | navigation-title |
| screen.yard.action.open-events.label | Открыть события | none | Action label | yard | control |
| screen.yard.action.open-guest.label | Открыть гостевую сеть | none | Action label | yard | control |
| screen.yard.action.open-incident.label | Открыть текущее дело | none | Action label | yard | control |
| screen.yard.action.open-meters.label | Открыть счётчики | none | Action label | yard | control |
| screen.yard.action.open-yard-event.label | Открыть событие во дворе | none | Action label | yard | control |
| screen.yard.purpose | Открыть инфраструктуру дома одним действием | none | Product task | yard | accessibility-and-docs |
| screen.yard.state.error.body | Не удалось обновить «Двор». Введённые данные сохранены; повторите попытку. | none | State copy: error | yard | state-body |
| screen.yard.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | yard | recovery |
| screen.yard.state.offline.body | Нет сети. Показаны сохранённые данные house-matter; свежесть отмечена явно. | none | State copy: offline | yard | state-body |
| screen.yard.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | yard | recovery |
| screen.yard.state.populated-default.body | Актуальные данные раздела «Двор» готовы к следующему действию. | none | State copy: populated/default | yard | state-body |
| screen.yard.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | yard | recovery |
| screen.yard.title | Двор | none | Surface title | yard | navigation-title |

## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| verify-residence.happy | verify-residence | happy-path | surface:phone<br>fixture:fixture.dvor.phone.default | open-surface:phone<br>open-surface:join<br>open-surface:verify<br>open-surface:home | surface-visible:home<br>outcome-visible:residence-read-only |
| verify-residence.failure | verify-residence | failure-recovery | surface:phone<br>fixture:fixture.dvor.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| verify-residence.offline | verify-residence | offline | surface:phone<br>fixture:fixture.dvor.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| verify-residence.persistence | verify-residence | persistence-return | surface:phone<br>checkpoint-flow:verify-residence | relaunch:application<br>return-to-flow:verify-residence | flow-context-restored:verify-residence<br>surface-visible:phone |
| resolve-house-matter.happy | resolve-house-matter | happy-path | surface:home<br>fixture:fixture.dvor.home.default | perform-action:home.open-post<br>perform-action:post.open-house-chat<br>open-surface:chat | surface-visible:chat<br>outcome-visible:value |
| resolve-house-matter.failure | resolve-house-matter | failure-recovery | surface:home<br>fixture:fixture.dvor.home.error<br>inject-state:error | invoke-recovery:home | recovery-visible:home<br>input-preserved:home |
| resolve-house-matter.offline | resolve-house-matter | offline | surface:home<br>fixture:fixture.dvor.home.offline<br>connectivity:offline | open-surface:home | state-visible:home.offline<br>recovery-visible:home |
| resolve-house-matter.persistence | resolve-house-matter | persistence-return | surface:home<br>checkpoint-flow:resolve-house-matter | relaunch:application<br>return-to-flow:resolve-house-matter | flow-context-restored:resolve-house-matter<br>surface-visible:home |
| contribute-house-update.happy | contribute-house-update | happy-path | surface:home<br>fixture:fixture.dvor.home.default | perform-action:home.create-post<br>open-surface:createpost<br>open-surface:home | surface-visible:home<br>outcome-visible:value |
| contribute-house-update.failure | contribute-house-update | failure-recovery | surface:home<br>fixture:fixture.dvor.home.error<br>inject-state:error | invoke-recovery:home | recovery-visible:home<br>input-preserved:home |
| contribute-house-update.offline | contribute-house-update | offline | surface:home<br>fixture:fixture.dvor.home.offline<br>connectivity:offline | open-surface:home | state-visible:home.offline<br>recovery-visible:home |
| contribute-house-update.persistence | contribute-house-update | persistence-return | surface:home<br>checkpoint-flow:contribute-house-update | relaunch:application<br>return-to-flow:contribute-house-update | flow-context-restored:contribute-house-update<br>surface-visible:home |
| permission.location.denied | permission:location | permission-denial-fallback | surface:join<br>fixture:fixture.dvor.verify.denied<br>permission-status:location.not-determined | deny-permission:location | state-visible:verify.permission-denied<br>fallback-visible:location |
| permission.wifiinfo.denied | permission:wifiinfo | permission-denial-fallback | surface:verify<br>fixture:fixture.dvor.home.permission-denied<br>permission-status:wifiinfo.not-determined | deny-permission:wifiinfo | state-visible:home.permission-denied<br>fallback-visible:wifiinfo |
| permission.camera.denied | permission:camera | permission-denial-fallback | surface:problem<br>fixture:fixture.dvor.shoot.denied<br>permission-status:camera.not-determined | deny-permission:camera | state-visible:shoot.permission-denied<br>fallback-visible:camera |
| permission.photos.denied | permission:photos | permission-denial-fallback | surface:home<br>fixture:fixture.dvor.chronicle.denied<br>permission-status:photos.not-determined | deny-permission:photos | state-visible:chronicle.permission-denied<br>fallback-visible:photos |
| permission.mic.denied | permission:mic | permission-denial-fallback | surface:chat<br>fixture:fixture.dvor.voice.denied<br>permission-status:mic.not-determined | deny-permission:mic | state-visible:voice.permission-denied<br>fallback-visible:mic |
| permission.speech.denied | permission:speech | permission-denial-fallback | surface:chat<br>fixture:fixture.dvor.voice.denied<br>permission-status:speech.not-determined | deny-permission:speech | state-visible:voice.permission-denied<br>fallback-visible:speech |
| permission.push.denied | permission:push | permission-denial-fallback | surface:post<br>fixture:fixture.dvor.post.permission-denied<br>permission-status:push.not-determined | deny-permission:push | state-visible:post.permission-denied<br>fallback-visible:push |
| permission.commnotif.denied | permission:commnotif | permission-denial-fallback | surface:chat<br>fixture:fixture.dvor.lockscreen.permission-denied<br>permission-status:commnotif.not-determined | deny-permission:commnotif | state-visible:lockscreen.permission-denied<br>fallback-visible:commnotif |
| permission.remotenotif.denied | permission:remotenotif | permission-denial-fallback | surface:meters<br>fixture:fixture.dvor.background.permission-denied<br>permission-status:remotenotif.not-determined | deny-permission:remotenotif | state-visible:background.permission-denied<br>fallback-visible:remotenotif |
| permission.fetch.denied | permission:fetch | permission-denial-fallback | surface:settings<br>fixture:fixture.dvor.background.permission-denied<br>permission-status:fetch.not-determined | deny-permission:fetch | state-visible:background.permission-denied<br>fallback-visible:fetch |
| permission.bgtask.denied | permission:bgtask | permission-denial-fallback | surface:background<br>fixture:fixture.dvor.meters.permission-denied<br>permission-status:bgtask.not-determined | deny-permission:bgtask | state-visible:meters.permission-denied<br>fallback-visible:bgtask |
| permission.appgroups.denied | permission:appgroups | permission-denial-fallback | surface:settings<br>fixture:fixture.dvor.widget.permission-denied<br>permission-status:appgroups.not-determined | deny-permission:appgroups | state-visible:widget.permission-denied<br>fallback-visible:appgroups |
| permission.keychain.denied | permission:keychain | permission-denial-fallback | surface:widget<br>fixture:fixture.dvor.home.permission-denied<br>permission-status:keychain.not-determined | deny-permission:keychain | state-visible:home.permission-denied<br>fallback-visible:keychain |
| permission.autofill.denied | permission:autofill | permission-denial-fallback | surface:passwords<br>fixture:fixture.dvor.fill.permission-denied<br>permission-status:autofill.not-determined | deny-permission:autofill | state-visible:fill.permission-denied<br>fallback-visible:autofill |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:guest<br>fixture:fixture.dvor.guest.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:guest.permission-denied<br>fallback-visible:hotspot |
| permission.contacts.denied | permission:contacts | permission-denial-fallback | surface:menu<br>fixture:fixture.dvor.neighbors.denied<br>permission-status:contacts.not-determined | deny-permission:contacts | state-visible:neighbors.permission-denied<br>fallback-visible:contacts |
| permission.calendar.denied | permission:calendar | permission-denial-fallback | surface:events<br>fixture:fixture.dvor.events.permission-denied<br>permission-status:calendar.not-determined | deny-permission:calendar | state-visible:events.permission-denied<br>fallback-visible:calendar |
| permission.faceid.denied | permission:faceid | permission-denial-fallback | surface:settings<br>fixture:fixture.dvor.lock.permission-denied<br>permission-status:faceid.not-determined | deny-permission:faceid | state-visible:lock.permission-denied<br>fallback-visible:faceid |
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.dvor.menu.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:menu.permission-denied<br>fallback-visible:tracking |

## Deterministic fixture catalog

Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.

| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |
|---|---|---|---|---|---|
| fixture.dvor.phone.default | phone / default | dvor.phone.default.primary.001<br>dvor.phone.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.phone.loading | phone / loading | dvor.phone.loading.primary.001<br>dvor.phone.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.phone.error | phone / error | dvor.phone.error.primary.001<br>dvor.phone.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.phone.offline | phone / offline | dvor.phone.offline.primary.001<br>dvor.phone.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.code.default | code / default | dvor.code.default.primary.001<br>dvor.code.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.code.loading | code / loading | dvor.code.loading.primary.001<br>dvor.code.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.code.error | code / error | dvor.code.error.primary.001<br>dvor.code.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.code.offline | code / offline | dvor.code.offline.primary.001<br>dvor.code.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.codefail.default | codefail / default | dvor.codefail.default.primary.001<br>dvor.codefail.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.codefail.loading | codefail / loading | dvor.codefail.loading.primary.001<br>dvor.codefail.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.codefail.error | codefail / error | dvor.codefail.error.primary.001<br>dvor.codefail.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.codefail.offline | codefail / offline | dvor.codefail.offline.primary.001<br>dvor.codefail.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.default | join / default | dvor.join.default.primary.001<br>dvor.join.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.searching | join / searching | dvor.join.searching.primary.001<br>dvor.join.searching.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.denied | join / denied | dvor.join.denied.primary.001<br>dvor.join.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.error | join / error | dvor.join.error.primary.001<br>dvor.join.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.offline | join / offline | dvor.join.offline.primary.001<br>dvor.join.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.permission-needed | join / permission-needed | dvor.join.permission-needed.primary.001<br>dvor.join.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.permission-restricted | join / permission-restricted | dvor.join.permission-restricted.primary.001<br>dvor.join.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.join.permission-limited | join / permission-limited | dvor.join.permission-limited.primary.001<br>dvor.join.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.default | verify / default | dvor.verify.default.primary.001<br>dvor.verify.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.checking | verify / checking | dvor.verify.checking.primary.001<br>dvor.verify.checking.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.success | verify / success | dvor.verify.success.primary.001<br>dvor.verify.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.mismatch | verify / mismatch | dvor.verify.mismatch.primary.001<br>dvor.verify.mismatch.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.denied | verify / denied | dvor.verify.denied.primary.001<br>dvor.verify.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.offline | verify / offline | dvor.verify.offline.primary.001<br>dvor.verify.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.permission-needed | verify / permission-needed | dvor.verify.permission-needed.primary.001<br>dvor.verify.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.permission-restricted | verify / permission-restricted | dvor.verify.permission-restricted.primary.001<br>dvor.verify.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.verify.permission-limited | verify / permission-limited | dvor.verify.permission-limited.primary.001<br>dvor.verify.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.manual.default | manual / default | dvor.manual.default.primary.001<br>dvor.manual.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.manual.submitted | manual / submitted | dvor.manual.submitted.primary.001<br>dvor.manual.submitted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.manual.error | manual / error | dvor.manual.error.primary.001<br>dvor.manual.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.manual.loading | manual / loading | dvor.manual.loading.primary.001<br>dvor.manual.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.manual.offline | manual / offline | dvor.manual.offline.primary.001<br>dvor.manual.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.home.default | home / default | dvor.home.default.primary.001<br>dvor.home.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.empty | home / empty | dvor.home.empty.primary.001<br>dvor.home.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.home.loading | home / loading | dvor.home.loading.primary.001<br>dvor.home.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.liked | home / liked | dvor.home.liked.primary.001<br>dvor.home.liked.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.poll | home / poll | dvor.home.poll.primary.001<br>dvor.home.poll.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.poll-voted | home / poll-voted | dvor.home.poll-voted.primary.001<br>dvor.home.poll-voted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.end | home / end | dvor.home.end.primary.001<br>dvor.home.end.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.error | home / error | dvor.home.error.primary.001<br>dvor.home.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.home.offline | home / offline | dvor.home.offline.primary.001<br>dvor.home.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.home.permission-needed | home / permission-needed | dvor.home.permission-needed.primary.001<br>dvor.home.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.permission-denied | home / permission-denied | dvor.home.permission-denied.primary.001<br>dvor.home.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.permission-restricted | home / permission-restricted | dvor.home.permission-restricted.primary.001<br>dvor.home.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.home.permission-limited | home / permission-limited | dvor.home.permission-limited.primary.001<br>dvor.home.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.home.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.createpost.default | createpost / default | dvor.createpost.default.primary.001<br>dvor.createpost.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.createpost.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.createpost.error | createpost / error | dvor.createpost.error.primary.001<br>dvor.createpost.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.createpost.loading | createpost / loading | dvor.createpost.loading.primary.001<br>dvor.createpost.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.createpost.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.createpost.offline | createpost / offline | dvor.createpost.offline.primary.001<br>dvor.createpost.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.notifications.default | notifications / default | dvor.notifications.default.primary.001<br>dvor.notifications.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.notifications.empty | notifications / empty | dvor.notifications.empty.primary.001<br>dvor.notifications.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.notifications.error | notifications / error | dvor.notifications.error.primary.001<br>dvor.notifications.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.notifications.offline | notifications / offline | dvor.notifications.offline.primary.001<br>dvor.notifications.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.post.default | post / default | dvor.post.default.primary.001<br>dvor.post.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.post.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.post.following | post / following | dvor.post.following.primary.001<br>dvor.post.following.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.post.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.post.resolved | post / resolved | dvor.post.resolved.primary.001<br>dvor.post.resolved.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.post.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.post.error | post / error | dvor.post.error.primary.001<br>dvor.post.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.post.offline | post / offline | dvor.post.offline.primary.001<br>dvor.post.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.post.permission-needed | post / permission-needed | dvor.post.permission-needed.primary.001<br>dvor.post.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.post.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.post.permission-denied | post / permission-denied | dvor.post.permission-denied.primary.001<br>dvor.post.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.post.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.post.permission-restricted | post / permission-restricted | dvor.post.permission-restricted.primary.001<br>dvor.post.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.post.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.default | problem / default | dvor.problem.default.primary.001<br>dvor.problem.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.submitting | problem / submitting | dvor.problem.submitting.primary.001<br>dvor.problem.submitting.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.success | problem / success | dvor.problem.success.primary.001<br>dvor.problem.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.error | problem / error | dvor.problem.error.primary.001<br>dvor.problem.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.problem.offline | problem / offline | dvor.problem.offline.primary.001<br>dvor.problem.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.problem.permission-needed | problem / permission-needed | dvor.problem.permission-needed.primary.001<br>dvor.problem.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.permission-denied | problem / permission-denied | dvor.problem.permission-denied.primary.001<br>dvor.problem.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.permission-restricted | problem / permission-restricted | dvor.problem.permission-restricted.primary.001<br>dvor.problem.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.problem.permission-limited | problem / permission-limited | dvor.problem.permission-limited.primary.001<br>dvor.problem.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.problem.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.shoot.default | shoot / default | dvor.shoot.default.primary.001<br>dvor.shoot.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.shoot.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.shoot.denied | shoot / denied | dvor.shoot.denied.primary.001<br>dvor.shoot.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.shoot.permission-needed | shoot / permission-needed | dvor.shoot.permission-needed.primary.001<br>dvor.shoot.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.shoot.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.shoot.permission-restricted | shoot / permission-restricted | dvor.shoot.permission-restricted.primary.001<br>dvor.shoot.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.shoot.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.shoot.permission-limited | shoot / permission-limited | dvor.shoot.permission-limited.primary.001<br>dvor.shoot.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.shoot.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.default | chronicle / default | dvor.chronicle.default.primary.001<br>dvor.chronicle.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.scanning | chronicle / scanning | dvor.chronicle.scanning.primary.001<br>dvor.chronicle.scanning.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.populated | chronicle / populated | dvor.chronicle.populated.primary.001<br>dvor.chronicle.populated.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.selected | chronicle / selected | dvor.chronicle.selected.primary.001<br>dvor.chronicle.selected.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.empty | chronicle / empty | dvor.chronicle.empty.primary.001<br>dvor.chronicle.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chronicle.denied | chronicle / denied | dvor.chronicle.denied.primary.001<br>dvor.chronicle.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chronicle.error | chronicle / error | dvor.chronicle.error.primary.001<br>dvor.chronicle.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chronicle.offline | chronicle / offline | dvor.chronicle.offline.primary.001<br>dvor.chronicle.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chronicle.permission-needed | chronicle / permission-needed | dvor.chronicle.permission-needed.primary.001<br>dvor.chronicle.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.permission-restricted | chronicle / permission-restricted | dvor.chronicle.permission-restricted.primary.001<br>dvor.chronicle.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chronicle.permission-limited | chronicle / permission-limited | dvor.chronicle.permission-limited.primary.001<br>dvor.chronicle.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.chronicle.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.chats.default | chats / default | dvor.chats.default.primary.001<br>dvor.chats.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chats.empty | chats / empty | dvor.chats.empty.primary.001<br>dvor.chats.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chats.loading | chats / loading | dvor.chats.loading.primary.001<br>dvor.chats.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chats.error | chats / error | dvor.chats.error.primary.001<br>dvor.chats.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chats.offline | chats / offline | dvor.chats.offline.primary.001<br>dvor.chats.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.default | chat / default | dvor.chat.default.primary.001<br>dvor.chat.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.empty | chat / empty | dvor.chat.empty.primary.001<br>dvor.chat.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.loading | chat / loading | dvor.chat.loading.primary.001<br>dvor.chat.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.error | chat / error | dvor.chat.error.primary.001<br>dvor.chat.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.offline | chat / offline | dvor.chat.offline.primary.001<br>dvor.chat.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.permission-needed | chat / permission-needed | dvor.chat.permission-needed.primary.001<br>dvor.chat.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.permission-denied | chat / permission-denied | dvor.chat.permission-denied.primary.001<br>dvor.chat.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.chat.permission-restricted | chat / permission-restricted | dvor.chat.permission-restricted.primary.001<br>dvor.chat.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.default | voice / default | dvor.voice.default.primary.001<br>dvor.voice.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.recording | voice / recording | dvor.voice.recording.primary.001<br>dvor.voice.recording.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.transcribing | voice / transcribing | dvor.voice.transcribing.primary.001<br>dvor.voice.transcribing.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.ready | voice / ready | dvor.voice.ready.primary.001<br>dvor.voice.ready.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.denied | voice / denied | dvor.voice.denied.primary.001<br>dvor.voice.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.error | voice / error | dvor.voice.error.primary.001<br>dvor.voice.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.offline | voice / offline | dvor.voice.offline.primary.001<br>dvor.voice.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.permission-needed | voice / permission-needed | dvor.voice.permission-needed.primary.001<br>dvor.voice.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.voice.permission-restricted | voice / permission-restricted | dvor.voice.permission-restricted.primary.001<br>dvor.voice.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lockscreen.default | lockscreen / default | dvor.lockscreen.default.primary.001<br>dvor.lockscreen.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lockscreen.fallback | lockscreen / fallback | dvor.lockscreen.fallback.primary.001<br>dvor.lockscreen.fallback.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lockscreen.permission-needed | lockscreen / permission-needed | dvor.lockscreen.permission-needed.primary.001<br>dvor.lockscreen.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lockscreen.permission-denied | lockscreen / permission-denied | dvor.lockscreen.permission-denied.primary.001<br>dvor.lockscreen.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lockscreen.permission-restricted | lockscreen / permission-restricted | dvor.lockscreen.permission-restricted.primary.001<br>dvor.lockscreen.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.yard.default | yard / default | dvor.yard.default.primary.001<br>dvor.yard.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.yard.error | yard / error | dvor.yard.error.primary.001<br>dvor.yard.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.yard.offline | yard / offline | dvor.yard.offline.primary.001<br>dvor.yard.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.default | guest / default | dvor.guest.default.primary.001<br>dvor.guest.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.connecting | guest / connecting | dvor.guest.connecting.primary.001<br>dvor.guest.connecting.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.connected | guest / connected | dvor.guest.connected.primary.001<br>dvor.guest.connected.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.error | guest / error | dvor.guest.error.primary.001<br>dvor.guest.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.offline | guest / offline | dvor.guest.offline.primary.001<br>dvor.guest.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.permission-needed | guest / permission-needed | dvor.guest.permission-needed.primary.001<br>dvor.guest.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.permission-denied | guest / permission-denied | dvor.guest.permission-denied.primary.001<br>dvor.guest.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.guest.permission-restricted | guest / permission-restricted | dvor.guest.permission-restricted.primary.001<br>dvor.guest.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.scan.default | scan / default | dvor.scan.default.primary.001<br>dvor.scan.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.scan.denied | scan / denied | dvor.scan.denied.primary.001<br>dvor.scan.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.scan.error | scan / error | dvor.scan.error.primary.001<br>dvor.scan.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.default | meters / default | dvor.meters.default.primary.001<br>dvor.meters.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.editing | meters / editing | dvor.meters.editing.primary.001<br>dvor.meters.editing.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.submitted | meters / submitted | dvor.meters.submitted.primary.001<br>dvor.meters.submitted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.error | meters / error | dvor.meters.error.primary.001<br>dvor.meters.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.offline | meters / offline | dvor.meters.offline.primary.001<br>dvor.meters.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.permission-needed | meters / permission-needed | dvor.meters.permission-needed.primary.001<br>dvor.meters.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.permission-denied | meters / permission-denied | dvor.meters.permission-denied.primary.001<br>dvor.meters.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.meters.permission-restricted | meters / permission-restricted | dvor.meters.permission-restricted.primary.001<br>dvor.meters.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.background.current | background / current | dvor.background.current.primary.001<br>dvor.background.current.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.background.stale | background / stale | dvor.background.stale.primary.001<br>dvor.background.stale.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.background.error | background / error | dvor.background.error.primary.001<br>dvor.background.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.background.permission-needed | background / permission-needed | dvor.background.permission-needed.primary.001<br>dvor.background.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.background.permission-denied | background / permission-denied | dvor.background.permission-denied.primary.001<br>dvor.background.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.background.permission-restricted | background / permission-restricted | dvor.background.permission-restricted.primary.001<br>dvor.background.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.default | events / default | dvor.events.default.primary.001<br>dvor.events.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.empty | events / empty | dvor.events.empty.primary.001<br>dvor.events.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.added | events / added | dvor.events.added.primary.001<br>dvor.events.added.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.error | events / error | dvor.events.error.primary.001<br>dvor.events.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.loading | events / loading | dvor.events.loading.primary.001<br>dvor.events.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.offline | events / offline | dvor.events.offline.primary.001<br>dvor.events.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.permission-needed | events / permission-needed | dvor.events.permission-needed.primary.001<br>dvor.events.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.permission-denied | events / permission-denied | dvor.events.permission-denied.primary.001<br>dvor.events.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.events.permission-restricted | events / permission-restricted | dvor.events.permission-restricted.primary.001<br>dvor.events.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.default | menu / default | dvor.menu.default.primary.001<br>dvor.menu.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.error | menu / error | dvor.menu.error.primary.001<br>dvor.menu.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.offline | menu / offline | dvor.menu.offline.primary.001<br>dvor.menu.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.permission-needed | menu / permission-needed | dvor.menu.permission-needed.primary.001<br>dvor.menu.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.permission-denied | menu / permission-denied | dvor.menu.permission-denied.primary.001<br>dvor.menu.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.permission-restricted | menu / permission-restricted | dvor.menu.permission-restricted.primary.001<br>dvor.menu.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.menu.permission-limited | menu / permission-limited | dvor.menu.permission-limited.primary.001<br>dvor.menu.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.default | passwords / default | dvor.passwords.default.primary.001<br>dvor.passwords.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.populated | passwords / populated | dvor.passwords.populated.primary.001<br>dvor.passwords.populated.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.empty | passwords / empty | dvor.passwords.empty.primary.001<br>dvor.passwords.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.locked | passwords / locked | dvor.passwords.locked.primary.001<br>dvor.passwords.locked.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.loading | passwords / loading | dvor.passwords.loading.primary.001<br>dvor.passwords.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.error | passwords / error | dvor.passwords.error.primary.001<br>dvor.passwords.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.offline | passwords / offline | dvor.passwords.offline.primary.001<br>dvor.passwords.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.permission-needed | passwords / permission-needed | dvor.passwords.permission-needed.primary.001<br>dvor.passwords.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.permission-denied | passwords / permission-denied | dvor.passwords.permission-denied.primary.001<br>dvor.passwords.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.passwords.permission-restricted | passwords / permission-restricted | dvor.passwords.permission-restricted.primary.001<br>dvor.passwords.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.fill.default | fill / default | dvor.fill.default.primary.001<br>dvor.fill.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.fill.empty | fill / empty | dvor.fill.empty.primary.001<br>dvor.fill.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.fill.permission-needed | fill / permission-needed | dvor.fill.permission-needed.primary.001<br>dvor.fill.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.fill.permission-denied | fill / permission-denied | dvor.fill.permission-denied.primary.001<br>dvor.fill.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.fill.permission-restricted | fill / permission-restricted | dvor.fill.permission-restricted.primary.001<br>dvor.fill.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.default | neighbors / default | dvor.neighbors.default.primary.001<br>dvor.neighbors.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.empty | neighbors / empty | dvor.neighbors.empty.primary.001<br>dvor.neighbors.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.denied | neighbors / denied | dvor.neighbors.denied.primary.001<br>dvor.neighbors.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.loading | neighbors / loading | dvor.neighbors.loading.primary.001<br>dvor.neighbors.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.error | neighbors / error | dvor.neighbors.error.primary.001<br>dvor.neighbors.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.offline | neighbors / offline | dvor.neighbors.offline.primary.001<br>dvor.neighbors.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.permission-needed | neighbors / permission-needed | dvor.neighbors.permission-needed.primary.001<br>dvor.neighbors.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.permission-restricted | neighbors / permission-restricted | dvor.neighbors.permission-restricted.primary.001<br>dvor.neighbors.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.neighbors.permission-limited | neighbors / permission-limited | dvor.neighbors.permission-limited.primary.001<br>dvor.neighbors.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.profile.default | profile / default | dvor.profile.default.primary.001<br>dvor.profile.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | dvor.profile.content.001: native/apps/dvor/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.dvor.profile.error | profile / error | dvor.profile.error.primary.001<br>dvor.profile.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.profile.offline | profile / offline | dvor.profile.offline.primary.001<br>dvor.profile.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.default | settings / default | dvor.settings.default.primary.001<br>dvor.settings.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.loading | settings / loading | dvor.settings.loading.primary.001<br>dvor.settings.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.error | settings / error | dvor.settings.error.primary.001<br>dvor.settings.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.offline | settings / offline | dvor.settings.offline.primary.001<br>dvor.settings.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.permission-needed | settings / permission-needed | dvor.settings.permission-needed.primary.001<br>dvor.settings.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.permission-denied | settings / permission-denied | dvor.settings.permission-denied.primary.001<br>dvor.settings.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.settings.permission-restricted | settings / permission-restricted | dvor.settings.permission-restricted.primary.001<br>dvor.settings.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.default | ads / default | dvor.ads.default.primary.001<br>dvor.ads.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.accepted | ads / accepted | dvor.ads.accepted.primary.001<br>dvor.ads.accepted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.declined | ads / declined | dvor.ads.declined.primary.001<br>dvor.ads.declined.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.loading | ads / loading | dvor.ads.loading.primary.001<br>dvor.ads.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.error | ads / error | dvor.ads.error.primary.001<br>dvor.ads.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.offline | ads / offline | dvor.ads.offline.primary.001<br>dvor.ads.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.permission-needed | ads / permission-needed | dvor.ads.permission-needed.primary.001<br>dvor.ads.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.permission-denied | ads / permission-denied | dvor.ads.permission-denied.primary.001<br>dvor.ads.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.ads.permission-restricted | ads / permission-restricted | dvor.ads.permission-restricted.primary.001<br>dvor.ads.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lock.locked | lock / locked | dvor.lock.locked.primary.001<br>dvor.lock.locked.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lock.unlocked | lock / unlocked | dvor.lock.unlocked.primary.001<br>dvor.lock.unlocked.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lock.fallback | lock / fallback | dvor.lock.fallback.primary.001<br>dvor.lock.fallback.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lock.permission-needed | lock / permission-needed | dvor.lock.permission-needed.primary.001<br>dvor.lock.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lock.permission-denied | lock / permission-denied | dvor.lock.permission-denied.primary.001<br>dvor.lock.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.lock.permission-restricted | lock / permission-restricted | dvor.lock.permission-restricted.primary.001<br>dvor.lock.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.widget.current | widget / current | dvor.widget.current.primary.001<br>dvor.widget.current.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.widget.stale | widget / stale | dvor.widget.stale.primary.001<br>dvor.widget.stale.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.widget.empty | widget / empty | dvor.widget.empty.primary.001<br>dvor.widget.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.widget.permission-needed | widget / permission-needed | dvor.widget.permission-needed.primary.001<br>dvor.widget.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.widget.permission-denied | widget / permission-denied | dvor.widget.permission-denied.primary.001<br>dvor.widget.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.widget.permission-restricted | widget / permission-restricted | dvor.widget.permission-restricted.primary.001<br>dvor.widget.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.pending.default | pending / default | dvor.pending.default.primary.001<br>dvor.pending.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.pending.error | pending / error | dvor.pending.error.primary.001<br>dvor.pending.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |
| fixture.dvor.pending.offline | pending / offline | dvor.pending.offline.primary.001<br>dvor.pending.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/dvor/concept.json + native/apps/dvor | no media |

## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| location | Пропуск в ветку дома: место плюс домашняя сеть: Чтобы проверить, что вы в границах своего двора, и получить право прочитать имя домашней сети. | Только после явного действия пользователя «Я дома — проверить» | join → verify в рамках Пропуск в ветку дома: место плюс домашняя сеть | Остаётся подтверждение адреса вручную — заявку смотрит старший по подъезду | contextual-gesture |
| wifiinfo | Подтверждение «я дома» по имени домашней сети: Entitlement без системного запроса: имя текущей сети сверяется с сохранённым в профиле дома. | Только после явного действия пользователя «Проверить сеть» | verify → home в рамках Подтверждение «я дома» по имени домашней сети | Без entitlement подтверждение остаётся только ручным — не ship | build-artifact |
| camera | Съёмка проблемы во дворе и сканер QR: Чтобы снять то, что сломалось, и сканировать QR-код гостевой сети двора. | Только после явного действия пользователя «Снять» и «Сканировать QR» | problem → shoot в рамках Съёмка проблемы во дворе и сканер QR | Остаётся фото из медиатеки и ввод имени сети с паролем руками | contextual-gesture |
| photos | Хроника двора: снимки из медиатеки, попавшие в границы двора: Чтобы найти ваши снимки, сделанные в границах двора, — вы не помните, какие из них здешние. | Только после явного действия пользователя «Собрать хронику» | home → chronicle в рамках Хроника двора: снимки из медиатеки, попавшие в границы двора | В хронике остаются только кадры, снятые в приложении | contextual-gesture |
| mic | Голосовое сообщение в чат подъезда: Чтобы записать голосовое в чат подъезда, когда руки заняты сумками. | Только после явного действия пользователя «Записать голосовое» | chat → voice в рамках Голосовое сообщение в чат подъезда | Остаётся текстовое сообщение | contextual-gesture |
| speech | Расшифровка голосового в текст рядом с сообщением: Чтобы рядом с голосовым появилась расшифровка — соседи читают, не включая звук. | Только после явного действия пользователя «Записать голосовое» — цепочкой с микрофоном | chat → voice в рамках Расшифровка голосового в текст рядом с сообщением | Голосовое отправляется без расшифровки | contextual-gesture |
| push | Уведомление, когда по теме появился ответ: Пришлём, когда управляющая компания ответит на тему, за которой вы следите. | Только после явного действия пользователя «Следить за темой» | post → post в рамках Уведомление, когда по теме появился ответ | Ответы видны при открытии, тема помечается точкой в ленте | contextual-gesture |
| commnotif | Сообщение соседа приходит с аватаром и попадает в сводку Focus: Entitlement без системного запроса: уведомление о сообщении соседа показывается с его аватаром. | Только после явного действия пользователя «Показывать как сообщение» | chat → lockscreen в рамках Сообщение соседа приходит с аватаром и попадает в сводку Focus | Без entitlement уведомление обычное: имя в тексте, без аватара и вне сводки | build-artifact |
| remotenotif | Тихий пуш обновляет счётчики и виджет при закрытом приложении: Entitlement без системного запроса: тихий пуш обновляет показания и срок, пока приложение закрыто. | Только после явного действия пользователя «Обновлять в фоне» | meters → background в рамках Тихий пуш обновляет счётчики и виджет при закрытом приложении | Без режима цифры обновляются только при открытии | app-lifecycle |
| fetch | Объявления дома и срок показаний готовы к первому открытию: Entitlement без системного запроса: объявления дома и срок передачи показаний подтягиваются к утру. | Только после явного действия пользователя «Обновление в фоне» | settings → background в рамках Объявления дома и срок показаний готовы к первому открытию | Без режима лента и срок обновляются в момент открытия | app-lifecycle |
| bgtask | Идентификатор app.dvor.refresh — под ним планируется обновление: Entitlement без системного запроса: app.dvor.refresh объявлен в Info.plist и зарегистрирован в коде. | Только после явного действия пользователя «Проверить задачу» | background → meters в рамках Идентификатор app.dvor.refresh — под ним планируется обновление | Незарегистрированный идентификатор — задача не запустится вообще | app-lifecycle |
| appgroups | Виджет «Двор» и Share Extension видят данные приложения: Entitlement без системного запроса: виджет и расширения читают данные приложения. | Только после явного действия пользователя «Виджет на экран „Домой“» | settings → widget в рамках Виджет «Двор» и Share Extension видят данные приложения | Без группы виджет пустой, а пересланное объявление не доходит — не ship | build-artifact |
| keychain | Одна сессия: из виджета приложение открывается уже войденным: Entitlement без системного запроса: одна сессия на приложение, виджет и расширения. | Только после явного действия пользователя «Открыть Двор» из виджета | widget → home в рамках Одна сессия: из виджета приложение открывается уже войденным | Без общей группы вход придётся повторять в каждом расширении | build-artifact |
| autofill | Пароли дома подставляются в Safari без копирования: Entitlement без системного запроса: пароли дома подставляются в Safari системным автозаполнением. | Только после явного действия пользователя «Включить автозаполнение» | passwords → fill в рамках Пароли дома подставляются в Safari без копирования | Пароль остаётся копировать руками из карточки | contextual-gesture |
| hotspot | Подключение к гостевой сети двора по QR-коду с лавочки: Приложение настроит подключение к гостевой сети двора по параметрам из QR-кода. | Только после явного действия пользователя «Подключиться» | guest → guest в рамках Подключение к гостевой сети двора по QR-коду с лавочки | Имя сети и пароль показываются текстом — вводится руками в Настройках | build-artifact |
| contacts | Кто из ваших контактов уже в доме: Чтобы показать, кто из ваших знакомых уже живёт в этом доме. Книга не покидает устройство. | Только после явного действия пользователя «Найти среди контактов» | menu → neighbors в рамках Кто из ваших контактов уже в доме | Остаётся поиск по номеру квартиры и по подъезду | contextual-gesture |
| calendar | События дома в календаре, с правкой при переносе даты: Чтобы добавить собрание и субботник, а при переносе — поправить уже добавленное событие. | Только после явного действия пользователя «Добавить в Календарь» | events → events в рамках События дома в календаре, с правкой при переносе даты | Событие остаётся только внутри «Двора», с напоминанием в приложении | contextual-gesture |
| faceid | Замок на приложении: адрес, номера квартир и коды: Чтобы закрыть приложение: в нём адрес, номера квартир и коды от общих дверей. | Только после явного действия пользователя «Замок Face ID» | settings → lock в рамках Замок на приложении: адрес, номера квартир и коды | Остаётся код-пароль устройства | contextual-gesture |
| tracking | Реклама местных услуг вместо платной подписки: Тогда реклама будет про местные услуги: сантехник в вашем районе, а не случайный баннер. | Только после явного действия пользователя «Продолжить» | ads → menu в рамках Реклама местных услуг вместо платной подписки | Реклама остаётся, но неперсонализированная — не по интересам | contextual-gesture |

**Entitlements:** `com.apple.developer.networking.wifi-info`, `aps-environment`, `com.apple.developer.usernotifications.communication`, `com.apple.security.application-groups`, `keychain-access-groups`, `com.apple.developer.networking.HotspotConfiguration`
**Extension targets:** `notification-service`, `credential-provider`, `widget`

## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product model | Владеет Дело дома, состояниями core loop и правилами доверия | native/apps/dvor |
| Product development | Владеет Brief, кандидатами, receipt и зрелым Product Contract | concepts/dvor/concept.json |
| UX specification | Владеет графом, состояниями, языком, сценариями и fixtures | concepts/dvor/concept.json#ux |
| Runtime adapters | Владеет системными разрешениями и capability lifecycle без создания фиктивного успеха | native/Runtime |
| VK reference profile | Владеет только доказанной визуальной и интеракционной грамматикой референса | native/ReferenceProfiles/vk-ios |

**Boundaries**
- Product model не зависит от визуальных рецептов референса
- UX Specification описывает семантику, но не дублирует SwiftUI hierarchy
- Runtime adapter не может объявить продуктовый успех без наблюдаемого outcome
- Generated files не становятся источником продуктовой истины

## Data, state, persistence, and integrations

**Entities**

- Дело дома
- House
- Жилец
- Residence
- Защищённый доступ
- Пользовательская сессия
- Черновик
- Разрешение

**State**

- Сессия и доступ к продукту
- Коллекция и detail для Дело дома
- Асинхронные loading/error состояния
- Permission state и denied fallback
- Локальный черновик и подтверждённый outcome

**Persistence**

- UserDefaults только для небольших явных настроек и локального восстановления
- Keychain или App Group только по capability contract
- Черновик сохраняется до отправки или явной отмены
- Удалённые записи требуют отдельно одобренного provider adapter

**Integrations**

- Системные iOS frameworks из capability manifest
- Одобренный identity/provider adapter
- Notification adapter после явной подписки
- Reference profile используется только для визуального и интеракционного соответствия

## Loading, empty, error, denied, and offline states

| State | Required behavior |
|---|---|
| loading | Сохранять контекст задачи, блокировать повторную отправку и объяснять выполняемую операцию. |
| empty | Объяснять отсутствие Дело дома и предлагать конкретное создание или discovery-действие без фиктивного контента. |
| error | Называть неуспешную операцию, сохранять ввод и давать повтор или полезный fallback. |
| denied | Оставлять задачу достижимой через declared denied fallback соответствующего разрешения. |
| offline | Показывать сохранённые данные и черновики, явно отмечать stale remote state и предлагать повтор. |

## Privacy, security, and trust

**Data inventory**

- Адрес, подъезд и статус Residence
- Дела дома, сообщения и локальные события
- Опциональные фото, контакты, показания и защищённые доступы

**Privacy principles**

- Не хранить историю перемещений
- Отделять социальные данные от защищённых доступов
- Не показывать квартиру за пределами House без явной причины

**Retention.** Черновики и capability-derived data хранятся минимально; опубликованные данные и спорные действия имеют явные правила удаления и retention.

**Trust and safety risks**

- Ложное подтверждение проживания
- Публикация адресных данных наружу
- Травля соседа или раскрытие защищённого доступа

**Controls**

- Проверка Residence и read-only ожидание
- House-scoped visibility
- Жалоба, блокировка и отдельная защита доступов

**Reporting.** Жалоба сохраняет контекст объекта и автора, немедленно скрывает опасное взаимодействие и не требует продолжать основной flow.

## Accessibility and localization

**Accessibility**

- VoiceOver order следует иерархии продуктовой задачи
- Все интерактивные цели не меньше 44pt
- Accessibility XXXL не скрывает основной outcome
- Reduced Motion не меняет смысл состояния
- Цвет не является единственным носителем статуса

**Locales:** ru

**Localization requirements**

- Каждая пользовательская строка имеет стабильный key
- Плейсхолдеры и числительные не собираются конкатенацией
- Длинные имена, адреса и Accessibility XXXL входят в stress fixtures

## Analytics event plan and success metrics

**Events**

- product_opened
- activation_completed
- primary_unit_opened
- core_loop_action_completed
- contribution_published
- permission_requested
- permission_denied_fallback_used
- recovery_completed

**Success metrics**

- Доля завершения activation
- Первое и второе завершение core loop
- Вклад после получения ценности
- Завершение задачи через denied fallback
- Восстановление после ошибки и offline

**Core-loop hypothesis.** Конкретная полученная ценность повышает вероятность следующего содержательного вклада сильнее пассивной реакции

**Validation plan.** Провести ограниченный cohort pilot, измерить completion и разобрать причины отказа без подмены результата simulator evidence

## Testing, evidence, and capture plan

**Levels**

- Product artifact reproduction
- UX contract and interaction replay
- Swift and XCUI smoke
- Deterministic capture comparison
- Independent product and visual review

**Evidence**

- Не повышать статус market-validation-needed без источника
- Разделять реализованность, reference evidence и пользовательский спрос
- Записывать provenance каждого нового продуктового утверждения

**Capture identifiers**

- phone--default
- phone--loading
- phone--error
- join--default
- join--searching
- join--denied
- verify--default
- verify--checking
- verify--success
- verify--mismatch
- verify--denied
- manual--default
- manual--submitted
- manual--error
- home--default
- home--empty
- home--loading
- home--liked
- home--poll
- home--poll-voted
- home--end
- createpost--default
- createpost--error
- notifications--default
- notifications--empty
- post--default
- post--following
- post--resolved
- problem--default
- problem--submitting
- problem--success
- problem--error
- shoot--default
- shoot--denied
- chronicle--default
- chronicle--scanning
- chronicle--populated
- chronicle--selected
- chronicle--empty
- chronicle--denied
- chats--default
- chats--empty
- chats--loading
- chat--default
- chat--empty
- voice--default
- voice--recording
- voice--transcribing
- voice--ready
- voice--denied
- lockscreen--default
- lockscreen--fallback
- yard--default
- guest--default
- guest--connecting
- guest--connected
- guest--error
- scan--default
- scan--denied
- scan--error
- meters--default
- meters--editing
- meters--submitted
- meters--error
- background--current
- background--stale
- background--error
- events--default
- events--empty
- events--added
- events--error
- menu--default
- passwords--default
- passwords--populated
- passwords--empty
- passwords--locked
- fill--default
- fill--empty
- neighbors--default
- neighbors--empty
- neighbors--denied
- profile--default
- settings--default
- ads--default
- ads--accepted
- ads--declined
- lock--locked
- lock--unlocked
- lock--fallback
- widget--current
- widget--stale
- widget--empty
- pending--default

**Evidence provenance**

- approved-product-direction · user-input · approved · concepts/dvor/concept.json: accepted product, positioning, and scope before this selection review
- implemented-native-observation · experiment · observed · native/apps/dvor plus deterministic action, replay, capture, and build checks
- vk-reference-profile · reference-profile · approved · native/ReferenceProfiles/vk-ios/profile.json and its declared screenshot evidence
- market-validation-needed · assumption · needs-validation · Product hypotheses in concepts/dvor/concept.json require interviews and a live cohort pilot

## Setup, build, and run

**Prerequisites**

- Node 22
- Xcode с iOS 26 simulator
- Проверенный embedded Product Development artifact

**Build**

- `npm run build -- dvor`

**Run and verify**

- `npm run smoke -- dvor`
- `npm run capture -- dvor`

## Generated and owned file map

| Generated — do not hand-edit | Product-owned source |
|---|---|
| native/build/dvor<br>concepts/dvor/docs/developer-guide.md<br>product-contract.json<br>selection-receipt.json<br>ux-specification.json | concepts/dvor/concept.json<br>native/apps/dvor<br>native/apps/dvor/capture.json |

## Limitations, risks, and acceptance criteria

**Limitations**

- Курируемый отбор фиксирует продуктовую связность, но не заменяет генерацию реальной моделью для нового brief
- Нет подтверждённого исследования спроса, supply и retention
- Удалённые provider contracts требуют отдельного evidence intake
- Физическое устройство и VoiceOver остаются human gates

**Risks**

- risk: Реального supply для Дело дома недостаточно после seed-набора; mitigation: Проверить ограниченный cohort и вклад после получения ценности до масштабирования; killSignal: После четырёх недель активная cohort не создаёт минимально достаточное число релевантных единиц
- risk: Знакомая VK-модель скрывает собственный продуктовый outcome за пассивными реакциями; mitigation: Сохранять primary action и статус outcome заметнее декоративной engagement-механики; killSignal: Большинство активных пользователей ограничивается реакциями и не завершает core loop

**Assumptions still requiring evidence**

- claim: Для соседской сети доверие начинается не с общих интересов, а с доказуемой связи с одним адресом и общей инфраструктурой.; risk: high; validation: Problem interviews и наблюдение текущего поведения целевой аудитории; status: needs-validation
- claim: Жильцы создают дела из реальных событий, а регулярные сроки и статусы инфраструктуры пополняют полезный контекст; risk: high; validation: Четырёхнедельный supply pilot с разбором причин создания и отказа; status: needs-validation
- claim: Стоимость завершённого дела и поддержки активного House ниже согласованной операционной экономии; risk: medium; validation: Посчитать реальные операционные издержки после подтверждения core loop; status: needs-validation

**Acceptance criteria**

- Embedded receipt и Product Contract воспроизводятся из Brief и трёх кандидатов
- Все maturity gates победителя проходят с floor не ниже 3/4
- Каждый action имеет outcome, а каждое разрешение — timing и denied fallback
- Все критические flows покрыты happy, failure, offline и persistence scenarios
- Каждое снимаемое состояние имеет deterministic fixture

## App Store notes

- Permission copy должна совпадать с reachable behavior и privacy labels
- Не заявлять market validation или удалённую интеграцию без evidence
- Reference mimicry не означает связь продукта с VK или право на бренд
- Защищённые данные и пользовательский контент требуют отдельной проверки retention и удаления
