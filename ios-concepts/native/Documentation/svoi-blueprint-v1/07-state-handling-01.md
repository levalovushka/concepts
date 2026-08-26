# Canonical state handling · 1

Loading, populated, empty, error and offline are explicit per screen. Permission denial belongs to the owning capability journey.

| Screen | State | Content | Actions | Recovery |
|---|---|---|---|---|
| login | loading | Явная loading-вариация | request_email_code, verify_email_code | — |
| login | populated/default | Канонические fixture-данные | request_email_code, verify_email_code | — |
| login | empty | Явная empty-вариация | request_email_code, verify_email_code | — |
| login | error | Явная error-вариация | request_email_code, verify_email_code | Повторить без потери локального состояния |
| login | offline | Явная offline-вариация | request_email_code, verify_email_code | Повторить без потери локального состояния |
| feed | loading | Явная loading-вариация | open_feed, open_deed, support_deed, offer_help, follow_result, share_deed, save_deed, open_notifications, open_deed_link, open_comments | — |
| feed | populated/default | Канонические fixture-данные | open_feed, open_deed, support_deed, offer_help, follow_result, share_deed, save_deed, open_notifications, open_deed_link, open_comments | — |
| feed | empty | Явная empty-вариация | open_feed, open_deed, support_deed, offer_help, follow_result, share_deed, save_deed, open_notifications, open_deed_link, open_comments | — |
| feed | error | Явная error-вариация | open_feed, open_deed, support_deed, offer_help, follow_result, share_deed, save_deed, open_notifications, open_deed_link, open_comments | Повторить без потери локального состояния |
| feed | offline | Явная offline-вариация | open_feed, open_deed, support_deed, offer_help, follow_result, share_deed, save_deed, open_notifications, open_deed_link, open_comments | Повторить без потери локального состояния |
| post_detail | loading | Явная loading-вариация | support_deed, offer_help, follow_result, share_deed, save_deed, add_update, add_contribution, complete_deed, thank_helpers, take_baton, play_voice_update, transcribe_voice_update, verify_site_network, add_deadline_to_calendar, join_deed_network, respond_to_post | — |
| post_detail | populated/default | Канонические fixture-данные | support_deed, offer_help, follow_result, share_deed, save_deed, add_update, add_contribution, complete_deed, thank_helpers, take_baton, play_voice_update, transcribe_voice_update, verify_site_network, add_deadline_to_calendar, join_deed_network, respond_to_post | — |
| post_detail | empty | Явная empty-вариация | support_deed, offer_help, follow_result, share_deed, save_deed, add_update, add_contribution, complete_deed, thank_helpers, take_baton, play_voice_update, transcribe_voice_update, verify_site_network, add_deadline_to_calendar, join_deed_network, respond_to_post | — |
| post_detail | error | Явная error-вариация | support_deed, offer_help, follow_result, share_deed, save_deed, add_update, add_contribution, complete_deed, thank_helpers, take_baton, play_voice_update, transcribe_voice_update, verify_site_network, add_deadline_to_calendar, join_deed_network, respond_to_post | Повторить без потери локального состояния |
| post_detail | offline | Явная offline-вариация | support_deed, offer_help, follow_result, share_deed, save_deed, add_update, add_contribution, complete_deed, thank_helpers, take_baton, play_voice_update, transcribe_voice_update, verify_site_network, add_deadline_to_calendar, join_deed_network, respond_to_post | Повторить без потери локального состояния |
| comments | loading | Явная loading-вариация |  | — |
| comments | populated/default | Канонические fixture-данные |  | — |
| comments | empty | Явная empty-вариация |  | — |
| comments | error | Явная error-вариация |  | Повторить без потери локального состояния |
| comments | offline | Явная offline-вариация |  | Повторить без потери локального состояния |
| search | loading | Явная loading-вариация | search_world, open_search_result | — |
| search | populated/default | Канонические fixture-данные | search_world, open_search_result | — |
| search | empty | Явная empty-вариация | search_world, open_search_result | — |
| search | error | Явная error-вариация | search_world, open_search_result | Повторить без потери локального состояния |
| search | offline | Явная offline-вариация | search_world, open_search_result | Повторить без потери локального состояния |
| create | loading | Явная loading-вариация | create_deed, edit_deed_text, capture_deed_photo, choose_deed_photo, record_voice_update, choose_deed_place, publish_deed | — |
| create | populated/default | Канонические fixture-данные | create_deed, edit_deed_text, capture_deed_photo, choose_deed_photo, record_voice_update, choose_deed_place, publish_deed | — |
| create | empty | Явная empty-вариация | create_deed, edit_deed_text, capture_deed_photo, choose_deed_photo, record_voice_update, choose_deed_place, publish_deed | — |
