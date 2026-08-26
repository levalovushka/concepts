# Data, actions and persistence · 2

The local world model is the source of truth for reducers and fixture storage.

| Action | Actor | Entity | Intent | Outcome | Persistence |
|---|---|---|---|---|---|
| open_settings | — | preference | — | Открыты настройки продукта и приватности. | local-model |
| open_accesses | — | access_state | — | Показаны состояния системных доступов и связанные функции. | local-model |
| capture_deed_photo | — | attachment | — | Снятое изображение сохранено локально и прикреплено к черновику или доказательству. | local-model |
| choose_deed_photo | — | attachment | — | Выбранное изображение импортировано в локальное хранилище и прикреплено к делу. | local-model |
| record_voice_update | — | update | — | Локальный аудиофайл прикреплён к обновлению с длительностью. | local-model |
| choose_deed_place | — | place | — | К делу прикреплено выбранное место с координатами либо ручным названием. | local-model |
| enable_result_alerts | — | notification_preference | — | Включены уведомления для явно отслеживаемых дел. | local-model |
| enable_message_alerts | — | notification_preference | — | Включены уведомления категории сообщений с данными отправителя и диалога. | local-model |
| apply_silent_snapshot | — | feed_snapshot | — | Версия локального снимка ленты обновлена без показа уведомления. | local-model |
| refresh_feed_on_fetch | — | feed_snapshot | — | Background fetch сохраняет новые fixture-обновления для следующего открытия. | local-model |
| schedule_digest_task | — | digest | — | Задача com.svoi.digest.refresh зарегистрирована и сохраняет число изменившихся отслеживаемых дел. | local-model |
| publish_quick_update_widget | — | widget_snapshot | — | Обновление записано в App Group и отражено в виджете и истории дела. | local-model |
| share_session_with_widget | — | session | — | Идентификатор активной сессии сохранён в общей связке ключей и доступен приложению и виджету. | local-model |
| manage_demo_credential | — | credential | — | Демонстрационная учётная запись сохранена или удалена из Credential Provider. | local-model |
| verify_site_network | — | site_check | — | SSID сохранён как подтверждение присутствия на площадке дела без хранения сетевого пароля. | local-model |
| import_helpers | — | circle | — | Выбранные совпадения контактов добавлены в круг своих без загрузки адресной книги наружу. | local-model |
| enable_promotion_measurement | — | measurement_preference | — | После системного выбора сохранён режим измерения promotedOnly; основной продукт от него не зависит. | local-model |
| unlock_private_deeds | — | private_vault | — | Зашифрованный список приватных дел разблокирован до ухода приложения в фон. | local-model |
| transcribe_voice_update | — | update | — | Распознанный русский текст сохранён как transcript аудиообновления. | local-model |
| play_voice_update | — | playback | — | Аудиообновление воспроизводится в фоне; Now Playing показывает автора, дело и прогресс. | local-model |
| start_helper_call | — | call | — | Создан локальный CallKit-вызов помощнику; завершение сохраняет длительность в диалоге. | local-model |
| add_deadline_to_calendar | — | calendar_link | — | Событие с названием дела и deep link создано в выбранном календаре; eventIdentifier сохранён. | local-model |
| open_deed_link | — | deed | — | Приложение открывает существующее дело либо понятный экран отсутствующей записи. | local-model |
| join_deed_network | — | site_connection | — | Участник получает connected=true и может затем подтвердить площадку. | local-model |
