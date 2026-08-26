# Data, actions and persistence · 1

The local world model is the source of truth for reducers and fixture storage. Effect type and target are executable compiler input, while outcome is acceptance copy.

| Action | Actor | Entity | Intent | Effect | Effect target | Outcome | Persistence |
|---|---|---|---|---|---|---|---|
| open_relay | — | relay | — | update | lastOpenedRelay | Человек видит текущий ход, условие и цепочку знакомых участников | local-model |
| accept_turn | — | handoff | — | update | turnStatus | Текущий ход закрепляется за участником и открывает создание продолжения | local-model |
| capture_chapter | — | chapter | — | create | chapters | Снятый результат становится новой видимой главой эстафеты | local-model |
| pass_turn | — | handoff | — | update | nextParticipant | Следующий знакомый получает персональный ход с готовым продолжением | local-model |
| open_reply | — | handoff | — | update | replyStatus | Открывается готовое продолжение и выбор следующего знакомого | local-model |
| support_chapter | — | chapter | — | toggle | supported | Поддержка остаётся на конкретной главе и видна её автору | local-model |
| start_relay | — | relay | — | create | relays | Новая эстафета с первым условием появляется у выбранного знакомого | local-model |
| open_profile | — | person | — | update | profileVisible | Открывается личный профиль участника | local-model |
| open_active_relays | — | relay | — | update | relayFilter | Открывается список цепочек, где ещё идёт ход | local-model |
| open_drafts | — | chapter | — | update | chapterFilter | Открываются незаконченные главы | local-model |
| open_schedule | — | handoff | — | update | scheduleVisible | Открываются принятые ходы и сроки | local-model |
| open_settings | — | person | — | update | profileDestination | Открываются настройки приватности, уведомлений и безопасности | local-model |
| capability_photos | — | chapter | — | system | capability_photos | Выбрать из медиатеки: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_mic | — | chapter | — | system | capability_mic | Записать голос: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_location | — | chapter | — | system | capability_location | Добавить место: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_push | — | relay | — | system | capability_push | Следить за эстафетой: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_commnotif | — | handoff | — | system | capability_commnotif | Включить важные ответы: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_remotenotif | — | relay | — | system | capability_remotenotif | Обновлять цепочки: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_fetch | — | relay | — | system | capability_fetch | Обновлять ленту: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_bgtask | — | relay | — | system | capability_bgtask | Готовить подборку: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_appgroups | — | chapter | — | system | capability_appgroups | Поделиться черновиком: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_keychain | — | person | — | system | capability_keychain | Сохранить защищённую сессию: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_autofill | — | person | — | system | capability_autofill | Добавить быстрый вход: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_wifiinfo | — | relay | — | system | capability_wifiinfo | Проверить общую сеть: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_contacts | — | person | — | system | capability_contacts | Выбрать знакомого: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_tracking | — | person | — | system | capability_tracking | Настроить рекомендации: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_faceid | — | chapter | — | system | capability_faceid | Защитить черновики: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_speech | — | chapter | — | system | capability_speech | Расшифровать голос: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
