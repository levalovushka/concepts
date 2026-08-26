# Canonical state handling · 2

Loading, populated, empty, error and offline are explicit per screen. Permission denial belongs to the owning capability journey.

| Screen | State | Content | Actions | Recovery |
|---|---|---|---|---|
| create | error | Явная error-вариация | create_deed, edit_deed_text, capture_deed_photo, choose_deed_photo, record_voice_update, choose_deed_place, publish_deed | Повторить без потери локального состояния |
| create | offline | Явная offline-вариация | create_deed, edit_deed_text, capture_deed_photo, choose_deed_photo, record_voice_update, choose_deed_place, publish_deed | Повторить без потери локального состояния |
| complete | loading | Явная loading-вариация | capture_deed_photo, choose_deed_photo, complete_deed, thank_helpers | — |
| complete | populated/default | Канонические fixture-данные | capture_deed_photo, choose_deed_photo, complete_deed, thank_helpers | — |
| complete | empty | Явная empty-вариация | capture_deed_photo, choose_deed_photo, complete_deed, thank_helpers | — |
| complete | error | Явная error-вариация | capture_deed_photo, choose_deed_photo, complete_deed, thank_helpers | Повторить без потери локального состояния |
| complete | offline | Явная offline-вариация | capture_deed_photo, choose_deed_photo, complete_deed, thank_helpers | Повторить без потери локального состояния |
| messages | loading | Явная loading-вариация | open_messages, open_conversation | — |
| messages | populated/default | Канонические fixture-данные | open_messages, open_conversation | — |
| messages | empty | Явная empty-вариация | open_messages, open_conversation | — |
| messages | error | Явная error-вариация | open_messages, open_conversation | Повторить без потери локального состояния |
| messages | offline | Явная offline-вариация | open_messages, open_conversation | Повторить без потери локального состояния |
| conversation | loading | Явная loading-вариация | send_message, start_helper_call | — |
| conversation | populated/default | Канонические fixture-данные | send_message, start_helper_call | — |
| conversation | empty | Явная empty-вариация | send_message, start_helper_call | — |
| conversation | error | Явная error-вариация | send_message, start_helper_call | Повторить без потери локального состояния |
| conversation | offline | Явная offline-вариация | send_message, start_helper_call | Повторить без потери локального состояния |
| profile | loading | Явная loading-вариация | open_profile, open_saved, open_settings | — |
| profile | populated/default | Канонические fixture-данные | open_profile, open_saved, open_settings | — |
| profile | empty | Явная empty-вариация | open_profile, open_saved, open_settings | — |
| profile | error | Явная error-вариация | open_profile, open_saved, open_settings | Повторить без потери локального состояния |
| profile | offline | Явная offline-вариация | open_profile, open_saved, open_settings | Повторить без потери локального состояния |
| saved | loading | Явная loading-вариация | open_deed | — |
| saved | populated/default | Канонические fixture-данные | open_deed | — |
| saved | empty | Явная empty-вариация | open_deed | — |
| saved | error | Явная error-вариация | open_deed | Повторить без потери локального состояния |
| saved | offline | Явная offline-вариация | open_deed | Повторить без потери локального состояния |
| notifications | loading | Явная loading-вариация | open_notification, enable_result_alerts | — |
