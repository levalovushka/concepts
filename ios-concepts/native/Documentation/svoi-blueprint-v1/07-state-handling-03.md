# Canonical state handling · 3

Loading, populated, empty, error and offline are explicit per screen. Permission denial belongs to the owning capability journey.

| Screen | State | Content | Actions | Recovery |
|---|---|---|---|---|
| notifications | populated/default | Канонические fixture-данные | open_notification, enable_result_alerts | — |
| notifications | empty | Явная empty-вариация | open_notification, enable_result_alerts | — |
| notifications | error | Явная error-вариация | open_notification, enable_result_alerts | Повторить без потери локального состояния |
| notifications | offline | Явная offline-вариация | open_notification, enable_result_alerts | Повторить без потери локального состояния |
| settings | loading | Явная loading-вариация | open_accesses, enable_message_alerts, enable_promotion_measurement, manage_demo_credential, unlock_private_deeds, import_helpers, publish_quick_update_widget, share_session_with_widget, apply_silent_snapshot, refresh_feed_on_fetch, schedule_digest_task | — |
| settings | populated/default | Канонические fixture-данные | open_accesses, enable_message_alerts, enable_promotion_measurement, manage_demo_credential, unlock_private_deeds, import_helpers, publish_quick_update_widget, share_session_with_widget, apply_silent_snapshot, refresh_feed_on_fetch, schedule_digest_task | — |
| settings | empty | Явная empty-вариация | open_accesses, enable_message_alerts, enable_promotion_measurement, manage_demo_credential, unlock_private_deeds, import_helpers, publish_quick_update_widget, share_session_with_widget, apply_silent_snapshot, refresh_feed_on_fetch, schedule_digest_task | — |
| settings | error | Явная error-вариация | open_accesses, enable_message_alerts, enable_promotion_measurement, manage_demo_credential, unlock_private_deeds, import_helpers, publish_quick_update_widget, share_session_with_widget, apply_silent_snapshot, refresh_feed_on_fetch, schedule_digest_task | Повторить без потери локального состояния |
| settings | offline | Явная offline-вариация | open_accesses, enable_message_alerts, enable_promotion_measurement, manage_demo_credential, unlock_private_deeds, import_helpers, publish_quick_update_widget, share_session_with_widget, apply_silent_snapshot, refresh_feed_on_fetch, schedule_digest_task | Повторить без потери локального состояния |
| accesses | loading | Явная loading-вариация |  | — |
| accesses | populated/default | Канонические fixture-данные |  | — |
| accesses | empty | Явная empty-вариация |  | — |
| accesses | error | Явная error-вариация |  | Повторить без потери локального состояния |
| accesses | offline | Явная offline-вариация |  | Повторить без потери локального состояния |
| private_deeds | loading | Явная loading-вариация | unlock_private_deeds, open_deed | — |
| private_deeds | populated/default | Канонические fixture-данные | unlock_private_deeds, open_deed | — |
| private_deeds | empty | Явная empty-вариация | unlock_private_deeds, open_deed | — |
| private_deeds | error | Явная error-вариация | unlock_private_deeds, open_deed | Повторить без потери локального состояния |
| private_deeds | offline | Явная offline-вариация | unlock_private_deeds, open_deed | Повторить без потери локального состояния |
