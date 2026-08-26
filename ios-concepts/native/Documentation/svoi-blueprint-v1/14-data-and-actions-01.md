# Data, actions and persistence · 1

The local world model is the source of truth for reducers and fixture storage. Effect type and target are executable compiler input, while outcome is acceptance copy.

| Action | Actor | Entity | Intent | Effect | Effect target | Outcome | Persistence |
|---|---|---|---|---|---|---|---|
| request_email_code | — | session | — | system | request_email_code_result | Создан локальный код входа для введённой почты. | local-model |
| verify_email_code | — | session | — | update | verify_email_code_state | Сессия становится активной, открывается лента. | local-model |
| open_feed | — | deed | — | navigate | feed | Показан сохранённый снимок авторской ленты. | local-model |
| open_deed | — | deed | — | navigate | post_detail | Открыта история выбранного дела с обновлениями и вкладами. | local-model |
| create_deed | — | deed | — | create | deeds | Создан черновик дела. | local-model |
| edit_deed_text | — | deed | — | update | edit_deed_text_state | Сохранены результат и описание дела. | local-model |
| publish_deed | — | deed | — | append | deeds | Дело опубликовано в ленте со статусом active. | local-model |
| support_deed | — | deed | — | toggle | isSupported | Текущий пользователь добавлен в supporters; счётчик поддержки увеличен один раз. | local-model |
| offer_help | — | contribution | — | append | contributions | Создан вклад kind=offer с конкретным предложением помощи. | local-model |
| follow_result | — | deed | — | toggle | isFollowing | Текущий пользователь добавлен в followers; будущие изменения создают уведомления. | local-model |
| open_comments | — | comment | — | navigate | comments | Открыта ветка комментариев выбранного дела. | local-model |
| respond_to_post | — | comment | — | append | comments | Комментарий добавлен к делу и виден в ветке. | local-model |
| share_deed | — | deed | — | append | deeds | Создана локальная публикация-продолжение со ссылкой на исходное дело. | local-model |
| save_deed | — | deed | — | toggle | isSaved | Дело добавлено в сохранённые текущего пользователя. | local-model |
| add_update | — | update | — | append | updates | К делу добавлено текстовое обновление; updatedAt изменён. | local-model |
| add_contribution | — | contribution | — | append | contributions | К делу добавлен выполненный вклад участника kind=delivered. | local-model |
| complete_deed | — | deed | — | update | complete_deed_state | После выбора доказательства дело получает status=completed и completedAt. | local-model |
| thank_helpers | — | deed | — | toggle | helpersThanked | Выбранные помощники записаны в thankedUserIds и получают локальные уведомления. | local-model |
| take_baton | — | deed | — | append | deeds | Создан новый черновик с parentDeedId исходного дела. | local-model |
| search_world | — | search_result | — | system | search_world_result | Сохранён запрос и показаны совпадения среди дел, людей и сообществ. | local-model |
| open_search_result | — | search_result | — | navigate | post_detail | Открыта сущность выбранного результата. | local-model |
| open_notifications | — | notification | — | navigate | notifications | Показан список уведомлений; открытые записи отмечены прочитанными. | local-model |
| open_notification | — | notification | — | navigate | post_detail | Открыта связанная сущность и уведомление отмечено прочитанным. | local-model |
| open_messages | — | conversation | — | navigate | messages | Показаны локальные диалоги. | local-model |
| open_conversation | — | conversation | — | navigate | conversation | Открыт выбранный диалог. | local-model |
| send_message | — | message | — | append | messages | Сообщение добавлено в диалог со статусом delivered. | local-model |
| open_profile | — | user | — | navigate | profile | Показан профиль с делами, вкладами и сохранёнными публикациями. | local-model |
| open_saved | — | deed | — | navigate | saved | Показаны сохранённые дела пользователя. | local-model |
