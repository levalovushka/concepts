# Образы: developer product guide

> Generated from Product Contract `product-c7a34fc8d0b5f44f` and the compiled native manifest. Do not edit by hand.
> UX Specification: `ux-232b00c4feabe1f8`; source: `legacy-migration`.
> Contract status: `migration-baseline`; maturity floor: `3/4`.

## Product vision and scope

**Thesis.** Найти носибельный образ и разобрать его на вещи

**Audience.** Люди 18–35 лет, которые собирают повседневный стиль без стилиста

**Situation.** Нужно придумать образ из уже знакомых вещей или поделиться удачным сочетанием

**Job.** Люди 18–35 лет, которые собирают повседневный стиль без стилиста wants to Маркетплейсы продают отдельные товары, а вдохновение теряется между сохранёнными картинками so that Найти носибельный образ и разобрать его на вещи.

**Wedge.** Социальная единица — образ из реального гардероба, а не товарная карточка

**Observable differentiation.** Отметки вещей на фото; Профиль как живой гардероб; Ремикс образа своими вещами; measured by Reach and complete create; threshold: The declared vertical slice completes with one observable product outcome.

**In scope**

- Look
- Снять образ
- Публикация из медиатеки
- Голосовые сообщения
- События стиля рядом
- Уведомления о подписках и ответах
- Чаты с аватарами в уведомлениях
- Актуальная серия клипов
- Свежая лента к запуску
- Виджет сохранённого образа
- Один вход для приложения и виджета
- Вход на сайт марки сохранённой связкой
- Отметка «я на свопе» подтверждается сетью площадки, а не словом участника
- Кто из ваших контактов уже в «Образах»
- Реклама марок и локальных магазинов вместо платной подписки
- Замок на «Сохранённом»: приватные подборки и черновики не видны через плечо
- Субтитры к снятому клипу без ручного набора
- Разбор гардероба голосом в фоне: Now Playing и ±15 секунд с локскрина
- Созвон по свопу без обмена номерами: телефон остаётся у владельца
- Своп и встреча сообщества в системном календаре, с правкой при переносе и удалением при отмене
- Поделиться в «Образы» из Safari, «Фото» и мессенджеров — ссылка или кадр падает в черновик образа
- Подключение к гостевой сети площадки по QR — без него отметка на свопе не проходит

**Non-goals**

- Маркетплейс
- Услуги стилиста
- Генерация лиц и тел

## Domain glossary

| Term | Definition |
|---|---|
| Look | A wearable combination published as one social content unit. |
| Wardrobe | A person's saved and owned clothing context for assembling Looks. |
| Remix | A new Look assembled in response to another person's Look. |

## Personas and jobs

| Persona | Context | Job |
|---|---|---|
| Primary persona | Люди 18–35 лет, которые собирают повседневный стиль без стилиста | Найти носибельный образ и разобрать его на вещи |

## Core loop and critical flows

**Core loop:** Увидеть публикацию автора или сообщества → Отреагировать, обсудить или сохранить → Найти носибельный образ и разобрать его на вещи → Подписаться и опубликовать свою версию.
**Habit loop:** Новые образы знакомых авторов → Отреагировать, обсудить или сохранить → Найти носибельный образ и разобрать его на вещи; cadence: To be measured; no cadence is invented during migration.
**Activation:** The user reaches camera; signal: Completion of create; window: First meaningful session.

| Flow | Trigger | Steps | Outcome |
|---|---|---|---|
| Весь продукт | phone | phone<br>code<br>codefail<br>home<br>post<br>nearby<br>clip<br>create<br>camera<br>media<br>chats<br>chat<br>voice<br>profile<br>settings<br>widget<br>fill<br>mates<br>ads<br>lock<br>subtitles<br>talk<br>background<br>call<br>swap<br>checkin<br>netqr<br>shareext | Социальная лента, сообщества, сообщения, профиль и публикация |
| Найти образ | home | home<br>create<br>post<br>talk<br>clip<br>nearby<br>chats<br>profile<br>background | Лента, разбор вещей и автор |
| Опубликовать образ | create | create<br>home<br>camera<br>media<br>subtitles<br>shareext | Камера, Фото и публикация |
| Примерка | clip | clip<br>swap<br>nearby<br>checkin<br>netqr | Короткое видео и комментарий |
| Дойти до свопа | chats | chats<br>chat<br>nearby<br>profile<br>voice<br>call<br>mates | Своп из клипа: календарь, сеть площадки, отметка и созвон без обмена номерами |

## Information architecture and navigation

**Navigation model.** Лента, профили, сообщества, короткие видео и сообщения формируют Social Networking
**Reference fit.** Лента и реакции; Авторы и подписки; Сообщества; Клипы-примерки

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:continue-email | none | none:none |
| code | push | phone | parent:phone<br>action:phone.continue-email<br>action:codefail.retry-code | present:null<br>present:null<br>navigate:confirm-code | input.email.valid<br>input.code.complete | pop:phone |
| codefail | push | code | parent:code | navigate:retry-code | none | pop:code |
| home | tab | code | tab:home<br>parent:code<br>action:code.confirm-code | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-feed-post<br>permission:location | session.authenticated<br>input.code.complete | none:none |
| search | tab | home | tab:search<br>parent:home | navigate:open-search-result | session.authenticated | none:none |
| notifications | push | home | parent:home | navigate:open-notification | none | pop:home |
| post | push | home | parent:home<br>action:home.open-feed-post<br>action:search.open-search-result<br>action:notifications.open-notification<br>action:wardrobe.open-saved-look | mutate:save-look | always | pop:home |
| nearby | push | services | parent:services<br>permission:home.location | present:null<br>navigate:open-nearby-event<br>request:enable-location | capability.location.requested | pop:services |
| clip | tab | home | tab:clip<br>parent:home | present:null<br>mutate:remix-clip | session.authenticated | none:none |
| create | push | home | parent:home<br>permission:create.photos<br>permission:create.speech | present:null<br>present:null<br>present:null<br>navigate:open-camera<br>permission:camera<br>permission:photos<br>permission:speech | capability.photos.requested<br>capability.speech.requested | pop:home |
| camera | cover | create | parent:create<br>action:create.open-camera<br>permission:create.camera | request:capture-photo | always<br>capability.camera.requested | dismiss:create; interactive-or-action:create |
| media | system | create | parent:create |  | none | system-return:create |
| chats | tab | — | tab:chats | present:null<br>navigate:open-chat | session.authenticated | none:none |
| chat | push | chats | parent:chats<br>action:chats.open-chat<br>permission:chat.mic<br>permission:chat.commnotif | present:null<br>present:null<br>mutate:send-message<br>permission:mic<br>permission:commnotif<br>permission:voip | always<br>capability.mic.requested<br>capability.commnotif.requested | pop:chats |
| voice | sheet | chat | parent:chat | mutate:send-voice | none | dismiss:chat; interactive-or-action:chat |
| profile | push | home | parent:home<br>action:mates.open-contact-profile<br>permission:widget.keychain<br>permission:ads.tracking | present:null<br>mutate:edit-bio<br>permission:contacts | always<br>capability.keychain.requested<br>capability.tracking.requested | pop:home |
| services | tab | home | tab:services<br>parent:home | present:null<br>present:null<br>present:null<br>navigate:open-wardrobe | session.authenticated | none:none |
| settings | push | services | parent:services<br>permission:settings.push<br>permission:settings.remotenotif<br>permission:settings.fetch<br>permission:settings.appgroups | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>mutate:toggle-background-feed<br>permission:push<br>permission:remotenotif<br>permission:fetch<br>permission:appgroups<br>permission:autofill<br>permission:faceid<br>permission:shareext | capability.push.requested<br>capability.remotenotif.requested<br>capability.fetch.requested<br>capability.appgroups.requested | pop:services |
| widget | system | settings | parent:settings | permission:keychain | none | system-return:settings |
| fill | system | settings | parent:settings<br>permission:settings.autofill |  | capability.autofill.requested | system-return:settings |
| mates | push | profile | parent:profile<br>permission:profile.contacts | navigate:open-contact-profile | capability.contacts.requested | pop:profile |
| wardrobe | push | services | parent:services<br>action:services.open-wardrobe | navigate:open-saved-look | always | pop:services |
| event | push | nearby | parent:nearby<br>action:nearby.open-nearby-event | mutate:join-event | always | pop:nearby |
| ads | sheet | settings | parent:settings | dismiss:dismiss-ads-explanation<br>permission:tracking | none | dismiss:settings; interactive-or-action:settings |
| lock | push | settings | parent:settings<br>permission:settings.faceid | request:request-face-id | capability.faceid.requested | pop:settings |
| subtitles | push | create | parent:create | mutate:publish-captioned-clip | none | pop:create |
| talk | push | home | parent:home<br>action:background.return-to-talk | present:null<br>request:start-background-audio<br>permission:audio | always | pop:home |
| background | cover | talk | parent:talk<br>permission:talk.audio | navigate:return-to-talk | capability.audio.requested | dismiss:talk; interactive-or-action:talk |
| call | state | chat | parent:chat<br>permission:chat.voip |  | capability.voip.requested | none:none |
| swap | push | clip | parent:clip<br>permission:swap.calendar | present:null<br>request:add-swap-calendar<br>permission:calendar | capability.calendar.requested | pop:clip |
| checkin | push | swap | parent:swap<br>permission:checkin.wifiinfo | present:null<br>request:confirm-swap-checkin<br>permission:wifiinfo | capability.wifiinfo.requested | pop:swap |
| netqr | sheet | checkin | parent:checkin<br>permission:netqr.hotspot | request:join-venue-network<br>permission:hotspot | capability.hotspot.requested | dismiss:checkin; interactive-or-action:checkin |
| shareext | sheet | settings | parent:settings<br>permission:settings.shareext | mutate:save-shared-draft | capability.shareext.requested | dismiss:settings; interactive-or-action:settings |

## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Войти | root | default<br>loading<br>error | Продолжить → navigate:code |
| code | Подтвердить вход | push | default<br>loading<br>error | Продолжить → navigate:home |
| codefail | Показать ошибку OTP и вернуть к вводу | push | default<br>loading<br>error | Продолжить → navigate:code |
| home | Следить за авторами | tab | default<br>empty | Открыть публикацию → navigate:post |
| search | Найти образы, вещи и авторов | tab | default<br>query<br>empty<br>loading | Открыть результат → navigate:post |
| notifications | Вернуться к реакциям, комментариям и новым подпискам | push | unread<br>read<br>empty | Открыть уведомление → navigate:post |
| post | Обсудить образ | push | default | Сохранить образ → mutate:savedLooks |
| nearby | Найти своп или автора поблизости | push | default<br>empty | Смотреть подборку → navigate:event<br>Разрешить геопозицию → request |
| clip | Посмотреть серию | tab | default | Собрать свою версию → mutate:outfits |
| create | Опубликовать момент | push | default<br>error<br>success | Снять образ → navigate:camera |
| camera | Снять момент | cover | default<br>denied | Сделать снимок → request |
| media | Выбрать фото | system | default | System/contract-owned outcome |
| chats | Вернуться к диалогам | tab | default<br>empty | Открыть диалог → navigate:chat |
| chat | Договориться | push | default | Отправить сообщение → mutate:localConversation |
| voice | Записать голос | sheet | default<br>denied | Отправить → mutate:localConversation |
| profile | Управлять профилем | push | default | Изменить информацию о себе → mutate:profileBio |
| services | Открыть гардероб, свопы, знакомых и настройки | tab | default<br>loading | Открыть гардероб → navigate:wardrobe |
| settings | Держать доступы и системные функции под рукой | push | default | Обновлять ленту в фоне → mutate:backgroundFeedEnabled |
| widget | Поставить виджет сохранённого образа на экран «Домой» | system | default | System/contract-owned outcome |
| fill | Войти на сайт марки сохранённым в «Образах» входом | system | default | System/contract-owned outcome |
| mates | Найти знакомых среди тех, кто уже публикует | push | default<br>empty<br>denied | Открыть профиль → navigate:profile |
| wardrobe | Управлять вещами, из которых собираются образы | push | populated<br>empty<br>loading | Открыть сохранённый образ → navigate:post |
| event | Проверить условия свопа и присоединиться | push | available<br>joined<br>cancelled | Присоединиться → mutate:joinedEvents |
| ads | Объяснить обмен до системного запроса ATT | sheet | default | Продолжить → dismiss |
| lock | Закрыть подборки и черновики биометрией | push | default<br>denied | Замок Face ID → request |
| subtitles | Собрать и поправить субтитры перед публикацией | push | default<br>error<br>success | Опубликовать клип → mutate:localPublishedClips |
| talk | Слушать разбор и продолжать в фоне | push | default<br>loading<br>error | Слушать → request |
| background | Показать, что звук продолжается при погашенном экране | cover | default<br>loading<br>error | Вернуться к разбору → navigate:talk |
| call | Договориться о встрече, не раскрывая номер | state | default | System/contract-owned outcome |
| swap | Собрать всё о свопе и положить дату в календарь | push | default | Добавить в Календарь → request |
| checkin | Подтвердить присутствие сетью площадки | push | default<br>error<br>denied | Отметиться на свопе → request |
| netqr | Подключиться к гостевой сети площадки | sheet | default<br>error | Подключиться → request |
| shareext | Принять ссылку или кадр из другого приложения в черновик | sheet | default<br>success | Сохранить в черновик → mutate:sharedDraft |

## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | continue-email | continue-email:navigate→code | screen.phone.state.loading.recovery | fixture.looks.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | continue-email | continue-email:navigate→code | screen.phone.state.populated-default.recovery | fixture.looks.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | continue-email | continue-email:navigate→code | screen.phone.state.error.recovery | fixture.looks.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | continue-email | continue-email:navigate→code | screen.phone.state.offline.recovery | fixture.looks.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | confirm-code | confirm-code:navigate→home | screen.code.state.loading.recovery | fixture.looks.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | confirm-code | confirm-code:navigate→home | screen.code.state.populated-default.recovery | fixture.looks.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | confirm-code | confirm-code:navigate→home | screen.code.state.error.recovery | fixture.looks.code.error |
| code | offline | yes | screen.code.state.offline.body | confirm-code | confirm-code:navigate→home | screen.code.state.offline.recovery | fixture.looks.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | retry-code | retry-code:navigate→code | screen.codefail.state.loading.recovery | fixture.looks.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | retry-code | retry-code:navigate→code | screen.codefail.state.populated-default.recovery | fixture.looks.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | retry-code | retry-code:navigate→code | screen.codefail.state.error.recovery | fixture.looks.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | retry-code | retry-code:navigate→code | screen.codefail.state.offline.recovery | fixture.looks.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| home | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| home | populated/default | yes | screen.home.state.populated-default.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.populated-default.recovery | fixture.looks.home.default |
| home | empty | yes | screen.home.state.empty.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.empty.recovery | fixture.looks.home.empty |
| home | error | yes | screen.home.state.error.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.error.recovery | fixture.looks.home.error |
| home | offline | yes | screen.home.state.offline.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.offline.recovery | fixture.looks.home.offline |
| home | permission-needed | yes | screen.home.state.permission-needed.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-needed.recovery | fixture.looks.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-denied.recovery | fixture.looks.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-restricted.recovery | fixture.looks.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-limited.recovery | fixture.looks.home.permission-limited |
| search | loading | yes | screen.search.state.loading.body | open-search-result | open-search-result:navigate→post | screen.search.state.loading.recovery | fixture.looks.search.loading |
| search | populated/default | yes | screen.search.state.populated-default.body | open-search-result | open-search-result:navigate→post | screen.search.state.populated-default.recovery | fixture.looks.search.default<br>fixture.looks.search.query |
| search | empty | yes | screen.search.state.empty.body | open-search-result | open-search-result:navigate→post | screen.search.state.empty.recovery | fixture.looks.search.empty |
| search | error | yes | screen.search.state.error.body | open-search-result | open-search-result:navigate→post | screen.search.state.error.recovery | fixture.looks.search.error |
| search | offline | yes | screen.search.state.offline.body | open-search-result | open-search-result:navigate→post | screen.search.state.offline.recovery | fixture.looks.search.offline |
| search | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| search | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| search | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| search | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| notifications | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| notifications | populated/default | yes | screen.notifications.state.populated-default.body | open-notification | open-notification:navigate→post | screen.notifications.state.populated-default.recovery | fixture.looks.notifications.unread<br>fixture.looks.notifications.read |
| notifications | empty | yes | screen.notifications.state.empty.body | open-notification | open-notification:navigate→post | screen.notifications.state.empty.recovery | fixture.looks.notifications.empty |
| notifications | error | yes | screen.notifications.state.error.body | open-notification | open-notification:navigate→post | screen.notifications.state.error.recovery | fixture.looks.notifications.error |
| notifications | offline | yes | screen.notifications.state.offline.body | open-notification | open-notification:navigate→post | screen.notifications.state.offline.recovery | fixture.looks.notifications.offline |
| notifications | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| post | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| post | populated/default | yes | screen.post.state.populated-default.body | save-look | save-look:mutate | screen.post.state.populated-default.recovery | fixture.looks.post.default |
| post | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| post | error | yes | screen.post.state.error.body | save-look | save-look:mutate | screen.post.state.error.recovery | fixture.looks.post.error |
| post | offline | yes | screen.post.state.offline.body | save-look | save-look:mutate | screen.post.state.offline.recovery | fixture.looks.post.offline |
| post | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| post | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| post | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| post | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| nearby | loading | yes | screen.nearby.state.loading.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.loading.recovery | fixture.looks.nearby.loading |
| nearby | populated/default | yes | screen.nearby.state.populated-default.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.populated-default.recovery | fixture.looks.nearby.default |
| nearby | empty | yes | screen.nearby.state.empty.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.empty.recovery | fixture.looks.nearby.empty |
| nearby | error | yes | screen.nearby.state.error.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.error.recovery | fixture.looks.nearby.error |
| nearby | offline | yes | screen.nearby.state.offline.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.offline.recovery | fixture.looks.nearby.offline |
| nearby | permission-needed | yes | screen.nearby.state.permission-needed.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-needed.recovery | fixture.looks.nearby.permission-needed |
| nearby | permission-denied | yes | screen.nearby.state.permission-denied.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-denied.recovery | fixture.looks.nearby.permission-denied |
| nearby | permission-restricted | yes | screen.nearby.state.permission-restricted.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-restricted.recovery | fixture.looks.nearby.permission-restricted |
| nearby | permission-limited | yes | screen.nearby.state.permission-limited.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-limited.recovery | fixture.looks.nearby.permission-limited |
| clip | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| clip | populated/default | yes | screen.clip.state.populated-default.body | remix-clip | remix-clip:mutate | screen.clip.state.populated-default.recovery | fixture.looks.clip.default |
| clip | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| clip | error | yes | screen.clip.state.error.body | remix-clip | remix-clip:mutate | screen.clip.state.error.recovery | fixture.looks.clip.error |
| clip | offline | yes | screen.clip.state.offline.body | remix-clip | remix-clip:mutate | screen.clip.state.offline.recovery | fixture.looks.clip.offline |
| clip | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| clip | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| clip | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| clip | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| create | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| create | populated/default | yes | screen.create.state.populated-default.body | open-camera | open-camera:navigate→camera | screen.create.state.populated-default.recovery | fixture.looks.create.default<br>fixture.looks.create.success |
| create | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| create | error | yes | screen.create.state.error.body | open-camera | open-camera:navigate→camera | screen.create.state.error.recovery | fixture.looks.create.error |
| create | offline | yes | screen.create.state.offline.body | open-camera | open-camera:navigate→camera | screen.create.state.offline.recovery | fixture.looks.create.offline |
| create | permission-needed | yes | screen.create.state.permission-needed.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-needed.recovery | fixture.looks.create.permission-needed |
| create | permission-denied | yes | screen.create.state.permission-denied.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-denied.recovery | fixture.looks.create.permission-denied |
| create | permission-restricted | yes | screen.create.state.permission-restricted.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-restricted.recovery | fixture.looks.create.permission-restricted |
| create | permission-limited | yes | screen.create.state.permission-limited.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-limited.recovery | fixture.looks.create.permission-limited |
| camera | loading | yes | screen.camera.state.loading.body | capture-photo | capture-photo:request | screen.camera.state.loading.recovery | fixture.looks.camera.loading |
| camera | populated/default | yes | screen.camera.state.populated-default.body | capture-photo | capture-photo:request | screen.camera.state.populated-default.recovery | fixture.looks.camera.default |
| camera | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| camera | error | yes | screen.camera.state.error.body | capture-photo | capture-photo:request | screen.camera.state.error.recovery | fixture.looks.camera.error |
| camera | offline | yes | screen.camera.state.offline.body | capture-photo | capture-photo:request | screen.camera.state.offline.recovery | fixture.looks.camera.offline |
| camera | permission-needed | yes | screen.camera.state.permission-needed.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-needed.recovery | fixture.looks.camera.permission-needed |
| camera | permission-denied | yes | screen.camera.state.permission-denied.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-denied.recovery | fixture.looks.camera.denied |
| camera | permission-restricted | yes | screen.camera.state.permission-restricted.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-restricted.recovery | fixture.looks.camera.permission-restricted |
| camera | permission-limited | yes | screen.camera.state.permission-limited.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-limited.recovery | fixture.looks.camera.permission-limited |
| media | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| media | populated/default | yes | screen.media.state.populated-default.body |  |  | screen.media.state.populated-default.recovery | fixture.looks.media.default |
| media | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| media | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| media | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| media | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| media | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| media | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| media | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chats | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.looks.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.looks.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.looks.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.looks.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| chat | populated/default | yes | screen.chat.state.populated-default.body | send-message | send-message:mutate | screen.chat.state.populated-default.recovery | fixture.looks.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | send-message | send-message:mutate | screen.chat.state.error.recovery | fixture.looks.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | send-message | send-message:mutate | screen.chat.state.offline.recovery | fixture.looks.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | send-message<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | send-message:mutate | screen.chat.state.permission-needed.recovery | fixture.looks.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | send-message<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | send-message:mutate | screen.chat.state.permission-denied.recovery | fixture.looks.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | send-message<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | send-message:mutate | screen.chat.state.permission-restricted.recovery | fixture.looks.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| voice | populated/default | yes | screen.voice.state.populated-default.body | send-voice | send-voice:mutate | screen.voice.state.populated-default.recovery | fixture.looks.voice.default |
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | send-voice | send-voice:mutate | screen.voice.state.error.recovery | fixture.looks.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | send-voice | send-voice:mutate | screen.voice.state.offline.recovery | fixture.looks.voice.offline |
| voice | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| voice | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| voice | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| profile | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| profile | populated/default | yes | screen.profile.state.populated-default.body | edit-bio | edit-bio:mutate | screen.profile.state.populated-default.recovery | fixture.looks.profile.default |
| profile | empty | yes | screen.profile.state.empty.body | edit-bio | edit-bio:mutate | screen.profile.state.empty.recovery | fixture.looks.profile.empty |
| profile | error | yes | screen.profile.state.error.body | edit-bio | edit-bio:mutate | screen.profile.state.error.recovery | fixture.looks.profile.error |
| profile | offline | yes | screen.profile.state.offline.body | edit-bio | edit-bio:mutate | screen.profile.state.offline.recovery | fixture.looks.profile.offline |
| profile | permission-needed | yes | screen.profile.state.permission-needed.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-needed.recovery | fixture.looks.profile.permission-needed |
| profile | permission-denied | yes | screen.profile.state.permission-denied.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-denied.recovery | fixture.looks.profile.permission-denied |
| profile | permission-restricted | yes | screen.profile.state.permission-restricted.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-restricted.recovery | fixture.looks.profile.permission-restricted |
| profile | permission-limited | yes | screen.profile.state.permission-limited.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-limited.recovery | fixture.looks.profile.permission-limited |
| services | loading | yes | screen.services.state.loading.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.loading.recovery | fixture.looks.services.loading |
| services | populated/default | yes | screen.services.state.populated-default.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.populated-default.recovery | fixture.looks.services.default |
| services | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| services | error | yes | screen.services.state.error.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.error.recovery | fixture.looks.services.error |
| services | offline | yes | screen.services.state.offline.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.offline.recovery | fixture.looks.services.offline |
| services | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| services | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| services | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| services | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| settings | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| settings | populated/default | yes | screen.settings.state.populated-default.body | toggle-background-feed | toggle-background-feed:mutate | screen.settings.state.populated-default.recovery | fixture.looks.settings.default |
| settings | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| settings | error | yes | screen.settings.state.error.body | toggle-background-feed | toggle-background-feed:mutate | screen.settings.state.error.recovery | fixture.looks.settings.error |
| settings | offline | yes | screen.settings.state.offline.body | toggle-background-feed | toggle-background-feed:mutate | screen.settings.state.offline.recovery | fixture.looks.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | toggle-background-feed<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | toggle-background-feed:mutate | screen.settings.state.permission-needed.recovery | fixture.looks.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | toggle-background-feed<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | toggle-background-feed:mutate | screen.settings.state.permission-denied.recovery | fixture.looks.settings.permission-denied |
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | toggle-background-feed<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | toggle-background-feed:mutate | screen.settings.state.permission-restricted.recovery | fixture.looks.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| widget | populated/default | yes | screen.widget.state.populated-default.body |  |  | screen.widget.state.populated-default.recovery | fixture.looks.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| widget | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | permission.keychain.fallback |  | screen.widget.state.permission-needed.recovery | fixture.looks.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | permission.keychain.fallback |  | screen.widget.state.permission-denied.recovery | fixture.looks.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | permission.keychain.fallback |  | screen.widget.state.permission-restricted.recovery | fixture.looks.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| fill | populated/default | yes | screen.fill.state.populated-default.body |  |  | screen.fill.state.populated-default.recovery | fixture.looks.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| fill | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | permission.autofill.fallback |  | screen.fill.state.permission-needed.recovery | fixture.looks.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | permission.autofill.fallback |  | screen.fill.state.permission-denied.recovery | fixture.looks.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | permission.autofill.fallback |  | screen.fill.state.permission-restricted.recovery | fixture.looks.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| mates | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| mates | populated/default | yes | screen.mates.state.populated-default.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.populated-default.recovery | fixture.looks.mates.default |
| mates | empty | yes | screen.mates.state.empty.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.empty.recovery | fixture.looks.mates.empty |
| mates | error | yes | screen.mates.state.error.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.error.recovery | fixture.looks.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.offline.recovery | fixture.looks.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-needed.recovery | fixture.looks.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-denied.recovery | fixture.looks.mates.denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-restricted.recovery | fixture.looks.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-limited.recovery | fixture.looks.mates.permission-limited |
| wardrobe | loading | yes | screen.wardrobe.state.loading.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.loading.recovery | fixture.looks.wardrobe.loading |
| wardrobe | populated/default | yes | screen.wardrobe.state.populated-default.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.populated-default.recovery | fixture.looks.wardrobe.populated |
| wardrobe | empty | yes | screen.wardrobe.state.empty.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.empty.recovery | fixture.looks.wardrobe.empty |
| wardrobe | error | yes | screen.wardrobe.state.error.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.error.recovery | fixture.looks.wardrobe.error |
| wardrobe | offline | yes | screen.wardrobe.state.offline.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.offline.recovery | fixture.looks.wardrobe.offline |
| wardrobe | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| wardrobe | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| wardrobe | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| wardrobe | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| event | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| event | populated/default | yes | screen.event.state.populated-default.body | join-event | join-event:mutate | screen.event.state.populated-default.recovery | fixture.looks.event.available<br>fixture.looks.event.joined |
| event | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| event | error | yes | screen.event.state.error.body | join-event | join-event:mutate | screen.event.state.error.recovery | fixture.looks.event.cancelled |
| event | offline | yes | screen.event.state.offline.body | join-event | join-event:mutate | screen.event.state.offline.recovery | fixture.looks.event.offline |
| event | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| event | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| event | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| event | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| ads | populated/default | yes | screen.ads.state.populated-default.body | dismiss-ads-explanation | dismiss-ads-explanation:dismiss | screen.ads.state.populated-default.recovery | fixture.looks.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | dismiss-ads-explanation | dismiss-ads-explanation:dismiss | screen.ads.state.error.recovery | fixture.looks.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | dismiss-ads-explanation | dismiss-ads-explanation:dismiss | screen.ads.state.offline.recovery | fixture.looks.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | dismiss-ads-explanation<br>permission.tracking.fallback | dismiss-ads-explanation:dismiss | screen.ads.state.permission-needed.recovery | fixture.looks.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | dismiss-ads-explanation<br>permission.tracking.fallback | dismiss-ads-explanation:dismiss | screen.ads.state.permission-denied.recovery | fixture.looks.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | dismiss-ads-explanation<br>permission.tracking.fallback | dismiss-ads-explanation:dismiss | screen.ads.state.permission-restricted.recovery | fixture.looks.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | request-face-id | request-face-id:request | screen.lock.state.loading.recovery | fixture.looks.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | request-face-id | request-face-id:request | screen.lock.state.populated-default.recovery | fixture.looks.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | request-face-id | request-face-id:request | screen.lock.state.error.recovery | fixture.looks.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | request-face-id | request-face-id:request | screen.lock.state.offline.recovery | fixture.looks.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | request-face-id<br>permission.faceid.fallback | request-face-id:request | screen.lock.state.permission-needed.recovery | fixture.looks.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | request-face-id<br>permission.faceid.fallback | request-face-id:request | screen.lock.state.permission-denied.recovery | fixture.looks.lock.denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | request-face-id<br>permission.faceid.fallback | request-face-id:request | screen.lock.state.permission-restricted.recovery | fixture.looks.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| subtitles | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| subtitles | populated/default | yes | screen.subtitles.state.populated-default.body | publish-captioned-clip | publish-captioned-clip:mutate | screen.subtitles.state.populated-default.recovery | fixture.looks.subtitles.default<br>fixture.looks.subtitles.success |
| subtitles | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| subtitles | error | yes | screen.subtitles.state.error.body | publish-captioned-clip | publish-captioned-clip:mutate | screen.subtitles.state.error.recovery | fixture.looks.subtitles.error |
| subtitles | offline | yes | screen.subtitles.state.offline.body | publish-captioned-clip | publish-captioned-clip:mutate | screen.subtitles.state.offline.recovery | fixture.looks.subtitles.offline |
| subtitles | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| subtitles | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| subtitles | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| subtitles | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| talk | loading | yes | screen.talk.state.loading.body | start-background-audio | start-background-audio:request | screen.talk.state.loading.recovery | fixture.looks.talk.loading |
| talk | populated/default | yes | screen.talk.state.populated-default.body | start-background-audio | start-background-audio:request | screen.talk.state.populated-default.recovery | fixture.looks.talk.default |
| talk | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| talk | error | yes | screen.talk.state.error.body | start-background-audio | start-background-audio:request | screen.talk.state.error.recovery | fixture.looks.talk.error |
| talk | offline | yes | screen.talk.state.offline.body | start-background-audio | start-background-audio:request | screen.talk.state.offline.recovery | fixture.looks.talk.offline |
| talk | permission-needed | yes | screen.talk.state.permission-needed.body | start-background-audio<br>permission.audio.fallback | start-background-audio:request | screen.talk.state.permission-needed.recovery | fixture.looks.talk.permission-needed |
| talk | permission-denied | yes | screen.talk.state.permission-denied.body | start-background-audio<br>permission.audio.fallback | start-background-audio:request | screen.talk.state.permission-denied.recovery | fixture.looks.talk.permission-denied |
| talk | permission-restricted | yes | screen.talk.state.permission-restricted.body | start-background-audio<br>permission.audio.fallback | start-background-audio:request | screen.talk.state.permission-restricted.recovery | fixture.looks.talk.permission-restricted |
| talk | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.loading.recovery | fixture.looks.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.populated-default.recovery | fixture.looks.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.error.recovery | fixture.looks.background.error |
| background | offline | yes | screen.background.state.offline.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.offline.recovery | fixture.looks.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | return-to-talk<br>permission.audio.fallback | return-to-talk:navigate→talk | screen.background.state.permission-needed.recovery | fixture.looks.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | return-to-talk<br>permission.audio.fallback | return-to-talk:navigate→talk | screen.background.state.permission-denied.recovery | fixture.looks.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | return-to-talk<br>permission.audio.fallback | return-to-talk:navigate→talk | screen.background.state.permission-restricted.recovery | fixture.looks.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| call | populated/default | yes | screen.call.state.populated-default.body |  |  | screen.call.state.populated-default.recovery | fixture.looks.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body |  |  | screen.call.state.error.recovery | fixture.looks.call.error |
| call | offline | yes | screen.call.state.offline.body |  |  | screen.call.state.offline.recovery | fixture.looks.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | permission.voip.fallback |  | screen.call.state.permission-needed.recovery | fixture.looks.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | permission.voip.fallback |  | screen.call.state.permission-denied.recovery | fixture.looks.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | permission.voip.fallback |  | screen.call.state.permission-restricted.recovery | fixture.looks.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| swap | loading | yes | screen.swap.state.loading.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.loading.recovery | fixture.looks.swap.loading |
| swap | populated/default | yes | screen.swap.state.populated-default.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.populated-default.recovery | fixture.looks.swap.default |
| swap | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| swap | error | yes | screen.swap.state.error.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.error.recovery | fixture.looks.swap.error |
| swap | offline | yes | screen.swap.state.offline.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.offline.recovery | fixture.looks.swap.offline |
| swap | permission-needed | yes | screen.swap.state.permission-needed.body | add-swap-calendar<br>permission.calendar.fallback | add-swap-calendar:request | screen.swap.state.permission-needed.recovery | fixture.looks.swap.permission-needed |
| swap | permission-denied | yes | screen.swap.state.permission-denied.body | add-swap-calendar<br>permission.calendar.fallback | add-swap-calendar:request | screen.swap.state.permission-denied.recovery | fixture.looks.swap.permission-denied |
| swap | permission-restricted | yes | screen.swap.state.permission-restricted.body | add-swap-calendar<br>permission.calendar.fallback | add-swap-calendar:request | screen.swap.state.permission-restricted.recovery | fixture.looks.swap.permission-restricted |
| swap | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| checkin | loading | yes | screen.checkin.state.loading.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.loading.recovery | fixture.looks.checkin.loading |
| checkin | populated/default | yes | screen.checkin.state.populated-default.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.populated-default.recovery | fixture.looks.checkin.default |
| checkin | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| checkin | error | yes | screen.checkin.state.error.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.error.recovery | fixture.looks.checkin.error |
| checkin | offline | yes | screen.checkin.state.offline.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.offline.recovery | fixture.looks.checkin.offline |
| checkin | permission-needed | yes | screen.checkin.state.permission-needed.body | confirm-swap-checkin<br>permission.wifiinfo.fallback | confirm-swap-checkin:request | screen.checkin.state.permission-needed.recovery | fixture.looks.checkin.permission-needed |
| checkin | permission-denied | yes | screen.checkin.state.permission-denied.body | confirm-swap-checkin<br>permission.wifiinfo.fallback | confirm-swap-checkin:request | screen.checkin.state.permission-denied.recovery | fixture.looks.checkin.denied |
| checkin | permission-restricted | yes | screen.checkin.state.permission-restricted.body | confirm-swap-checkin<br>permission.wifiinfo.fallback | confirm-swap-checkin:request | screen.checkin.state.permission-restricted.recovery | fixture.looks.checkin.permission-restricted |
| checkin | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | join-venue-network | join-venue-network:request | screen.netqr.state.loading.recovery | fixture.looks.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | join-venue-network | join-venue-network:request | screen.netqr.state.populated-default.recovery | fixture.looks.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | join-venue-network | join-venue-network:request | screen.netqr.state.error.recovery | fixture.looks.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | join-venue-network | join-venue-network:request | screen.netqr.state.offline.recovery | fixture.looks.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | join-venue-network<br>permission.hotspot.fallback | join-venue-network:request | screen.netqr.state.permission-needed.recovery | fixture.looks.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | join-venue-network<br>permission.hotspot.fallback | join-venue-network:request | screen.netqr.state.permission-denied.recovery | fixture.looks.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | join-venue-network<br>permission.hotspot.fallback | join-venue-network:request | screen.netqr.state.permission-restricted.recovery | fixture.looks.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shareext | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| shareext | populated/default | yes | screen.shareext.state.populated-default.body | save-shared-draft | save-shared-draft:mutate | screen.shareext.state.populated-default.recovery | fixture.looks.shareext.default<br>fixture.looks.shareext.success |
| shareext | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shareext | error | yes | screen.shareext.state.error.body | save-shared-draft | save-shared-draft:mutate | screen.shareext.state.error.recovery | fixture.looks.shareext.error |
| shareext | offline | yes | screen.shareext.state.offline.body | save-shared-draft | save-shared-draft:mutate | screen.shareext.state.offline.recovery | fixture.looks.shareext.offline |
| shareext | permission-needed | yes | screen.shareext.state.permission-needed.body | save-shared-draft<br>permission.shareext.fallback | save-shared-draft:mutate | screen.shareext.state.permission-needed.recovery | fixture.looks.shareext.permission-needed |
| shareext | permission-denied | yes | screen.shareext.state.permission-denied.body | save-shared-draft<br>permission.shareext.fallback | save-shared-draft:mutate | screen.shareext.state.permission-denied.recovery | fixture.looks.shareext.permission-denied |
| shareext | permission-restricted | yes | screen.shareext.state.permission-restricted.body | save-shared-draft<br>permission.shareext.fallback | save-shared-draft:mutate | screen.shareext.state.permission-restricted.recovery | fixture.looks.shareext.permission-restricted |
| shareext | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |

## Design tokens and semantic component roles

**SwiftUI environment:** `NativeVisualLanguage`. SwiftUI consumes semantic token and component-role identifiers; UX Specification contains no implementation-layer view hierarchy or web-source translation.

| Token | Value |
|---|---|
| accent | #0077FF |
| background | #FFFFFF |
| groupedBackground | #F2F3F5 |
| fill | #F2F3F5 |
| separator | #E7E8EC |
| textPrimary | #000000 |
| textSecondary | #818C99 |
| badge | #FF3347 |
| outgoingStart | #0077FF |
| outgoingMiddle | #0077FF |
| outgoingEnd | #0077FF |

| Surface | Semantic component roles |
|---|---|
| phone | auth-form<br>primary-action |
| code | auth-form<br>primary-action |
| codefail | auth-form<br>primary-action |
| home | collection<br>filters |
| search | collection<br>filters |
| notifications | collection |
| post | summary<br>content<br>next-action |
| nearby | collection<br>filters |
| clip | summary<br>content<br>next-action |
| create | task-intro<br>form<br>primary-action |
| camera | task-intro<br>form<br>primary-action |
| media | detail |
| chats | collection |
| chat | chat<br>message-list<br>composer |
| voice | task-intro<br>form<br>primary-action |
| profile | collection |
| services | service-list |
| settings | service-list |
| widget | detail |
| fill | detail |
| mates | collection |
| wardrobe | collection<br>filters |
| event | summary<br>content<br>next-action |
| ads | summary<br>content<br>next-action |
| lock | summary<br>content<br>next-action |
| subtitles | task-intro<br>form<br>primary-action |
| talk | summary<br>content<br>next-action |
| background | summary<br>content<br>next-action |
| call | detail |
| swap | summary<br>content<br>next-action |
| checkin | task-intro<br>form<br>primary-action |
| netqr | task-intro<br>form<br>primary-action |
| shareext | task-intro<br>form<br>primary-action |

## Localization string catalog

All user-facing contract copy resolves through a stable key. Fixture data is product content, not UI copy.

| Key | Russian source | Placeholders / pluralization | Context | Screens | Usage |
|---|---|---|---|---|---|
| navigation.tab.chats.label | Сообщения | none | Root tab label | chats | navigation |
| navigation.tab.clip.label | Клипы | none | Root tab label | clip | navigation |
| navigation.tab.home.label | Главная | none | Root tab label | home | navigation |
| navigation.tab.search.label | Поиск | none | Root tab label | search | navigation |
| navigation.tab.services.label | Меню | none | Root tab label | services | navigation |
| permission.appgroups.body | Виджет сохранённого образа | none | System permission explanation | settings | permission |
| permission.appgroups.fallback | Сохранённое остаётся внутри приложения | none | Denied fallback | settings | recovery |
| permission.appgroups.title | Виджет сохранённого образа | none | System permission pre-prompt title | settings | permission |
| permission.audio.body | Разбор гардероба голосом в фоне: Now Playing и ±15 секунд с локскрина | none | System permission explanation | talk<br>background | permission |
| permission.audio.fallback | Без entitlement звук обрывается — не ship | none | Denied fallback | background | recovery |
| permission.audio.title | Разбор гардероба голосом в фоне: Now Playing и ±15 секунд с локскрина | none | System permission pre-prompt title | talk<br>background | permission |
| permission.autofill.body | Вход на сайт марки сохранённой связкой | none | System permission explanation | settings<br>fill | permission |
| permission.autofill.fallback | Вход вручную почтой и паролем | none | Denied fallback | fill | recovery |
| permission.autofill.title | Вход на сайт марки сохранённой связкой | none | System permission pre-prompt title | settings<br>fill | permission |
| permission.calendar.body | Своп и встреча сообщества в системном календаре, с правкой при переносе и удалением при отмене | none | System permission explanation | swap | permission |
| permission.calendar.fallback | Дата остаётся в карточке свопа и в напоминании приложения | none | Denied fallback | swap | recovery |
| permission.calendar.title | Своп и встреча сообщества в системном календаре, с правкой при переносе и удалением при отмене | none | System permission pre-prompt title | swap | permission |
| permission.camera.body | Снять образ | none | System permission explanation | create<br>camera | permission |
| permission.camera.fallback | Можно выбрать готовый снимок | none | Denied fallback | camera | recovery |
| permission.camera.title | Снять образ | none | System permission pre-prompt title | create<br>camera | permission |
| permission.commnotif.body | Чаты с аватарами в уведомлениях | none | System permission explanation | chat | permission |
| permission.commnotif.fallback | Обычное уведомление без аватара | none | Denied fallback | chat | recovery |
| permission.commnotif.title | Чаты с аватарами в уведомлениях | none | System permission pre-prompt title | chat | permission |
| permission.contacts.body | Кто из ваших контактов уже в «Образах» | none | System permission explanation | profile<br>mates | permission |
| permission.contacts.fallback | Остаётся поиск по имени и ссылка-приглашение | none | Denied fallback | mates | recovery |
| permission.contacts.title | Кто из ваших контактов уже в «Образах» | none | System permission pre-prompt title | profile<br>mates | permission |
| permission.faceid.body | Замок на «Сохранённом»: приватные подборки и черновики не видны через плечо | none | System permission explanation | settings<br>lock | permission |
| permission.faceid.fallback | Остаётся код-пароль устройства | none | Denied fallback | lock | recovery |
| permission.faceid.title | Замок на «Сохранённом»: приватные подборки и черновики не видны через плечо | none | System permission pre-prompt title | settings<br>lock | permission |
| permission.fetch.body | Свежая лента к запуску | none | System permission explanation | settings | permission |
| permission.fetch.fallback | Лента обновится после открытия | none | Denied fallback | settings | recovery |
| permission.fetch.title | Свежая лента к запуску | none | System permission pre-prompt title | settings | permission |
| permission.hotspot.body | Подключение к гостевой сети площадки по QR — без него отметка на свопе не проходит | none | System permission explanation | netqr | permission |
| permission.hotspot.fallback | Сеть выбирается вручную в Настройках | none | Denied fallback | netqr | recovery |
| permission.hotspot.title | Подключение к гостевой сети площадки по QR — без него отметка на свопе не проходит | none | System permission pre-prompt title | netqr | permission |
| permission.keychain.body | Один вход для приложения и виджета | none | System permission explanation | widget<br>profile | permission |
| permission.keychain.fallback | Виджет открывает приложение для входа | none | Denied fallback | profile | recovery |
| permission.keychain.title | Один вход для приложения и виджета | none | System permission pre-prompt title | widget<br>profile | permission |
| permission.location.body | События стиля рядом | none | System permission explanation | home<br>nearby | permission |
| permission.location.fallback | Район выбирается вручную | none | Denied fallback | nearby | recovery |
| permission.location.title | События стиля рядом | none | System permission pre-prompt title | home<br>nearby | permission |
| permission.mic.body | Голосовые сообщения | none | System permission explanation | chat | permission |
| permission.mic.fallback | Остаются текст и фото | none | Denied fallback | chat | recovery |
| permission.mic.title | Голосовые сообщения | none | System permission pre-prompt title | chat | permission |
| permission.photos.body | Публикация из медиатеки | none | System permission explanation | create | permission |
| permission.photos.fallback | Можно снять новый кадр камерой | none | Denied fallback | create | recovery |
| permission.photos.title | Публикация из медиатеки | none | System permission pre-prompt title | create | permission |
| permission.push.body | Уведомления о подписках и ответах | none | System permission explanation | settings | permission |
| permission.push.fallback | Обновления помечаются точкой внутри приложения | none | Denied fallback | settings | recovery |
| permission.push.title | Уведомления о подписках и ответах | none | System permission pre-prompt title | settings | permission |
| permission.remotenotif.body | Актуальная серия клипов | none | System permission explanation | settings | permission |
| permission.remotenotif.fallback | Состав обновляется при открытии | none | Denied fallback | settings | recovery |
| permission.remotenotif.title | Актуальная серия клипов | none | System permission pre-prompt title | settings | permission |
| permission.shareext.body | Поделиться в «Образы» из Safari, «Фото» и мессенджеров — ссылка или кадр падает в черновик образа | none | System permission explanation | settings<br>shareext | permission |
| permission.shareext.fallback | Остаётся сохранение внутри приложения | none | Denied fallback | shareext | recovery |
| permission.shareext.title | Поделиться в «Образы» из Safari, «Фото» и мессенджеров — ссылка или кадр падает в черновик образа | none | System permission pre-prompt title | settings<br>shareext | permission |
| permission.speech.body | Субтитры к снятому клипу без ручного набора | none | System permission explanation | create | permission |
| permission.speech.fallback | Субтитры набираются вручную | none | Denied fallback | create | recovery |
| permission.speech.title | Субтитры к снятому клипу без ручного набора | none | System permission pre-prompt title | create | permission |
| permission.tracking.body | Реклама марок и локальных магазинов вместо платной подписки | none | System permission explanation | ads<br>profile | permission |
| permission.tracking.fallback | Реклама остаётся, но перестаёт быть персональной | none | Denied fallback | profile | recovery |
| permission.tracking.title | Реклама марок и локальных магазинов вместо платной подписки | none | System permission pre-prompt title | ads<br>profile | permission |
| permission.voip.body | Созвон по свопу без обмена номерами: телефон остаётся у владельца | none | System permission explanation | chat<br>call | permission |
| permission.voip.fallback | Остаётся переписка в чате | none | Denied fallback | call | recovery |
| permission.voip.title | Созвон по свопу без обмена номерами: телефон остаётся у владельца | none | System permission pre-prompt title | chat<br>call | permission |
| permission.wifiinfo.body | Отметка «я на свопе» подтверждается сетью площадки, а не словом участника | none | System permission explanation | checkin | permission |
| permission.wifiinfo.fallback | Остаётся отметка вручную — её подтверждает организатор | none | Denied fallback | checkin | recovery |
| permission.wifiinfo.title | Отметка «я на свопе» подтверждается сетью площадки, а не словом участника | none | System permission pre-prompt title | checkin | permission |
| scenario.all.failure.name | Весь продукт: ошибка и восстановление | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>post<br>nearby<br>clip<br>create<br>camera<br>media<br>chats<br>chat<br>voice<br>profile<br>settings<br>widget<br>fill<br>mates<br>ads<br>lock<br>subtitles<br>talk<br>background<br>call<br>swap<br>checkin<br>netqr<br>shareext | acceptance |
| scenario.all.happy.name | Весь продукт: основной путь | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>post<br>nearby<br>clip<br>create<br>camera<br>media<br>chats<br>chat<br>voice<br>profile<br>settings<br>widget<br>fill<br>mates<br>ads<br>lock<br>subtitles<br>talk<br>background<br>call<br>swap<br>checkin<br>netqr<br>shareext | acceptance |
| scenario.all.offline.name | Весь продукт: без сети | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>post<br>nearby<br>clip<br>create<br>camera<br>media<br>chats<br>chat<br>voice<br>profile<br>settings<br>widget<br>fill<br>mates<br>ads<br>lock<br>subtitles<br>talk<br>background<br>call<br>swap<br>checkin<br>netqr<br>shareext | acceptance |
| scenario.all.persistence.name | Весь продукт: возврат после перезапуска | none | Acceptance scenario name | phone<br>code<br>codefail<br>home<br>post<br>nearby<br>clip<br>create<br>camera<br>media<br>chats<br>chat<br>voice<br>profile<br>settings<br>widget<br>fill<br>mates<br>ads<br>lock<br>subtitles<br>talk<br>background<br>call<br>swap<br>checkin<br>netqr<br>shareext | acceptance |
| scenario.clip.failure.name | Примерка: ошибка и восстановление | none | Acceptance scenario name | clip<br>swap<br>nearby<br>checkin<br>netqr | acceptance |
| scenario.clip.happy.name | Примерка: основной путь | none | Acceptance scenario name | clip<br>swap<br>nearby<br>checkin<br>netqr | acceptance |
| scenario.clip.offline.name | Примерка: без сети | none | Acceptance scenario name | clip<br>swap<br>nearby<br>checkin<br>netqr | acceptance |
| scenario.clip.persistence.name | Примерка: возврат после перезапуска | none | Acceptance scenario name | clip<br>swap<br>nearby<br>checkin<br>netqr | acceptance |
| scenario.discover.failure.name | Найти образ: ошибка и восстановление | none | Acceptance scenario name | home<br>create<br>post<br>talk<br>clip<br>nearby<br>chats<br>profile<br>background | acceptance |
| scenario.discover.happy.name | Найти образ: основной путь | none | Acceptance scenario name | home<br>create<br>post<br>talk<br>clip<br>nearby<br>chats<br>profile<br>background | acceptance |
| scenario.discover.offline.name | Найти образ: без сети | none | Acceptance scenario name | home<br>create<br>post<br>talk<br>clip<br>nearby<br>chats<br>profile<br>background | acceptance |
| scenario.discover.persistence.name | Найти образ: возврат после перезапуска | none | Acceptance scenario name | home<br>create<br>post<br>talk<br>clip<br>nearby<br>chats<br>profile<br>background | acceptance |
| scenario.meet.failure.name | Дойти до свопа: ошибка и восстановление | none | Acceptance scenario name | chats<br>chat<br>nearby<br>profile<br>voice<br>call<br>mates | acceptance |
| scenario.meet.happy.name | Дойти до свопа: основной путь | none | Acceptance scenario name | chats<br>chat<br>nearby<br>profile<br>voice<br>call<br>mates | acceptance |
| scenario.meet.offline.name | Дойти до свопа: без сети | none | Acceptance scenario name | chats<br>chat<br>nearby<br>profile<br>voice<br>call<br>mates | acceptance |
| scenario.meet.persistence.name | Дойти до свопа: возврат после перезапуска | none | Acceptance scenario name | chats<br>chat<br>nearby<br>profile<br>voice<br>call<br>mates | acceptance |
| scenario.permission.appgroups.denied.name | Виджет сохранённого образа: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.audio.denied.name | Разбор гардероба голосом в фоне: Now Playing и ±15 секунд с локскрина: отказ и запасной путь | none | Acceptance scenario name | talk<br>background | acceptance |
| scenario.permission.autofill.denied.name | Вход на сайт марки сохранённой связкой: отказ и запасной путь | none | Acceptance scenario name | settings<br>fill | acceptance |
| scenario.permission.calendar.denied.name | Своп и встреча сообщества в системном календаре, с правкой при переносе и удалением при отмене: отказ и запасной путь | none | Acceptance scenario name | swap | acceptance |
| scenario.permission.camera.denied.name | Снять образ: отказ и запасной путь | none | Acceptance scenario name | create<br>camera | acceptance |
| scenario.permission.commnotif.denied.name | Чаты с аватарами в уведомлениях: отказ и запасной путь | none | Acceptance scenario name | chat | acceptance |
| scenario.permission.contacts.denied.name | Кто из ваших контактов уже в «Образах»: отказ и запасной путь | none | Acceptance scenario name | profile<br>mates | acceptance |
| scenario.permission.faceid.denied.name | Замок на «Сохранённом»: приватные подборки и черновики не видны через плечо: отказ и запасной путь | none | Acceptance scenario name | settings<br>lock | acceptance |
| scenario.permission.fetch.denied.name | Свежая лента к запуску: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.hotspot.denied.name | Подключение к гостевой сети площадки по QR — без него отметка на свопе не проходит: отказ и запасной путь | none | Acceptance scenario name | netqr | acceptance |
| scenario.permission.keychain.denied.name | Один вход для приложения и виджета: отказ и запасной путь | none | Acceptance scenario name | widget<br>profile | acceptance |
| scenario.permission.location.denied.name | События стиля рядом: отказ и запасной путь | none | Acceptance scenario name | home<br>nearby | acceptance |
| scenario.permission.mic.denied.name | Голосовые сообщения: отказ и запасной путь | none | Acceptance scenario name | chat | acceptance |
| scenario.permission.photos.denied.name | Публикация из медиатеки: отказ и запасной путь | none | Acceptance scenario name | create | acceptance |
| scenario.permission.push.denied.name | Уведомления о подписках и ответах: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.remotenotif.denied.name | Актуальная серия клипов: отказ и запасной путь | none | Acceptance scenario name | settings | acceptance |
| scenario.permission.shareext.denied.name | Поделиться в «Образы» из Safari, «Фото» и мессенджеров — ссылка или кадр падает в черновик образа: отказ и запасной путь | none | Acceptance scenario name | settings<br>shareext | acceptance |
| scenario.permission.speech.denied.name | Субтитры к снятому клипу без ручного набора: отказ и запасной путь | none | Acceptance scenario name | create | acceptance |
| scenario.permission.tracking.denied.name | Реклама марок и локальных магазинов вместо платной подписки: отказ и запасной путь | none | Acceptance scenario name | ads<br>profile | acceptance |
| scenario.permission.voip.denied.name | Созвон по свопу без обмена номерами: телефон остаётся у владельца: отказ и запасной путь | none | Acceptance scenario name | chat<br>call | acceptance |
| scenario.permission.wifiinfo.denied.name | Отметка «я на свопе» подтверждается сетью площадки, а не словом участника: отказ и запасной путь | none | Acceptance scenario name | checkin | acceptance |
| scenario.publish.failure.name | Опубликовать образ: ошибка и восстановление | none | Acceptance scenario name | create<br>home<br>camera<br>media<br>subtitles<br>shareext | acceptance |
| scenario.publish.happy.name | Опубликовать образ: основной путь | none | Acceptance scenario name | create<br>home<br>camera<br>media<br>subtitles<br>shareext | acceptance |
| scenario.publish.offline.name | Опубликовать образ: без сети | none | Acceptance scenario name | create<br>home<br>camera<br>media<br>subtitles<br>shareext | acceptance |
| scenario.publish.persistence.name | Опубликовать образ: возврат после перезапуска | none | Acceptance scenario name | create<br>home<br>camera<br>media<br>subtitles<br>shareext | acceptance |
| screen.ads.action.dismiss-ads-explanation.label | Продолжить | none | Action label | ads | control |
| screen.ads.purpose | Объяснить обмен до системного запроса ATT | none | Product task | ads | accessibility-and-docs |
| screen.ads.state.error.body | Не удалось обновить «Реклама вместо подписки». Введённые данные сохранены; повторите попытку. | none | State copy: error | ads | state-body |
| screen.ads.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | ads | recovery |
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
| screen.background.action.return-to-talk.label | Вернуться к разбору | none | Action label | background | control |
| screen.background.purpose | Показать, что звук продолжается при погашенном экране | none | Product task | background | accessibility-and-docs |
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
| screen.call.purpose | Договориться о встрече, не раскрывая номер | none | Product task | call | accessibility-and-docs |
| screen.call.state.error.body | Не удалось обновить «Звонок по свопу». Введённые данные сохранены; повторите попытку. | none | State copy: error | call | state-body |
| screen.call.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | call | recovery |
| screen.call.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | call | state-body |
| screen.call.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | call | recovery |
| screen.call.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | call | state-body |
| screen.call.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | call | recovery |
| screen.call.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | call | state-body |
| screen.call.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | call | recovery |
| screen.call.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | call | state-body |
| screen.call.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | call | recovery |
| screen.call.state.populated-default.body | Актуальные данные раздела «Звонок по свопу» готовы к следующему действию. | none | State copy: populated/default | call | state-body |
| screen.call.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | call | recovery |
| screen.call.title | Звонок по свопу | none | Surface title | call | navigation-title |
| screen.camera.action.capture-photo.label | Сделать снимок | none | Action label | camera | control |
| screen.camera.purpose | Снять момент | none | Product task | camera | accessibility-and-docs |
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
| screen.chat.action.send-message.label | Отправить сообщение | none | Action label | chat | control |
| screen.chat.purpose | Договориться | none | Product task | chat | accessibility-and-docs |
| screen.chat.state.error.body | Не удалось обновить «Диалог». Введённые данные сохранены; повторите попытку. | none | State copy: error | chat | state-body |
| screen.chat.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chat | recovery |
| screen.chat.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | chat | state-body |
| screen.chat.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chat | recovery |
| screen.chat.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | chat | state-body |
| screen.chat.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | chat | recovery |
| screen.chat.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | chat | state-body |
| screen.chat.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | chat | recovery |
| screen.chat.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | chat | state-body |
| screen.chat.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | chat | recovery |
| screen.chat.state.populated-default.body | Актуальные данные раздела «Диалог» готовы к следующему действию. | none | State copy: populated/default | chat | state-body |
| screen.chat.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chat | recovery |
| screen.chat.title | Диалог | none | Surface title | chat | navigation-title |
| screen.chats.action.open-chat.label | Открыть диалог | none | Action label | chats | control |
| screen.chats.purpose | Вернуться к диалогам | none | Product task | chats | accessibility-and-docs |
| screen.chats.state.empty.body | В разделе «Сообщения» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | chats | state-body |
| screen.chats.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | chats | recovery |
| screen.chats.state.error.body | Не удалось обновить «Сообщения». Введённые данные сохранены; повторите попытку. | none | State copy: error | chats | state-body |
| screen.chats.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | chats | recovery |
| screen.chats.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | chats | state-body |
| screen.chats.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | chats | recovery |
| screen.chats.state.populated-default.body | Актуальные данные раздела «Сообщения» готовы к следующему действию. | none | State copy: populated/default | chats | state-body |
| screen.chats.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | chats | recovery |
| screen.chats.title | Сообщения | none | Surface title | chats | navigation-title |
| screen.checkin.action.confirm-swap-checkin.label | Отметиться на свопе | none | Action label | checkin | control |
| screen.checkin.purpose | Подтвердить присутствие сетью площадки | none | Product task | checkin | accessibility-and-docs |
| screen.checkin.state.error.body | Не удалось обновить «Отметка на свопе». Введённые данные сохранены; повторите попытку. | none | State copy: error | checkin | state-body |
| screen.checkin.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | checkin | recovery |
| screen.checkin.state.loading.body | Обновляем данные раздела «Отметка на свопе»; текущий контекст остаётся доступен. | none | State copy: loading | checkin | state-body |
| screen.checkin.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | checkin | recovery |
| screen.checkin.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | checkin | state-body |
| screen.checkin.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | checkin | recovery |
| screen.checkin.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | checkin | state-body |
| screen.checkin.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | checkin | recovery |
| screen.checkin.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | checkin | state-body |
| screen.checkin.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | checkin | recovery |
| screen.checkin.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | checkin | state-body |
| screen.checkin.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | checkin | recovery |
| screen.checkin.state.populated-default.body | Актуальные данные раздела «Отметка на свопе» готовы к следующему действию. | none | State copy: populated/default | checkin | state-body |
| screen.checkin.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | checkin | recovery |
| screen.checkin.title | Отметка на свопе | none | Surface title | checkin | navigation-title |
| screen.clip.action.remix-clip.label | Собрать свою версию | none | Action label | clip | control |
| screen.clip.purpose | Посмотреть серию | none | Product task | clip | accessibility-and-docs |
| screen.clip.state.error.body | Не удалось обновить «Клип-примерка». Введённые данные сохранены; повторите попытку. | none | State copy: error | clip | state-body |
| screen.clip.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | clip | recovery |
| screen.clip.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | clip | state-body |
| screen.clip.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | clip | recovery |
| screen.clip.state.populated-default.body | Актуальные данные раздела «Клип-примерка» готовы к следующему действию. | none | State copy: populated/default | clip | state-body |
| screen.clip.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | clip | recovery |
| screen.clip.title | Клип-примерка | none | Surface title | clip | navigation-title |
| screen.code.action.confirm-code.label | Продолжить | none | Action label | code | control |
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
| screen.codefail.action.retry-code.label | Продолжить | none | Action label | codefail | control |
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
| screen.create.action.open-camera.label | Снять образ | none | Action label | create | control |
| screen.create.purpose | Опубликовать момент | none | Product task | create | accessibility-and-docs |
| screen.create.state.error.body | Не удалось обновить «Новый образ». Введённые данные сохранены; повторите попытку. | none | State copy: error | create | state-body |
| screen.create.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | create | recovery |
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
| screen.create.state.populated-default.body | Актуальные данные раздела «Новый образ» готовы к следующему действию. | none | State copy: populated/default | create | state-body |
| screen.create.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | create | recovery |
| screen.create.title | Новый образ | none | Surface title | create | navigation-title |
| screen.event.action.join-event.label | Присоединиться | none | Action label | event | control |
| screen.event.purpose | Проверить условия свопа и присоединиться | none | Product task | event | accessibility-and-docs |
| screen.event.state.error.body | Не удалось обновить «Событие». Введённые данные сохранены; повторите попытку. | none | State copy: error | event | state-body |
| screen.event.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | event | recovery |
| screen.event.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | event | state-body |
| screen.event.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | event | recovery |
| screen.event.state.populated-default.body | Актуальные данные раздела «Событие» готовы к следующему действию. | none | State copy: populated/default | event | state-body |
| screen.event.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | event | recovery |
| screen.event.title | Событие | none | Surface title | event | navigation-title |
| screen.fill.purpose | Войти на сайт марки сохранённым в «Образах» входом | none | Product task | fill | accessibility-and-docs |
| screen.fill.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | fill | state-body |
| screen.fill.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | fill | recovery |
| screen.fill.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | fill | state-body |
| screen.fill.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | fill | recovery |
| screen.fill.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | fill | state-body |
| screen.fill.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | fill | recovery |
| screen.fill.state.populated-default.body | Актуальные данные раздела «Автозаполнение на сайте» готовы к следующему действию. | none | State copy: populated/default | fill | state-body |
| screen.fill.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | fill | recovery |
| screen.fill.title | Автозаполнение на сайте | none | Surface title | fill | navigation-title |
| screen.home.action.open-feed-post.label | Открыть публикацию | none | Action label | home | control |
| screen.home.purpose | Следить за авторами | none | Product task | home | accessibility-and-docs |
| screen.home.state.empty.body | В разделе «Лента» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | home | state-body |
| screen.home.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | home | recovery |
| screen.home.state.error.body | Не удалось обновить «Лента». Введённые данные сохранены; повторите попытку. | none | State copy: error | home | state-body |
| screen.home.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | home | recovery |
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
| screen.home.state.populated-default.body | Актуальные данные раздела «Лента» готовы к следующему действию. | none | State copy: populated/default | home | state-body |
| screen.home.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | home | recovery |
| screen.home.title | Лента | none | Surface title | home | navigation-title |
| screen.lock.action.request-face-id.label | Замок Face ID | none | Action label | lock | control |
| screen.lock.purpose | Закрыть подборки и черновики биометрией | none | Product task | lock | accessibility-and-docs |
| screen.lock.state.error.body | Не удалось обновить «Замок на «Сохранённом»». Введённые данные сохранены; повторите попытку. | none | State copy: error | lock | state-body |
| screen.lock.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | lock | recovery |
| screen.lock.state.loading.body | Обновляем данные раздела «Замок на «Сохранённом»»; текущий контекст остаётся доступен. | none | State copy: loading | lock | state-body |
| screen.lock.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | lock | recovery |
| screen.lock.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | lock | state-body |
| screen.lock.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | lock | recovery |
| screen.lock.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | lock | state-body |
| screen.lock.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | lock | recovery |
| screen.lock.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | lock | state-body |
| screen.lock.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | lock | recovery |
| screen.lock.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | lock | state-body |
| screen.lock.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | lock | recovery |
| screen.lock.state.populated-default.body | Актуальные данные раздела «Замок на «Сохранённом»» готовы к следующему действию. | none | State copy: populated/default | lock | state-body |
| screen.lock.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | lock | recovery |
| screen.lock.title | Замок на «Сохранённом» | none | Surface title | lock | navigation-title |
| screen.mates.action.open-contact-profile.label | Открыть профиль | none | Action label | mates | control |
| screen.mates.purpose | Найти знакомых среди тех, кто уже публикует | none | Product task | mates | accessibility-and-docs |
| screen.mates.state.empty.body | В разделе «Контакты в «Образах»» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | mates | state-body |
| screen.mates.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | mates | recovery |
| screen.mates.state.error.body | Не удалось обновить «Контакты в «Образах»». Введённые данные сохранены; повторите попытку. | none | State copy: error | mates | state-body |
| screen.mates.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | mates | recovery |
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
| screen.mates.state.populated-default.body | Актуальные данные раздела «Контакты в «Образах»» готовы к следующему действию. | none | State copy: populated/default | mates | state-body |
| screen.mates.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | mates | recovery |
| screen.mates.title | Контакты в «Образах» | none | Surface title | mates | navigation-title |
| screen.media.purpose | Выбрать фото | none | Product task | media | accessibility-and-docs |
| screen.media.state.populated-default.body | Актуальные данные раздела «Фото» готовы к следующему действию. | none | State copy: populated/default | media | state-body |
| screen.media.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | media | recovery |
| screen.media.title | Фото | none | Surface title | media | navigation-title |
| screen.nearby.action.enable-location.label | Разрешить геопозицию | none | Action label | nearby | control |
| screen.nearby.action.open-nearby-event.label | Смотреть подборку | none | Action label | nearby | control |
| screen.nearby.purpose | Найти своп или автора поблизости | none | Product task | nearby | accessibility-and-docs |
| screen.nearby.state.empty.body | В разделе «Рядом» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | nearby | state-body |
| screen.nearby.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | nearby | recovery |
| screen.nearby.state.error.body | Не удалось обновить «Рядом». Введённые данные сохранены; повторите попытку. | none | State copy: error | nearby | state-body |
| screen.nearby.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | nearby | recovery |
| screen.nearby.state.loading.body | Обновляем данные раздела «Рядом»; текущий контекст остаётся доступен. | none | State copy: loading | nearby | state-body |
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
| screen.nearby.state.populated-default.body | Актуальные данные раздела «Рядом» готовы к следующему действию. | none | State copy: populated/default | nearby | state-body |
| screen.nearby.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | nearby | recovery |
| screen.nearby.title | Рядом | none | Surface title | nearby | navigation-title |
| screen.netqr.action.join-venue-network.label | Подключиться | none | Action label | netqr | control |
| screen.netqr.purpose | Подключиться к гостевой сети площадки | none | Product task | netqr | accessibility-and-docs |
| screen.netqr.state.error.body | Не удалось обновить «Сеть площадки по QR». Введённые данные сохранены; повторите попытку. | none | State copy: error | netqr | state-body |
| screen.netqr.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | netqr | recovery |
| screen.netqr.state.loading.body | Обновляем данные раздела «Сеть площадки по QR»; текущий контекст остаётся доступен. | none | State copy: loading | netqr | state-body |
| screen.netqr.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | netqr | recovery |
| screen.netqr.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | netqr | state-body |
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
| screen.notifications.action.open-notification.label | Открыть уведомление | none | Action label | notifications | control |
| screen.notifications.purpose | Вернуться к реакциям, комментариям и новым подпискам | none | Product task | notifications | accessibility-and-docs |
| screen.notifications.state.empty.body | В разделе «Уведомления» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | notifications | state-body |
| screen.notifications.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | notifications | recovery |
| screen.notifications.state.error.body | Не удалось обновить «Уведомления». Введённые данные сохранены; повторите попытку. | none | State copy: error | notifications | state-body |
| screen.notifications.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | notifications | recovery |
| screen.notifications.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | notifications | state-body |
| screen.notifications.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | notifications | recovery |
| screen.notifications.state.populated-default.body | Актуальные данные раздела «Уведомления» готовы к следующему действию. | none | State copy: populated/default | notifications | state-body |
| screen.notifications.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | notifications | recovery |
| screen.notifications.title | Уведомления | none | Surface title | notifications | navigation-title |
| screen.phone.action.continue-email.label | Продолжить | none | Action label | phone | control |
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
| screen.post.action.save-look.label | Сохранить образ | none | Action label | post | control |
| screen.post.purpose | Обсудить образ | none | Product task | post | accessibility-and-docs |
| screen.post.state.error.body | Не удалось обновить «Публикация». Введённые данные сохранены; повторите попытку. | none | State copy: error | post | state-body |
| screen.post.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | post | recovery |
| screen.post.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | post | state-body |
| screen.post.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | post | recovery |
| screen.post.state.populated-default.body | Актуальные данные раздела «Публикация» готовы к следующему действию. | none | State copy: populated/default | post | state-body |
| screen.post.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | post | recovery |
| screen.post.title | Публикация | none | Surface title | post | navigation-title |
| screen.profile.action.edit-bio.label | Изменить информацию о себе | none | Action label | profile | control |
| screen.profile.purpose | Управлять профилем | none | Product task | profile | accessibility-and-docs |
| screen.profile.state.empty.body | В разделе «Профиль автора» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | profile | state-body |
| screen.profile.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | profile | recovery |
| screen.profile.state.error.body | Не удалось обновить «Профиль автора». Введённые данные сохранены; повторите попытку. | none | State copy: error | profile | state-body |
| screen.profile.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | profile | recovery |
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
| screen.profile.state.populated-default.body | Актуальные данные раздела «Профиль автора» готовы к следующему действию. | none | State copy: populated/default | profile | state-body |
| screen.profile.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | profile | recovery |
| screen.profile.title | Профиль автора | none | Surface title | profile | navigation-title |
| screen.search.action.open-search-result.label | Открыть результат | none | Action label | search | control |
| screen.search.purpose | Найти образы, вещи и авторов | none | Product task | search | accessibility-and-docs |
| screen.search.state.empty.body | В разделе «Поиск» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | search | state-body |
| screen.search.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | search | recovery |
| screen.search.state.error.body | Не удалось обновить «Поиск». Введённые данные сохранены; повторите попытку. | none | State copy: error | search | state-body |
| screen.search.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | search | recovery |
| screen.search.state.loading.body | Обновляем данные раздела «Поиск»; текущий контекст остаётся доступен. | none | State copy: loading | search | state-body |
| screen.search.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | search | recovery |
| screen.search.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | search | state-body |
| screen.search.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | search | recovery |
| screen.search.state.populated-default.body | Актуальные данные раздела «Поиск» готовы к следующему действию. | none | State copy: populated/default | search | state-body |
| screen.search.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | search | recovery |
| screen.search.title | Поиск | none | Surface title | search | navigation-title |
| screen.services.action.open-wardrobe.label | Открыть гардероб | none | Action label | services | control |
| screen.services.purpose | Открыть гардероб, свопы, знакомых и настройки | none | Product task | services | accessibility-and-docs |
| screen.services.state.error.body | Не удалось обновить «Меню». Введённые данные сохранены; повторите попытку. | none | State copy: error | services | state-body |
| screen.services.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | services | recovery |
| screen.services.state.loading.body | Обновляем данные раздела «Меню»; текущий контекст остаётся доступен. | none | State copy: loading | services | state-body |
| screen.services.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | services | recovery |
| screen.services.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | services | state-body |
| screen.services.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | services | recovery |
| screen.services.state.populated-default.body | Актуальные данные раздела «Меню» готовы к следующему действию. | none | State copy: populated/default | services | state-body |
| screen.services.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | services | recovery |
| screen.services.title | Меню | none | Surface title | services | navigation-title |
| screen.settings.action.toggle-background-feed.label | Обновлять ленту в фоне | none | Action label | settings | control |
| screen.settings.purpose | Держать доступы и системные функции под рукой | none | Product task | settings | accessibility-and-docs |
| screen.settings.state.error.body | Не удалось обновить «Настройки». Введённые данные сохранены; повторите попытку. | none | State copy: error | settings | state-body |
| screen.settings.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | settings | recovery |
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
| screen.shareext.action.save-shared-draft.label | Сохранить в черновик | none | Action label | shareext | control |
| screen.shareext.purpose | Принять ссылку или кадр из другого приложения в черновик | none | Product task | shareext | accessibility-and-docs |
| screen.shareext.state.error.body | Не удалось обновить «Поделиться в «Образы»». Введённые данные сохранены; повторите попытку. | none | State copy: error | shareext | state-body |
| screen.shareext.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | shareext | recovery |
| screen.shareext.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | shareext | state-body |
| screen.shareext.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | shareext | recovery |
| screen.shareext.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | shareext | state-body |
| screen.shareext.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | shareext | recovery |
| screen.shareext.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | shareext | state-body |
| screen.shareext.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | shareext | recovery |
| screen.shareext.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | shareext | state-body |
| screen.shareext.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | shareext | recovery |
| screen.shareext.state.populated-default.body | Актуальные данные раздела «Поделиться в «Образы»» готовы к следующему действию. | none | State copy: populated/default | shareext | state-body |
| screen.shareext.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | shareext | recovery |
| screen.shareext.title | Поделиться в «Образы» | none | Surface title | shareext | navigation-title |
| screen.subtitles.action.publish-captioned-clip.label | Опубликовать клип | none | Action label | subtitles | control |
| screen.subtitles.purpose | Собрать и поправить субтитры перед публикацией | none | Product task | subtitles | accessibility-and-docs |
| screen.subtitles.state.error.body | Не удалось обновить «Субтитры к клипу». Введённые данные сохранены; повторите попытку. | none | State copy: error | subtitles | state-body |
| screen.subtitles.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | subtitles | recovery |
| screen.subtitles.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | subtitles | state-body |
| screen.subtitles.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | subtitles | recovery |
| screen.subtitles.state.populated-default.body | Актуальные данные раздела «Субтитры к клипу» готовы к следующему действию. | none | State copy: populated/default | subtitles | state-body |
| screen.subtitles.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | subtitles | recovery |
| screen.subtitles.title | Субтитры к клипу | none | Surface title | subtitles | navigation-title |
| screen.swap.action.add-swap-calendar.label | Добавить в Календарь | none | Action label | swap | control |
| screen.swap.purpose | Собрать всё о свопе и положить дату в календарь | none | Product task | swap | accessibility-and-docs |
| screen.swap.state.error.body | Не удалось обновить «Своп в Новой Голландии». Введённые данные сохранены; повторите попытку. | none | State copy: error | swap | state-body |
| screen.swap.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | swap | recovery |
| screen.swap.state.loading.body | Обновляем данные раздела «Своп в Новой Голландии»; текущий контекст остаётся доступен. | none | State copy: loading | swap | state-body |
| screen.swap.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | swap | recovery |
| screen.swap.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | swap | state-body |
| screen.swap.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | swap | recovery |
| screen.swap.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | swap | state-body |
| screen.swap.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | swap | recovery |
| screen.swap.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | swap | state-body |
| screen.swap.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | swap | recovery |
| screen.swap.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | swap | state-body |
| screen.swap.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | swap | recovery |
| screen.swap.state.populated-default.body | Актуальные данные раздела «Своп в Новой Голландии» готовы к следующему действию. | none | State copy: populated/default | swap | state-body |
| screen.swap.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | swap | recovery |
| screen.swap.title | Своп в Новой Голландии | none | Surface title | swap | navigation-title |
| screen.talk.action.start-background-audio.label | Слушать | none | Action label | talk | control |
| screen.talk.purpose | Слушать разбор и продолжать в фоне | none | Product task | talk | accessibility-and-docs |
| screen.talk.state.error.body | Не удалось обновить «Разбор голосом». Введённые данные сохранены; повторите попытку. | none | State copy: error | talk | state-body |
| screen.talk.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | talk | recovery |
| screen.talk.state.loading.body | Обновляем данные раздела «Разбор голосом»; текущий контекст остаётся доступен. | none | State copy: loading | talk | state-body |
| screen.talk.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | talk | recovery |
| screen.talk.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | talk | state-body |
| screen.talk.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | talk | recovery |
| screen.talk.state.permission-denied.body | Доступ отключён. Продолжите задачу запасным способом без системного разрешения. | none | State copy: permission-denied | talk | state-body |
| screen.talk.state.permission-denied.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-denied | talk | recovery |
| screen.talk.state.permission-needed.body | Для следующего действия нужен системный доступ; запрос появится только после подтверждения. | none | State copy: permission-needed | talk | state-body |
| screen.talk.state.permission-needed.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-needed | talk | recovery |
| screen.talk.state.permission-restricted.body | Доступ ограничен настройками устройства или семьи; системный запрос недоступен. | none | State copy: permission-restricted | talk | state-body |
| screen.talk.state.permission-restricted.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: permission-restricted | talk | recovery |
| screen.talk.state.populated-default.body | Актуальные данные раздела «Разбор голосом» готовы к следующему действию. | none | State copy: populated/default | talk | state-body |
| screen.talk.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | talk | recovery |
| screen.talk.title | Разбор голосом | none | Surface title | talk | navigation-title |
| screen.voice.action.send-voice.label | Отправить | none | Action label | voice | control |
| screen.voice.purpose | Записать голос | none | Product task | voice | accessibility-and-docs |
| screen.voice.state.error.body | Не удалось обновить «Голосовое сообщение». Введённые данные сохранены; повторите попытку. | none | State copy: error | voice | state-body |
| screen.voice.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | voice | recovery |
| screen.voice.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | voice | state-body |
| screen.voice.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | voice | recovery |
| screen.voice.state.populated-default.body | Актуальные данные раздела «Голосовое сообщение» готовы к следующему действию. | none | State copy: populated/default | voice | state-body |
| screen.voice.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | voice | recovery |
| screen.voice.title | Голосовое сообщение | none | Surface title | voice | navigation-title |
| screen.wardrobe.action.open-saved-look.label | Открыть сохранённый образ | none | Action label | wardrobe | control |
| screen.wardrobe.purpose | Управлять вещами, из которых собираются образы | none | Product task | wardrobe | accessibility-and-docs |
| screen.wardrobe.state.empty.body | В разделе «Гардероб» пока ничего нет — создайте первое содержательное действие. | none | State copy: empty | wardrobe | state-body |
| screen.wardrobe.state.empty.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: empty | wardrobe | recovery |
| screen.wardrobe.state.error.body | Не удалось обновить «Гардероб». Введённые данные сохранены; повторите попытку. | none | State copy: error | wardrobe | state-body |
| screen.wardrobe.state.error.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: error | wardrobe | recovery |
| screen.wardrobe.state.loading.body | Обновляем данные раздела «Гардероб»; текущий контекст остаётся доступен. | none | State copy: loading | wardrobe | state-body |
| screen.wardrobe.state.loading.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: loading | wardrobe | recovery |
| screen.wardrobe.state.offline.body | Нет сети. Показаны сохранённые данные образов; свежесть отмечена явно. | none | State copy: offline | wardrobe | state-body |
| screen.wardrobe.state.offline.recovery | Повторить действие или выбрать доступный запасной путь. | none | Recovery copy: offline | wardrobe | recovery |
| screen.wardrobe.state.populated-default.body | Актуальные данные раздела «Гардероб» готовы к следующему действию. | none | State copy: populated/default | wardrobe | state-body |
| screen.wardrobe.state.populated-default.recovery | Продолжить основное действие. | none | Recovery copy: populated/default | wardrobe | recovery |
| screen.wardrobe.title | Гардероб | none | Surface title | wardrobe | navigation-title |
| screen.widget.purpose | Поставить виджет сохранённого образа на экран «Домой» | none | Product task | widget | accessibility-and-docs |
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
| all.happy | all | happy-path | surface:phone<br>fixture:fixture.looks.phone.default | perform-action:phone.continue-email<br>open-surface:code<br>open-surface:codefail<br>perform-action:home.open-feed-post<br>open-surface:post<br>open-surface:nearby<br>open-surface:clip<br>perform-action:create.open-camera<br>open-surface:camera<br>open-surface:media<br>perform-action:chats.open-chat<br>open-surface:chat<br>open-surface:voice<br>open-surface:profile<br>open-surface:settings<br>open-surface:widget<br>open-surface:fill<br>open-surface:mates<br>open-surface:ads<br>open-surface:lock<br>open-surface:subtitles<br>open-surface:talk<br>open-surface:background<br>open-surface:call<br>open-surface:swap<br>open-surface:checkin<br>open-surface:netqr<br>open-surface:shareext | surface-visible:shareext<br>outcome-visible:value |
| all.failure | all | failure-recovery | surface:phone<br>fixture:fixture.looks.phone.error<br>inject-state:error | invoke-recovery:phone | recovery-visible:phone<br>input-preserved:phone |
| all.offline | all | offline | surface:phone<br>fixture:fixture.looks.phone.offline<br>connectivity:offline | open-surface:phone | state-visible:phone.offline<br>recovery-visible:phone |
| all.persistence | all | persistence-return | surface:phone<br>checkpoint-flow:all | relaunch:application<br>return-to-flow:all | flow-context-restored:all<br>surface-visible:phone |
| discover.happy | discover | happy-path | surface:home<br>fixture:fixture.looks.home.default | open-surface:home<br>open-surface:create<br>open-surface:post<br>open-surface:talk<br>open-surface:clip<br>open-surface:nearby<br>open-surface:chats<br>open-surface:profile<br>open-surface:background | surface-visible:background<br>outcome-visible:value |
| discover.failure | discover | failure-recovery | surface:home<br>fixture:fixture.looks.home.error<br>inject-state:error | invoke-recovery:home | recovery-visible:home<br>input-preserved:home |
| discover.offline | discover | offline | surface:home<br>fixture:fixture.looks.home.offline<br>connectivity:offline | open-surface:home | state-visible:home.offline<br>recovery-visible:home |
| discover.persistence | discover | persistence-return | surface:home<br>checkpoint-flow:discover | relaunch:application<br>return-to-flow:discover | flow-context-restored:discover<br>surface-visible:home |
| publish.happy | publish | happy-path | surface:create<br>fixture:fixture.looks.create.default | open-surface:create<br>open-surface:home<br>open-surface:camera<br>open-surface:media<br>open-surface:subtitles<br>open-surface:shareext | surface-visible:shareext<br>outcome-visible:value |
| publish.failure | publish | failure-recovery | surface:create<br>fixture:fixture.looks.create.error<br>inject-state:error | invoke-recovery:create | recovery-visible:create<br>input-preserved:create |
| publish.offline | publish | offline | surface:create<br>fixture:fixture.looks.create.offline<br>connectivity:offline | open-surface:create | state-visible:create.offline<br>recovery-visible:create |
| publish.persistence | publish | persistence-return | surface:create<br>checkpoint-flow:publish | relaunch:application<br>return-to-flow:publish | flow-context-restored:publish<br>surface-visible:create |
| clip.happy | clip | happy-path | surface:clip<br>fixture:fixture.looks.clip.default | open-surface:clip<br>open-surface:swap<br>open-surface:nearby<br>open-surface:checkin<br>open-surface:netqr | surface-visible:netqr<br>outcome-visible:value |
| clip.failure | clip | failure-recovery | surface:clip<br>fixture:fixture.looks.clip.error<br>inject-state:error | invoke-recovery:clip | recovery-visible:clip<br>input-preserved:clip |
| clip.offline | clip | offline | surface:clip<br>fixture:fixture.looks.clip.offline<br>connectivity:offline | open-surface:clip | state-visible:clip.offline<br>recovery-visible:clip |
| clip.persistence | clip | persistence-return | surface:clip<br>checkpoint-flow:clip | relaunch:application<br>return-to-flow:clip | flow-context-restored:clip<br>surface-visible:clip |
| meet.happy | meet | happy-path | surface:chats<br>fixture:fixture.looks.chats.default | perform-action:chats.open-chat<br>open-surface:chat<br>open-surface:nearby<br>open-surface:profile<br>open-surface:voice<br>open-surface:call<br>open-surface:mates | surface-visible:mates<br>outcome-visible:value |
| meet.failure | meet | failure-recovery | surface:chats<br>fixture:fixture.looks.chats.error<br>inject-state:error | invoke-recovery:chats | recovery-visible:chats<br>input-preserved:chats |
| meet.offline | meet | offline | surface:chats<br>fixture:fixture.looks.chats.offline<br>connectivity:offline | open-surface:chats | state-visible:chats.offline<br>recovery-visible:chats |
| meet.persistence | meet | persistence-return | surface:chats<br>checkpoint-flow:meet | relaunch:application<br>return-to-flow:meet | flow-context-restored:meet<br>surface-visible:chats |
| permission.camera.denied | permission:camera | permission-denial-fallback | surface:create<br>fixture:fixture.looks.camera.denied<br>permission-status:camera.not-determined | deny-permission:camera | state-visible:camera.permission-denied<br>fallback-visible:camera |
| permission.photos.denied | permission:photos | permission-denial-fallback | surface:create<br>fixture:fixture.looks.create.permission-denied<br>permission-status:photos.not-determined | deny-permission:photos | state-visible:create.permission-denied<br>fallback-visible:photos |
| permission.mic.denied | permission:mic | permission-denial-fallback | surface:chat<br>fixture:fixture.looks.chat.permission-denied<br>permission-status:mic.not-determined | deny-permission:mic | state-visible:chat.permission-denied<br>fallback-visible:mic |
| permission.location.denied | permission:location | permission-denial-fallback | surface:home<br>fixture:fixture.looks.nearby.permission-denied<br>permission-status:location.not-determined | deny-permission:location | state-visible:nearby.permission-denied<br>fallback-visible:location |
| permission.push.denied | permission:push | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.settings.permission-denied<br>permission-status:push.not-determined | deny-permission:push | state-visible:settings.permission-denied<br>fallback-visible:push |
| permission.commnotif.denied | permission:commnotif | permission-denial-fallback | surface:chat<br>fixture:fixture.looks.chat.permission-denied<br>permission-status:commnotif.not-determined | deny-permission:commnotif | state-visible:chat.permission-denied<br>fallback-visible:commnotif |
| permission.remotenotif.denied | permission:remotenotif | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.settings.permission-denied<br>permission-status:remotenotif.not-determined | deny-permission:remotenotif | state-visible:settings.permission-denied<br>fallback-visible:remotenotif |
| permission.fetch.denied | permission:fetch | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.settings.permission-denied<br>permission-status:fetch.not-determined | deny-permission:fetch | state-visible:settings.permission-denied<br>fallback-visible:fetch |
| permission.appgroups.denied | permission:appgroups | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.settings.permission-denied<br>permission-status:appgroups.not-determined | deny-permission:appgroups | state-visible:settings.permission-denied<br>fallback-visible:appgroups |
| permission.keychain.denied | permission:keychain | permission-denial-fallback | surface:widget<br>fixture:fixture.looks.profile.permission-denied<br>permission-status:keychain.not-determined | deny-permission:keychain | state-visible:profile.permission-denied<br>fallback-visible:keychain |
| permission.autofill.denied | permission:autofill | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.fill.permission-denied<br>permission-status:autofill.not-determined | deny-permission:autofill | state-visible:fill.permission-denied<br>fallback-visible:autofill |
| permission.wifiinfo.denied | permission:wifiinfo | permission-denial-fallback | surface:checkin<br>fixture:fixture.looks.checkin.denied<br>permission-status:wifiinfo.not-determined | deny-permission:wifiinfo | state-visible:checkin.permission-denied<br>fallback-visible:wifiinfo |
| permission.contacts.denied | permission:contacts | permission-denial-fallback | surface:profile<br>fixture:fixture.looks.mates.denied<br>permission-status:contacts.not-determined | deny-permission:contacts | state-visible:mates.permission-denied<br>fallback-visible:contacts |
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.looks.profile.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:profile.permission-denied<br>fallback-visible:tracking |
| permission.faceid.denied | permission:faceid | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.lock.denied<br>permission-status:faceid.not-determined | deny-permission:faceid | state-visible:lock.permission-denied<br>fallback-visible:faceid |
| permission.speech.denied | permission:speech | permission-denial-fallback | surface:create<br>fixture:fixture.looks.create.permission-denied<br>permission-status:speech.not-determined | deny-permission:speech | state-visible:create.permission-denied<br>fallback-visible:speech |
| permission.audio.denied | permission:audio | permission-denial-fallback | surface:talk<br>fixture:fixture.looks.background.permission-denied<br>permission-status:audio.not-determined | deny-permission:audio | state-visible:background.permission-denied<br>fallback-visible:audio |
| permission.voip.denied | permission:voip | permission-denial-fallback | surface:chat<br>fixture:fixture.looks.call.permission-denied<br>permission-status:voip.not-determined | deny-permission:voip | state-visible:call.permission-denied<br>fallback-visible:voip |
| permission.calendar.denied | permission:calendar | permission-denial-fallback | surface:swap<br>fixture:fixture.looks.swap.permission-denied<br>permission-status:calendar.not-determined | deny-permission:calendar | state-visible:swap.permission-denied<br>fallback-visible:calendar |
| permission.shareext.denied | permission:shareext | permission-denial-fallback | surface:settings<br>fixture:fixture.looks.shareext.permission-denied<br>permission-status:shareext.not-determined | deny-permission:shareext | state-visible:shareext.permission-denied<br>fallback-visible:shareext |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:netqr<br>fixture:fixture.looks.netqr.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:netqr.permission-denied<br>fallback-visible:hotspot |

## Deterministic fixture catalog

Every captured or acceptance-tested state has stable ids, realistic Russian content, stress data, and media provenance where media is present.

| Fixture | Surface / state | Deterministic ids | Edge cases | Provenance | Media / license |
|---|---|---|---|---|---|
| fixture.looks.phone.default | phone / default | looks.phone.default.primary.001<br>looks.phone.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.phone.loading | phone / loading | looks.phone.loading.primary.001<br>looks.phone.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.phone.error | phone / error | looks.phone.error.primary.001<br>looks.phone.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.phone.offline | phone / offline | looks.phone.offline.primary.001<br>looks.phone.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.code.default | code / default | looks.code.default.primary.001<br>looks.code.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.code.loading | code / loading | looks.code.loading.primary.001<br>looks.code.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.code.error | code / error | looks.code.error.primary.001<br>looks.code.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.code.offline | code / offline | looks.code.offline.primary.001<br>looks.code.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.codefail.default | codefail / default | looks.codefail.default.primary.001<br>looks.codefail.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.codefail.loading | codefail / loading | looks.codefail.loading.primary.001<br>looks.codefail.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.codefail.error | codefail / error | looks.codefail.error.primary.001<br>looks.codefail.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.codefail.offline | codefail / offline | looks.codefail.offline.primary.001<br>looks.codefail.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.home.default | home / default | looks.home.default.primary.001<br>looks.home.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.home.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.home.empty | home / empty | looks.home.empty.primary.001<br>looks.home.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.home.error | home / error | looks.home.error.primary.001<br>looks.home.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.home.offline | home / offline | looks.home.offline.primary.001<br>looks.home.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.home.permission-needed | home / permission-needed | looks.home.permission-needed.primary.001<br>looks.home.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.home.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.home.permission-denied | home / permission-denied | looks.home.permission-denied.primary.001<br>looks.home.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.home.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.home.permission-restricted | home / permission-restricted | looks.home.permission-restricted.primary.001<br>looks.home.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.home.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.home.permission-limited | home / permission-limited | looks.home.permission-limited.primary.001<br>looks.home.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.home.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.search.default | search / default | looks.search.default.primary.001<br>looks.search.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.search.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.search.query | search / query | looks.search.query.primary.001<br>looks.search.query.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.search.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.search.empty | search / empty | looks.search.empty.primary.001<br>looks.search.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.search.loading | search / loading | looks.search.loading.primary.001<br>looks.search.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.search.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.search.error | search / error | looks.search.error.primary.001<br>looks.search.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.search.offline | search / offline | looks.search.offline.primary.001<br>looks.search.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.notifications.unread | notifications / unread | looks.notifications.unread.primary.001<br>looks.notifications.unread.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.notifications.read | notifications / read | looks.notifications.read.primary.001<br>looks.notifications.read.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.notifications.empty | notifications / empty | looks.notifications.empty.primary.001<br>looks.notifications.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.notifications.error | notifications / error | looks.notifications.error.primary.001<br>looks.notifications.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.notifications.offline | notifications / offline | looks.notifications.offline.primary.001<br>looks.notifications.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.post.default | post / default | looks.post.default.primary.001<br>looks.post.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.post.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.post.error | post / error | looks.post.error.primary.001<br>looks.post.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.post.offline | post / offline | looks.post.offline.primary.001<br>looks.post.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.nearby.default | nearby / default | looks.nearby.default.primary.001<br>looks.nearby.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.nearby.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.nearby.empty | nearby / empty | looks.nearby.empty.primary.001<br>looks.nearby.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.nearby.loading | nearby / loading | looks.nearby.loading.primary.001<br>looks.nearby.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.nearby.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.nearby.error | nearby / error | looks.nearby.error.primary.001<br>looks.nearby.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.nearby.offline | nearby / offline | looks.nearby.offline.primary.001<br>looks.nearby.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.nearby.permission-needed | nearby / permission-needed | looks.nearby.permission-needed.primary.001<br>looks.nearby.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.nearby.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.nearby.permission-denied | nearby / permission-denied | looks.nearby.permission-denied.primary.001<br>looks.nearby.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.nearby.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.nearby.permission-restricted | nearby / permission-restricted | looks.nearby.permission-restricted.primary.001<br>looks.nearby.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.nearby.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.nearby.permission-limited | nearby / permission-limited | looks.nearby.permission-limited.primary.001<br>looks.nearby.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.nearby.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.clip.default | clip / default | looks.clip.default.primary.001<br>looks.clip.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.clip.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.clip.error | clip / error | looks.clip.error.primary.001<br>looks.clip.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.clip.offline | clip / offline | looks.clip.offline.primary.001<br>looks.clip.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.create.default | create / default | looks.create.default.primary.001<br>looks.create.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.create.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.create.error | create / error | looks.create.error.primary.001<br>looks.create.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.create.success | create / success | looks.create.success.primary.001<br>looks.create.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.create.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.create.offline | create / offline | looks.create.offline.primary.001<br>looks.create.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.create.permission-needed | create / permission-needed | looks.create.permission-needed.primary.001<br>looks.create.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.create.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.create.permission-denied | create / permission-denied | looks.create.permission-denied.primary.001<br>looks.create.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.create.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.create.permission-restricted | create / permission-restricted | looks.create.permission-restricted.primary.001<br>looks.create.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.create.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.create.permission-limited | create / permission-limited | looks.create.permission-limited.primary.001<br>looks.create.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.create.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.camera.default | camera / default | looks.camera.default.primary.001<br>looks.camera.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.camera.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.camera.denied | camera / denied | looks.camera.denied.primary.001<br>looks.camera.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.camera.loading | camera / loading | looks.camera.loading.primary.001<br>looks.camera.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.camera.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.camera.error | camera / error | looks.camera.error.primary.001<br>looks.camera.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.camera.offline | camera / offline | looks.camera.offline.primary.001<br>looks.camera.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.camera.permission-needed | camera / permission-needed | looks.camera.permission-needed.primary.001<br>looks.camera.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.camera.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.camera.permission-restricted | camera / permission-restricted | looks.camera.permission-restricted.primary.001<br>looks.camera.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.camera.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.camera.permission-limited | camera / permission-limited | looks.camera.permission-limited.primary.001<br>looks.camera.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.camera.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.media.default | media / default | looks.media.default.primary.001<br>looks.media.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.media.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.chats.default | chats / default | looks.chats.default.primary.001<br>looks.chats.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chats.empty | chats / empty | looks.chats.empty.primary.001<br>looks.chats.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chats.error | chats / error | looks.chats.error.primary.001<br>looks.chats.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chats.offline | chats / offline | looks.chats.offline.primary.001<br>looks.chats.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chat.default | chat / default | looks.chat.default.primary.001<br>looks.chat.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chat.error | chat / error | looks.chat.error.primary.001<br>looks.chat.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chat.offline | chat / offline | looks.chat.offline.primary.001<br>looks.chat.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chat.permission-needed | chat / permission-needed | looks.chat.permission-needed.primary.001<br>looks.chat.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chat.permission-denied | chat / permission-denied | looks.chat.permission-denied.primary.001<br>looks.chat.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.chat.permission-restricted | chat / permission-restricted | looks.chat.permission-restricted.primary.001<br>looks.chat.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.voice.default | voice / default | looks.voice.default.primary.001<br>looks.voice.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.voice.denied | voice / denied | looks.voice.denied.primary.001<br>looks.voice.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.voice.error | voice / error | looks.voice.error.primary.001<br>looks.voice.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.voice.offline | voice / offline | looks.voice.offline.primary.001<br>looks.voice.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.profile.default | profile / default | looks.profile.default.primary.001<br>looks.profile.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.profile.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.profile.empty | profile / empty | looks.profile.empty.primary.001<br>looks.profile.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.profile.error | profile / error | looks.profile.error.primary.001<br>looks.profile.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.profile.offline | profile / offline | looks.profile.offline.primary.001<br>looks.profile.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.profile.permission-needed | profile / permission-needed | looks.profile.permission-needed.primary.001<br>looks.profile.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.profile.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.profile.permission-denied | profile / permission-denied | looks.profile.permission-denied.primary.001<br>looks.profile.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.profile.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.profile.permission-restricted | profile / permission-restricted | looks.profile.permission-restricted.primary.001<br>looks.profile.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.profile.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.profile.permission-limited | profile / permission-limited | looks.profile.permission-limited.primary.001<br>looks.profile.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.profile.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.services.default | services / default | looks.services.default.primary.001<br>looks.services.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.services.loading | services / loading | looks.services.loading.primary.001<br>looks.services.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.services.error | services / error | looks.services.error.primary.001<br>looks.services.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.services.offline | services / offline | looks.services.offline.primary.001<br>looks.services.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.settings.default | settings / default | looks.settings.default.primary.001<br>looks.settings.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.settings.error | settings / error | looks.settings.error.primary.001<br>looks.settings.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.settings.offline | settings / offline | looks.settings.offline.primary.001<br>looks.settings.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.settings.permission-needed | settings / permission-needed | looks.settings.permission-needed.primary.001<br>looks.settings.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.settings.permission-denied | settings / permission-denied | looks.settings.permission-denied.primary.001<br>looks.settings.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.settings.permission-restricted | settings / permission-restricted | looks.settings.permission-restricted.primary.001<br>looks.settings.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.widget.default | widget / default | looks.widget.default.primary.001<br>looks.widget.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.widget.permission-needed | widget / permission-needed | looks.widget.permission-needed.primary.001<br>looks.widget.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.widget.permission-denied | widget / permission-denied | looks.widget.permission-denied.primary.001<br>looks.widget.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.widget.permission-restricted | widget / permission-restricted | looks.widget.permission-restricted.primary.001<br>looks.widget.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.fill.default | fill / default | looks.fill.default.primary.001<br>looks.fill.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.fill.permission-needed | fill / permission-needed | looks.fill.permission-needed.primary.001<br>looks.fill.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.fill.permission-denied | fill / permission-denied | looks.fill.permission-denied.primary.001<br>looks.fill.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.fill.permission-restricted | fill / permission-restricted | looks.fill.permission-restricted.primary.001<br>looks.fill.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.default | mates / default | looks.mates.default.primary.001<br>looks.mates.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.empty | mates / empty | looks.mates.empty.primary.001<br>looks.mates.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.denied | mates / denied | looks.mates.denied.primary.001<br>looks.mates.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.error | mates / error | looks.mates.error.primary.001<br>looks.mates.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.offline | mates / offline | looks.mates.offline.primary.001<br>looks.mates.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.permission-needed | mates / permission-needed | looks.mates.permission-needed.primary.001<br>looks.mates.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.permission-restricted | mates / permission-restricted | looks.mates.permission-restricted.primary.001<br>looks.mates.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.mates.permission-limited | mates / permission-limited | looks.mates.permission-limited.primary.001<br>looks.mates.permission-limited.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.wardrobe.populated | wardrobe / populated | looks.wardrobe.populated.primary.001<br>looks.wardrobe.populated.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.wardrobe.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.wardrobe.empty | wardrobe / empty | looks.wardrobe.empty.primary.001<br>looks.wardrobe.empty.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.wardrobe.loading | wardrobe / loading | looks.wardrobe.loading.primary.001<br>looks.wardrobe.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.wardrobe.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.wardrobe.error | wardrobe / error | looks.wardrobe.error.primary.001<br>looks.wardrobe.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.wardrobe.offline | wardrobe / offline | looks.wardrobe.offline.primary.001<br>looks.wardrobe.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.event.available | event / available | looks.event.available.primary.001<br>looks.event.available.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.event.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.event.joined | event / joined | looks.event.joined.primary.001<br>looks.event.joined.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.event.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.event.cancelled | event / cancelled | looks.event.cancelled.primary.001<br>looks.event.cancelled.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.event.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.event.offline | event / offline | looks.event.offline.primary.001<br>looks.event.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.ads.default | ads / default | looks.ads.default.primary.001<br>looks.ads.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.ads.error | ads / error | looks.ads.error.primary.001<br>looks.ads.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.ads.offline | ads / offline | looks.ads.offline.primary.001<br>looks.ads.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.ads.permission-needed | ads / permission-needed | looks.ads.permission-needed.primary.001<br>looks.ads.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.ads.permission-denied | ads / permission-denied | looks.ads.permission-denied.primary.001<br>looks.ads.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.ads.permission-restricted | ads / permission-restricted | looks.ads.permission-restricted.primary.001<br>looks.ads.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.default | lock / default | looks.lock.default.primary.001<br>looks.lock.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.denied | lock / denied | looks.lock.denied.primary.001<br>looks.lock.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.loading | lock / loading | looks.lock.loading.primary.001<br>looks.lock.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.error | lock / error | looks.lock.error.primary.001<br>looks.lock.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.offline | lock / offline | looks.lock.offline.primary.001<br>looks.lock.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.permission-needed | lock / permission-needed | looks.lock.permission-needed.primary.001<br>looks.lock.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.lock.permission-restricted | lock / permission-restricted | looks.lock.permission-restricted.primary.001<br>looks.lock.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.subtitles.default | subtitles / default | looks.subtitles.default.primary.001<br>looks.subtitles.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.subtitles.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.subtitles.error | subtitles / error | looks.subtitles.error.primary.001<br>looks.subtitles.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.subtitles.success | subtitles / success | looks.subtitles.success.primary.001<br>looks.subtitles.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.subtitles.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.subtitles.offline | subtitles / offline | looks.subtitles.offline.primary.001<br>looks.subtitles.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.default | talk / default | looks.talk.default.primary.001<br>looks.talk.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.loading | talk / loading | looks.talk.loading.primary.001<br>looks.talk.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.error | talk / error | looks.talk.error.primary.001<br>looks.talk.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.offline | talk / offline | looks.talk.offline.primary.001<br>looks.talk.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.permission-needed | talk / permission-needed | looks.talk.permission-needed.primary.001<br>looks.talk.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.permission-denied | talk / permission-denied | looks.talk.permission-denied.primary.001<br>looks.talk.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.talk.permission-restricted | talk / permission-restricted | looks.talk.permission-restricted.primary.001<br>looks.talk.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.default | background / default | looks.background.default.primary.001<br>looks.background.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.loading | background / loading | looks.background.loading.primary.001<br>looks.background.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.error | background / error | looks.background.error.primary.001<br>looks.background.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.offline | background / offline | looks.background.offline.primary.001<br>looks.background.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.permission-needed | background / permission-needed | looks.background.permission-needed.primary.001<br>looks.background.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.permission-denied | background / permission-denied | looks.background.permission-denied.primary.001<br>looks.background.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.background.permission-restricted | background / permission-restricted | looks.background.permission-restricted.primary.001<br>looks.background.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.call.default | call / default | looks.call.default.primary.001<br>looks.call.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.call.error | call / error | looks.call.error.primary.001<br>looks.call.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.call.offline | call / offline | looks.call.offline.primary.001<br>looks.call.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.call.permission-needed | call / permission-needed | looks.call.permission-needed.primary.001<br>looks.call.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.call.permission-denied | call / permission-denied | looks.call.permission-denied.primary.001<br>looks.call.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.call.permission-restricted | call / permission-restricted | looks.call.permission-restricted.primary.001<br>looks.call.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.default | swap / default | looks.swap.default.primary.001<br>looks.swap.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.loading | swap / loading | looks.swap.loading.primary.001<br>looks.swap.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.error | swap / error | looks.swap.error.primary.001<br>looks.swap.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.offline | swap / offline | looks.swap.offline.primary.001<br>looks.swap.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.permission-needed | swap / permission-needed | looks.swap.permission-needed.primary.001<br>looks.swap.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.permission-denied | swap / permission-denied | looks.swap.permission-denied.primary.001<br>looks.swap.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.swap.permission-restricted | swap / permission-restricted | looks.swap.permission-restricted.primary.001<br>looks.swap.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.default | checkin / default | looks.checkin.default.primary.001<br>looks.checkin.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.error | checkin / error | looks.checkin.error.primary.001<br>looks.checkin.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.denied | checkin / denied | looks.checkin.denied.primary.001<br>looks.checkin.denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.loading | checkin / loading | looks.checkin.loading.primary.001<br>looks.checkin.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.offline | checkin / offline | looks.checkin.offline.primary.001<br>looks.checkin.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.permission-needed | checkin / permission-needed | looks.checkin.permission-needed.primary.001<br>looks.checkin.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.checkin.permission-restricted | checkin / permission-restricted | looks.checkin.permission-restricted.primary.001<br>looks.checkin.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.default | netqr / default | looks.netqr.default.primary.001<br>looks.netqr.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.error | netqr / error | looks.netqr.error.primary.001<br>looks.netqr.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.loading | netqr / loading | looks.netqr.loading.primary.001<br>looks.netqr.loading.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.offline | netqr / offline | looks.netqr.offline.primary.001<br>looks.netqr.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.permission-needed | netqr / permission-needed | looks.netqr.permission-needed.primary.001<br>looks.netqr.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.permission-denied | netqr / permission-denied | looks.netqr.permission-denied.primary.001<br>looks.netqr.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.netqr.permission-restricted | netqr / permission-restricted | looks.netqr.permission-restricted.primary.001<br>looks.netqr.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.shareext.default | shareext / default | looks.shareext.default.primary.001<br>looks.shareext.default.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.shareext.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.shareext.success | shareext / success | looks.shareext.success.primary.001<br>looks.shareext.success.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.shareext.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.shareext.error | shareext / error | looks.shareext.error.primary.001<br>looks.shareext.error.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.shareext.offline | shareext / offline | looks.shareext.offline.primary.001<br>looks.shareext.offline.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>stale-timestamp | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | no media |
| fixture.looks.shareext.permission-needed | shareext / permission-needed | looks.shareext.permission-needed.primary.001<br>looks.shareext.permission-needed.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.shareext.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.shareext.permission-denied | shareext / permission-denied | looks.shareext.permission-denied.primary.001<br>looks.shareext.permission-denied.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.shareext.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |
| fixture.looks.shareext.permission-restricted | shareext / permission-restricted | looks.shareext.permission-restricted.primary.001<br>looks.shareext.permission-restricted.edge.099 | long-russian-copy<br>accessibility-xxxl<br>zero-one-many-values<br>mixed-recency | legacy-migration-fixture: concepts/looks/concept.json + native/apps/looks | looks.shareext.content.001: native/apps/looks/Assets.xcassets existing app-owned catalog; legacy project-owned/approved asset; redistribution rights require separate evidence intake |

## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| camera | Снять образ | On «Снять» from create | create → camera | Можно выбрать готовый снимок | contextual-gesture |
| photos | Публикация из медиатеки | On «Из Фото» from create | create → create | Можно снять новый кадр камерой | contextual-gesture |
| mic | Голосовые сообщения | On «Записать голосовое» from chat | chat → chat | Остаются текст и фото | contextual-gesture |
| location | События стиля рядом | On «Кто гуляет рядом» from home | home → nearby | Район выбирается вручную | contextual-gesture |
| push | Уведомления о подписках и ответах | On «Подписки» в «Настройках» from settings | settings → settings | Обновления помечаются точкой внутри приложения | contextual-gesture |
| commnotif | Чаты с аватарами в уведомлениях | On «Сообщения с аватаром» from chat | chat → chat | Обычное уведомление без аватара | build-artifact |
| remotenotif | Актуальная серия клипов | On «Тихое обновление клипов» from settings | settings → settings | Состав обновляется при открытии | app-lifecycle |
| fetch | Свежая лента к запуску | On «Обновлять ленту в фоне» from settings | settings → settings | Лента обновится после открытия | app-lifecycle |
| appgroups | Виджет сохранённого образа | On «Виджет на экране „Домой“» from settings | settings → settings | Сохранённое остаётся внутри приложения | build-artifact |
| keychain | Один вход для приложения и виджета | On «Открыть „Образы“» с виджета from widget | widget → profile | Виджет открывает приложение для входа | build-artifact |
| autofill | Вход на сайт марки сохранённой связкой | On «Вход на сайте» from settings | settings → fill | Вход вручную почтой и паролем | contextual-gesture |
| wifiinfo | Отметка «я на свопе» подтверждается сетью площадки, а не словом участника | On «Отметиться на свопе» from checkin | checkin → checkin | Остаётся отметка вручную — её подтверждает организатор | build-artifact |
| contacts | Кто из ваших контактов уже в «Образах» | On «Найти среди контактов» from profile | profile → mates | Остаётся поиск по имени и ссылка-приглашение | contextual-gesture |
| tracking | Реклама марок и локальных магазинов вместо платной подписки | On «Продолжить» from ads | ads → profile | Реклама остаётся, но перестаёт быть персональной | contextual-gesture |
| faceid | Замок на «Сохранённом»: приватные подборки и черновики не видны через плечо | On «Замок Face ID» from settings | settings → lock | Остаётся код-пароль устройства | contextual-gesture |
| speech | Субтитры к снятому клипу без ручного набора | On «Субтитры к клипу» from create | create → create | Субтитры набираются вручную | contextual-gesture |
| audio | Разбор гардероба голосом в фоне: Now Playing и ±15 секунд с локскрина | On «Слушать» from talk | talk → background | Без entitlement звук обрывается — не ship | contextual-gesture |
| voip | Созвон по свопу без обмена номерами: телефон остаётся у владельца | On «Позвонить» from chat | chat → call | Остаётся переписка в чате | contextual-gesture |
| calendar | Своп и встреча сообщества в системном календаре, с правкой при переносе и удалением при отмене | On «Добавить в Календарь» from swap | swap → swap | Дата остаётся в карточке свопа и в напоминании приложения | contextual-gesture |
| shareext | Поделиться в «Образы» из Safari, «Фото» и мессенджеров — ссылка или кадр падает в черновик образа | On «Поделиться» в другом приложении from settings | settings → shareext | Остаётся сохранение внутри приложения | contextual-gesture |
| hotspot | Подключение к гостевой сети площадки по QR — без него отметка на свопе не проходит | On «Подключиться» from netqr | netqr → netqr | Сеть выбирается вручную в Настройках | build-artifact |

**Entitlements:** `aps-environment`, `com.apple.developer.usernotifications.communication`, `com.apple.security.application-groups`, `keychain-access-groups`, `com.apple.developer.networking.wifi-info`, `com.apple.developer.networking.HotspotConfiguration`
**Extension targets:** `notification-service`, `credential-provider`, `share-extension`, `widget`

## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product adapter | Own Образы domain state and screens | native/apps/looks |
| Native runtime | Own iOS lifecycle and permission adapters | native/Runtime |
| Reference profile | Own evidence-backed mimicry recipes | native/ReferenceProfiles/vk-ios |

**Boundaries**
- Product state does not leak into shared visual primitives
- Reference recipes do not invent product behavior
- System capabilities remain behind runtime adapters

## Data, state, persistence, and integrations

**Entities**

- Look
- Wardrobe
- Remix

**State**

- Session state
- Product-owned persisted mutations
- Permission and denied state
- Capture state through the real product surface

**Persistence**

- UserDefaults for explicit local product state
- Keychain/App Group only where capability plans declare them

**Integrations**

- Лента и профили: Статический контент-пак и локальные реакции в прототипе
- Распознавание вещей: Vision на устройстве с ручным подтверждением
- Уведомления: APNs через SDK провайдера

## Loading, empty, error, denied, and offline states

| State | Required behavior |
|---|---|
| loading | Keep product context visible and disable duplicate submission while work is in progress. |
| empty | Explain what is absent and expose a product action that can create or discover value. |
| error | Name the failed operation, preserve user input, and offer retry or a useful fallback. |
| denied | Keep the product task reachable through the permission's declared denied fallback. |
| offline | Show persisted content or an explicit retry path without claiming fresh remote data. |

## Privacy, security, and trust

**Data inventory**

- User Content · Location: Публикации, клипы-примерки и события рядом
- Contacts: Совпадения адресной книги: номера сверяются хешами, несовпавшие стираются
- Identifiers: IDFA только после согласия в ATT — обмен объяснён на экране «Реклама вместо подписки»

**Privacy principles**

- Request access only at the declared gesture
- Keep the declared denied fallback useful
- Do not infer evidence not present in the source contract

**Retention.** Follow the declared local/provider ownership; migration introduces no new retention claim

**Trust and safety risks**

- User content or social interaction can create abuse, impersonation, or unsafe disclosure

**Controls**

- Scoped visibility, reporting, deterministic denied fallbacks, and explicit review notes

**Reporting.** Product-owned report and support paths must remain reachable from affected content

## Accessibility and localization

**Accessibility**

- VoiceOver labels and reading order
- 44pt hit targets
- Accessibility XXXL without clipping
- Reduced Motion and sufficient contrast

**Locales:** ru

**Localization requirements**

- No concatenated user-facing strings
- Stress-test long copy and plural forms
- Keep permission copy aligned with App Store notes

## Analytics event plan and success metrics

**Events**

- product_opened
- activation_completed
- core_loop_completed
- permission_requested
- permission_denied_fallback_used

**Success metrics**

- Activation completion rate
- Second core-loop completion
- Permission fallback task completion
- Critical-flow error recovery

**Core-loop hypothesis.** The declared loop returns the audience for Новые образы знакомых авторов

**Validation plan.** Replay the vertical slice and collect real-user evidence before claiming retention

## Testing, evidence, and capture plan

**Levels**

- Product contract compile
- Interaction replay
- XCUI smoke
- Capture and independent product/visual review

**Evidence**

- Preserve provenance for every new product claim
- Do not convert simulator results into user-demand evidence

**Capture identifiers**

- phone--default
- phone--loading
- phone--error
- code--default
- code--loading
- code--error
- codefail--default
- codefail--loading
- codefail--error
- home--default
- home--empty
- search--default
- search--query
- search--empty
- search--loading
- notifications--unread
- notifications--read
- notifications--empty
- post--default
- nearby--default
- nearby--empty
- clip--default
- create--default
- create--error
- create--success
- camera--default
- camera--denied
- media--default
- chats--default
- chats--empty
- chat--default
- voice--default
- voice--denied
- profile--default
- services--default
- services--loading
- settings--default
- widget--default
- fill--default
- mates--default
- mates--empty
- mates--denied
- wardrobe--populated
- wardrobe--empty
- wardrobe--loading
- event--available
- event--joined
- event--cancelled
- ads--default
- lock--default
- lock--denied
- subtitles--default
- subtitles--error
- subtitles--success
- talk--default
- talk--loading
- talk--error
- background--default
- background--loading
- background--error
- call--default
- swap--default
- checkin--default
- checkin--error
- checkin--denied
- netqr--default
- netqr--error
- shareext--default
- shareext--success

**Evidence provenance**

- legacy-contract · user-input · approved · concepts/looks/concept.json
- reference-profile · reference-profile · approved · native/ReferenceProfiles/vk-ios/profile.json

## Setup, build, and run

**Prerequisites**

- Node 22
- Xcode with an iOS 26 simulator

**Build**

- `npm run build -- looks`

**Run and verify**

- `npm run smoke -- looks`
- `npm run capture -- looks`

## Generated and owned file map

| Generated — do not hand-edit | Product-owned source |
|---|---|
| native/build/looks<br>concepts/looks/docs/developer-guide.md | concepts/looks/concept.json<br>native/apps/looks<br>native/apps/looks/capture.json |

## Limitations, risks, and acceptance criteria

**Limitations**

- Legacy migration has no original multi-candidate selection receipt
- Retention and market demand still require real-user evidence
- Physical-device and VoiceOver gates remain manual

**Risks**

- risk: Legacy product predates comparative selection; mitigation: Keep migration status explicit; killSignal: A new concept attempts to use legacy status
- risk: Declared return reasons are not retention proof; mitigation: Collect real behavior evidence; killSignal: Retention is claimed from simulator evidence

**Assumptions still requiring evidence**

- claim: The existing audience recognises the primary value; risk: high; validation: Real-user activation study; status: needs-validation
- claim: The content supply replenishes after seeded content; risk: high; validation: Supply-side pilot; status: needs-validation

**Acceptance criteria**

- Product contract and native manifest compile
- Every declared action has an outcome
- Every permission has timing and denied fallback
- All declared screenshot states have real capture ownership
- Independent product/visual review is recorded

## App Store notes

- Permission claims must match reachable behavior and privacy labels
- Do not claim server, evidence, or reference fidelity that is not present
- Социальная сеть реального личного стиля.
