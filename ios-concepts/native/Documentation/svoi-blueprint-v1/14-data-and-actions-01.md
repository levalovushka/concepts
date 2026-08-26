# Data, actions and persistence · 1

The local world model is the source of truth for reducers and fixture storage.

| Action | Actor | Entity | Intent | Outcome | Persistence |
|---|---|---|---|---|---|
| request_email_code | — | session | — | Создан локальный код входа для введённой почты. | local-model |
| verify_email_code | — | session | — | Сессия становится активной, открывается лента. | local-model |
| open_feed | — | deed | — | Показан сохранённый снимок авторской ленты. | local-model |
| open_deed | — | deed | — | Открыта история выбранного дела с обновлениями и вкладами. | local-model |
| create_deed | — | deed | — | Создан черновик дела. | local-model |
| edit_deed_text | — | deed | — | Сохранены результат и описание дела. | local-model |
| publish_deed | — | deed | — | Дело опубликовано в ленте со статусом active. | local-model |
| support_deed | — | deed | — | Текущий пользователь добавлен в supporters; счётчик поддержки увеличен один раз. | local-model |
| offer_help | — | contribution | — | Создан вклад kind=offer с конкретным предложением помощи. | local-model |
| follow_result | — | deed | — | Текущий пользователь добавлен в followers; будущие изменения создают уведомления. | local-model |
| open_comments | — | comment | — | Открыта ветка комментариев выбранного дела. | local-model |
| respond_to_post | — | comment | — | Комментарий добавлен к делу и виден в ветке. | local-model |
| share_deed | — | deed | — | Создана локальная публикация-продолжение со ссылкой на исходное дело. | local-model |
| save_deed | — | deed | — | Дело добавлено в сохранённые текущего пользователя. | local-model |
| add_update | — | update | — | К делу добавлено текстовое обновление; updatedAt изменён. | local-model |
| add_contribution | — | contribution | — | К делу добавлен выполненный вклад участника kind=delivered. | local-model |
| complete_deed | — | deed | — | После выбора доказательства дело получает status=completed и completedAt. | local-model |
| thank_helpers | — | deed | — | Выбранные помощники записаны в thankedUserIds и получают локальные уведомления. | local-model |
| take_baton | — | deed | — | Создан новый черновик с parentDeedId исходного дела. | local-model |
| search_world | — | search_result | — | Сохранён запрос и показаны совпадения среди дел, людей и сообществ. | local-model |
| open_search_result | — | search_result | — | Открыта сущность выбранного результата. | local-model |
| open_notifications | — | notification | — | Показан список уведомлений; открытые записи отмечены прочитанными. | local-model |
| open_notification | — | notification | — | Открыта связанная сущность и уведомление отмечено прочитанным. | local-model |
| open_messages | — | conversation | — | Показаны локальные диалоги. | local-model |
| open_conversation | — | conversation | — | Открыт выбранный диалог. | local-model |
| send_message | — | message | — | Сообщение добавлено в диалог со статусом delivered. | local-model |
| open_profile | — | user | — | Показан профиль с делами, вкладами и сохранёнными публикациями. | local-model |
| open_saved | — | deed | — | Показаны сохранённые дела пользователя. | local-model |
