# Граф экранов и навигации

| Экран | Тип | Родитель | Действия |
|---|---|---|---|
| relay_feed | tab | — | open_relay, open_profile |
| turn | push | relay_feed | accept_turn |
| chapter_result | push | relay_feed | capture_chapter |
| discover | tab | — | support_chapter, capability_location, capability_wifiinfo, capability_tracking, capability_associateddomains, capability_hotspot |
| create | tab | — | start_relay, capability_photos, capability_mic, capability_appgroups, capability_speech, capability_audio |
| messages | tab | — | open_reply, capability_push, capability_commnotif, capability_remotenotif, capability_contacts, capability_voip |
| services | tab | — | open_active_relays, open_drafts, open_schedule |
| profile | push | relay_feed | open_settings, capability_keychain, capability_faceid |
| active_relays | push | relay_feed |  |
| drafts | push | relay_feed |  |
| schedule | push | relay_feed |  |
| handoff | push | relay_feed | pass_turn, capability_calendar |
| settings | push | relay_feed | capability_fetch, capability_bgtask, capability_autofill |

## Корневые вкладки

```json
[
  {
    "screenId": "relay_feed",
    "title": "Лента",
    "icon": "feed"
  },
  {
    "screenId": "discover",
    "title": "Поиск",
    "icon": "discovery"
  },
  {
    "screenId": "create",
    "title": "Создать",
    "icon": "short-video"
  },
  {
    "screenId": "messages",
    "title": "Ответы",
    "icon": "messaging"
  },
  {
    "screenId": "services",
    "title": "Ещё",
    "icon": "services"
  }
]
```

## Скомпилированные переходы

| ID | Экран | Тип | Цель | Размещение |
|---|---|---|---|---|
| open_relay | relay_feed | mutate | relay_feed | content |
| accept_turn | turn | mutate | turn | content |
| capture_chapter | chapter_result | mutate | chapter_result | content |
| pass_turn | handoff | mutate | handoff | content |
| open_reply | messages | mutate | messages | attached |
| support_chapter | discover | mutate | discover | attached |
| start_relay | create | mutate | create | attached |
| open_profile | relay_feed | mutate | relay_feed | attached |
| open_active_relays | services | mutate | services | attached |
| open_drafts | services | mutate | services | attached |
| open_schedule | services | mutate | services | attached |
| open_settings | profile | mutate | profile | attached |
| capability_photos | create | system | create | attached |
| capability_mic | create | system | create | attached |
| capability_location | discover | system | discover | attached |
| capability_push | messages | system | messages | attached |
| capability_commnotif | messages | system | messages | attached |
| capability_remotenotif | messages | system | messages | attached |
| capability_fetch | settings | system | settings | attached |
| capability_bgtask | settings | system | settings | attached |
| capability_appgroups | create | system | create | attached |
| capability_keychain | profile | system | profile | attached |
| capability_autofill | settings | system | settings | attached |
| capability_wifiinfo | discover | system | discover | attached |
| capability_contacts | messages | system | messages | attached |
| capability_tracking | discover | system | discover | attached |
| capability_faceid | profile | system | profile | attached |
| capability_speech | create | system | create | attached |
| capability_audio | create | system | create | attached |
| capability_voip | messages | system | messages | attached |
| capability_calendar | handoff | system | handoff | attached |
| capability_associateddomains | discover | system | discover | attached |
| capability_hotspot | discover | system | discover | attached |
