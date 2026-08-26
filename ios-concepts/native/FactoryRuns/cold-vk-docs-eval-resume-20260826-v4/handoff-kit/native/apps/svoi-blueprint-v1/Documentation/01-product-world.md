# Продуктовая модель

## Аудитория

Друзья, локальные сообщества и небольшие команды.

## Потребность

Доводить небольшие намерения до видимого результата благодаря поддержке и конкретному участию знакомых, не превращая общение в контроль продуктивности.

## Сущности

```json
[
  {
    "id": "user",
    "name": "Пользователь"
  },
  {
    "id": "session",
    "name": "Сессия"
  },
  {
    "id": "credential",
    "name": "Способ входа"
  },
  {
    "id": "circle",
    "name": "Круг своих"
  },
  {
    "id": "community",
    "name": "Сообщество"
  },
  {
    "id": "deed",
    "name": "Дело"
  },
  {
    "id": "update",
    "name": "Обновление дела"
  },
  {
    "id": "contribution",
    "name": "Вклад помощника или предложение помощи как частный вид вклада в дело; поле kind различает offer и delivered."
  },
  {
    "id": "comment",
    "name": "Comment"
  },
  {
    "id": "search_result",
    "name": "Search result"
  },
  {
    "id": "notification",
    "name": "Notification"
  },
  {
    "id": "conversation",
    "name": "Conversation"
  },
  {
    "id": "message",
    "name": "Message"
  },
  {
    "id": "preference",
    "name": "Preference"
  },
  {
    "id": "access_state",
    "name": "Access state"
  },
  {
    "id": "attachment",
    "name": "Attachment"
  },
  {
    "id": "place",
    "name": "Place"
  },
  {
    "id": "notification_preference",
    "name": "Notification preference"
  },
  {
    "id": "feed_snapshot",
    "name": "Feed snapshot"
  },
  {
    "id": "digest",
    "name": "Digest"
  },
  {
    "id": "widget_snapshot",
    "name": "Widget snapshot"
  },
  {
    "id": "site_check",
    "name": "Site check"
  },
  {
    "id": "measurement_preference",
    "name": "Measurement preference"
  },
  {
    "id": "private_vault",
    "name": "Private vault"
  },
  {
    "id": "playback",
    "name": "Playback"
  },
  {
    "id": "call",
    "name": "Call"
  },
  {
    "id": "calendar_link",
    "name": "Calendar link"
  },
  {
    "id": "site_connection",
    "name": "Site connection"
  }
]
```

## Действия

```json
[
  {
    "id": "request_email_code",
    "entityId": "session",
    "outcome": "Создан локальный код входа для введённой почты."
  },
  {
    "id": "verify_email_code",
    "entityId": "session",
    "outcome": "Сессия становится активной, открывается лента."
  },
  {
    "id": "open_feed",
    "entityId": "deed",
    "outcome": "Показан сохранённый снимок авторской ленты."
  },
  {
    "id": "open_deed",
    "entityId": "deed",
    "outcome": "Открыта история выбранного дела с обновлениями и вкладами."
  },
  {
    "id": "create_deed",
    "entityId": "deed",
    "outcome": "Создан черновик дела."
  },
  {
    "id": "edit_deed_text",
    "entityId": "deed",
    "outcome": "Сохранены результат и описание дела."
  },
  {
    "id": "publish_deed",
    "entityId": "deed",
    "outcome": "Дело опубликовано в ленте со статусом active."
  },
  {
    "id": "support_deed",
    "entityId": "deed",
    "outcome": "Текущий пользователь добавлен в supporters; счётчик поддержки увеличен один раз."
  },
  {
    "id": "offer_help",
    "entityId": "contribution",
    "outcome": "Создан вклад kind=offer с конкретным предложением помощи."
  },
  {
    "id": "follow_result",
    "entityId": "deed",
    "outcome": "Текущий пользователь добавлен в followers; будущие изменения создают уведомления."
  },
  {
    "id": "open_comments",
    "entityId": "comment",
    "outcome": "Открыта ветка комментариев выбранного дела."
  },
  {
    "id": "respond_to_post",
    "entityId": "comment",
    "outcome": "Комментарий добавлен к делу и виден в ветке."
  },
  {
    "id": "share_deed",
    "entityId": "deed",
    "outcome": "Создана локальная публикация-продолжение со ссылкой на исходное дело."
  },
  {
    "id": "save_deed",
    "entityId": "deed",
    "outcome": "Дело добавлено в сохранённые текущего пользователя."
  },
  {
    "id": "add_update",
    "entityId": "update",
    "outcome": "К делу добавлено текстовое обновление; updatedAt изменён."
  },
  {
    "id": "add_contribution",
    "entityId": "contribution",
    "outcome": "К делу добавлен выполненный вклад участника kind=delivered."
  },
  {
    "id": "complete_deed",
    "entityId": "deed",
    "outcome": "После выбора доказательства дело получает status=completed и completedAt."
  },
  {
    "id": "thank_helpers",
    "entityId": "deed",
    "outcome": "Выбранные помощники записаны в thankedUserIds и получают локальные уведомления."
  },
  {
    "id": "take_baton",
    "entityId": "deed",
    "outcome": "Создан новый черновик с parentDeedId исходного дела."
  },
  {
    "id": "search_world",
    "entityId": "search_result",
    "outcome": "Сохранён запрос и показаны совпадения среди дел, людей и сообществ."
  },
  {
    "id": "open_search_result",
    "entityId": "search_result",
    "outcome": "Открыта сущность выбранного результата."
  },
  {
    "id": "open_notifications",
    "entityId": "notification",
    "outcome": "Показан список уведомлений; открытые записи отмечены прочитанными."
  },
  {
    "id": "open_notification",
    "entityId": "notification",
    "outcome": "Открыта связанная сущность и уведомление отмечено прочитанным."
  },
  {
    "id": "open_messages",
    "entityId": "conversation",
    "outcome": "Показаны локальные диалоги."
  },
  {
    "id": "open_conversation",
    "entityId": "conversation",
    "outcome": "Открыт выбранный диалог."
  },
  {
    "id": "send_message",
    "entityId": "message",
    "outcome": "Сообщение добавлено в диалог со статусом delivered."
  },
  {
    "id": "open_profile",
    "entityId": "user",
    "outcome": "Показан профиль с делами, вкладами и сохранёнными публикациями."
  },
  {
    "id": "open_saved",
    "entityId": "deed",
    "outcome": "Показаны сохранённые дела пользователя."
  },
  {
    "id": "open_settings",
    "entityId": "preference",
    "outcome": "Открыты настройки продукта и приватности."
  },
  {
    "id": "open_accesses",
    "entityId": "access_state",
    "outcome": "Показаны состояния системных доступов и связанные функции."
  },
  {
    "id": "capture_deed_photo",
    "entityId": "attachment",
    "outcome": "Снятое изображение сохранено локально и прикреплено к черновику или доказательству."
  },
  {
    "id": "choose_deed_photo",
    "entityId": "attachment",
    "outcome": "Выбранное изображение импортировано в локальное хранилище и прикреплено к делу."
  },
  {
    "id": "record_voice_update",
    "entityId": "update",
    "outcome": "Локальный аудиофайл прикреплён к обновлению с длительностью."
  },
  {
    "id": "choose_deed_place",
    "entityId": "place",
    "outcome": "К делу прикреплено выбранное место с координатами либо ручным названием."
  },
  {
    "id": "enable_result_alerts",
    "entityId": "notification_preference",
    "outcome": "Включены уведомления для явно отслеживаемых дел."
  },
  {
    "id": "enable_message_alerts",
    "entityId": "notification_preference",
    "outcome": "Включены уведомления категории сообщений с данными отправителя и диалога."
  },
  {
    "id": "apply_silent_snapshot",
    "entityId": "feed_snapshot",
    "outcome": "Версия локального снимка ленты обновлена без показа уведомления."
  },
  {
    "id": "refresh_feed_on_fetch",
    "entityId": "feed_snapshot",
    "outcome": "Background fetch сохраняет новые fixture-обновления для следующего открытия."
  },
  {
    "id": "schedule_digest_task",
    "entityId": "digest",
    "outcome": "Задача com.svoi.digest.refresh зарегистрирована и сохраняет число изменившихся отслеживаемых дел."
  },
  {
    "id": "publish_quick_update_widget",
    "entityId": "widget_snapshot",
    "outcome": "Обновление записано в App Group и отражено в виджете и истории дела."
  },
  {
    "id": "share_session_with_widget",
    "entityId": "session",
    "outcome": "Идентификатор активной сессии сохранён в общей связке ключей и доступен приложению и виджету."
  },
  {
    "id": "manage_demo_credential",
    "entityId": "credential",
    "outcome": "Демонстрационная учётная запись сохранена или удалена из Credential Provider."
  },
  {
    "id": "verify_site_network",
    "entityId": "site_check",
    "outcome": "SSID сохранён как подтверждение присутствия на площадке дела без хранения сетевого пароля."
  },
  {
    "id": "import_helpers",
    "entityId": "circle",
    "outcome": "Выбранные совпадения контактов добавлены в круг своих без загрузки адресной книги наружу."
  },
  {
    "id": "enable_promotion_measurement",
    "entityId": "measurement_preference",
    "outcome": "После системного выбора сохранён режим измерения promotedOnly; основной продукт от него не зависит."
  },
  {
    "id": "unlock_private_deeds",
    "entityId": "private_vault",
    "outcome": "Зашифрованный список приватных дел разблокирован до ухода приложения в фон."
  },
  {
    "id": "transcribe_voice_update",
    "entityId": "update",
    "outcome": "Распознанный русский текст сохранён как transcript аудиообновления."
  },
  {
    "id": "play_voice_update",
    "entityId": "playback",
    "outcome": "Аудиообновление воспроизводится в фоне; Now Playing показывает автора, дело и прогресс."
  },
  {
    "id": "start_helper_call",
    "entityId": "call",
    "outcome": "Создан локальный CallKit-вызов помощнику; завершение сохраняет длительность в диалоге."
  },
  {
    "id": "add_deadline_to_calendar",
    "entityId": "calendar_link",
    "outcome": "Событие с названием дела и deep link создано в выбранном календаре; eventIdentifier сохранён."
  },
  {
    "id": "open_deed_link",
    "entityId": "deed",
    "outcome": "Приложение открывает существующее дело либо понятный экран отсутствующей записи."
  },
  {
    "id": "join_deed_network",
    "entityId": "site_connection",
    "outcome": "Участник получает connected=true и может затем подтвердить площадку."
  }
]
```

## Основной цикл

- create_deed: Создан черновик дела.
- edit_deed_text: Сохранены результат и описание дела.
- publish_deed: Дело опубликовано в ленте со статусом active.
- support_deed: Текущий пользователь добавлен в supporters; счётчик поддержки увеличен один раз.

Причина возвращения: Обновления и предложения помощи возвращают подписчиков к развивающейся истории; доказательство завершения и эстафета создают следующий авторский пост.
