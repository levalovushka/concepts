# Граф экранов и навигации

| Экран | Тип | Родитель | Действия |
|---|---|---|---|
| login | root | — | request_email_code, verify_email_code |
| feed | tab | — | open_feed, open_deed, support_deed, offer_help, follow_result, share_deed, save_deed, open_notifications, open_deed_link, open_comments |
| post_detail | push | feed | support_deed, offer_help, follow_result, share_deed, save_deed, add_update, add_contribution, complete_deed, thank_helpers, take_baton, play_voice_update, transcribe_voice_update, verify_site_network, add_deadline_to_calendar, join_deed_network, respond_to_post |
| comments | sheet | post_detail |  |
| search | tab | — | search_world, open_search_result |
| create | tab | — | create_deed, edit_deed_text, capture_deed_photo, choose_deed_photo, record_voice_update, choose_deed_place, publish_deed |
| complete | sheet | post_detail | capture_deed_photo, choose_deed_photo, complete_deed, thank_helpers |
| messages | tab | — | open_messages, open_conversation |
| conversation | push | messages | send_message, start_helper_call |
| profile | tab | — | open_profile, open_saved, open_settings |
| saved | push | profile | open_deed |
| notifications | push | feed | open_notification, enable_result_alerts |
| settings | push | profile | open_accesses, enable_message_alerts, enable_promotion_measurement, manage_demo_credential, unlock_private_deeds, import_helpers, publish_quick_update_widget, share_session_with_widget, apply_silent_snapshot, refresh_feed_on_fetch, schedule_digest_task |
| accesses | push | settings |  |
| private_deeds | push | profile | unlock_private_deeds, open_deed |

## Корневые вкладки

```json
[
  {
    "screenId": "feed",
    "title": "Лента",
    "icon": "house"
  },
  {
    "screenId": "search",
    "title": "Поиск",
    "icon": "magnifyingglass"
  },
  {
    "screenId": "create",
    "title": "Создать",
    "icon": "plus.circle.fill"
  },
  {
    "screenId": "messages",
    "title": "Сообщения",
    "icon": "message"
  },
  {
    "screenId": "profile",
    "title": "Профиль",
    "icon": "person.crop.circle"
  }
]
```

## Скомпилированные переходы

| ID | Экран | Тип | Цель | Размещение |
|---|---|---|---|---|
| request_email_code | login | mutate | login | attached |
| verify_email_code | login | mutate | login | attached |
| open_feed | feed | system | feed | attached |
| open_deed | private_deeds | system | private_deeds | attached |
| create_deed | create | mutate | create | content |
| edit_deed_text | create | mutate | create | content |
| publish_deed | create | mutate | create | content |
| support_deed | post_detail | mutate | post_detail | content |
| offer_help | post_detail | mutate | post_detail | attached |
| follow_result | post_detail | mutate | post_detail | attached |
| open_comments | feed | navigate | post_detail#comments | attached |
| respond_to_post | post_detail | mutate | post_detail | attached |
| share_deed | post_detail | mutate | post_detail | attached |
| save_deed | post_detail | mutate | post_detail | attached |
| add_update | post_detail | mutate | post_detail | attached |
| add_contribution | post_detail | mutate | post_detail | attached |
| complete_deed | complete | mutate | complete | attached |
| thank_helpers | complete | mutate | complete | attached |
| take_baton | post_detail | mutate | post_detail | attached |
| search_world | search | mutate | search | attached |
| open_search_result | search | system | search | attached |
| open_notifications | feed | system | feed | attached |
| open_notification | notifications | system | notifications | attached |
| open_messages | messages | system | messages | attached |
| open_conversation | messages | navigate | conversation | attached |
| send_message | conversation | mutate | conversation | attached |
| open_profile | profile | navigate | profile | attached |
| open_saved | profile | navigate | saved | attached |
| open_settings | profile | navigate | settings | attached |
| open_accesses | settings | navigate | accesses | attached |
| capture_deed_photo | complete | mutate | complete | attached |
| choose_deed_photo | complete | mutate | complete | attached |
| record_voice_update | create | mutate | create | attached |
| choose_deed_place | create | mutate | create | attached |
| enable_result_alerts | notifications | mutate | notifications | attached |
| enable_message_alerts | settings | mutate | settings | attached |
| apply_silent_snapshot | settings | mutate | settings | attached |
| refresh_feed_on_fetch | settings | mutate | settings | attached |
| schedule_digest_task | settings | mutate | settings | attached |
| publish_quick_update_widget | settings | mutate | settings | attached |
| share_session_with_widget | settings | mutate | settings | attached |
| manage_demo_credential | settings | mutate | settings | attached |
| verify_site_network | post_detail | mutate | post_detail | attached |
| import_helpers | settings | mutate | settings | attached |
| enable_promotion_measurement | settings | mutate | settings | attached |
| unlock_private_deeds | private_deeds | mutate | private_deeds | attached |
| transcribe_voice_update | post_detail | mutate | post_detail | attached |
| play_voice_update | post_detail | mutate | post_detail | attached |
| start_helper_call | conversation | mutate | conversation | attached |
| add_deadline_to_calendar | post_detail | mutate | post_detail | attached |
| open_deed_link | feed | system | feed | attached |
| join_deed_network | post_detail | mutate | post_detail | attached |
