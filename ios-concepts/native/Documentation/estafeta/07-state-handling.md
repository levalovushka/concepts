# Canonical state handling

Loading, populated, empty, error and offline are explicit per screen. Permission denial belongs to the owning capability journey.

| Screen | State | Content | Actions | Recovery |
|---|---|---|---|---|
| relay_feed | populated/default | Канонические fixture-данные | open_relay, open_profile | — |
| relay_feed | empty | Явная empty-вариация | open_relay, open_profile | — |
| relay_feed | offline | Явная offline-вариация | open_relay, open_profile | Повторить без потери локального состояния |
| turn | populated/default | Канонические fixture-данные | accept_turn | — |
| turn | error | Явная error-вариация | accept_turn | Повторить без потери локального состояния |
| chapter_result | populated/default | Канонические fixture-данные | capture_chapter | — |
| chapter_result | permission-denied | Явная permission-denied-вариация | capture_chapter | — |
| discover | populated/default | Канонические fixture-данные | support_chapter, capability_location, capability_wifiinfo, capability_tracking, capability_associateddomains, capability_hotspot | — |
| discover | empty | Явная empty-вариация | support_chapter, capability_location, capability_wifiinfo, capability_tracking, capability_associateddomains, capability_hotspot | — |
| create | populated/default | Канонические fixture-данные | start_relay, capability_photos, capability_mic, capability_appgroups, capability_speech, capability_audio | — |
| create | permission-denied | Явная permission-denied-вариация | start_relay, capability_photos, capability_mic, capability_appgroups, capability_speech, capability_audio | — |
| messages | populated/default | Канонические fixture-данные | open_reply, capability_push, capability_commnotif, capability_remotenotif, capability_contacts, capability_voip | — |
| messages | empty | Явная empty-вариация | open_reply, capability_push, capability_commnotif, capability_remotenotif, capability_contacts, capability_voip | — |
| services | populated/default | Канонические fixture-данные | open_active_relays, open_drafts, open_schedule | — |
| services | offline | Явная offline-вариация | open_active_relays, open_drafts, open_schedule | Повторить без потери локального состояния |
| profile | populated/default | Канонические fixture-данные | open_settings, capability_keychain, capability_faceid | — |
| active_relays | populated/default | Канонические fixture-данные |  | — |
| drafts | populated/default | Канонические fixture-данные |  | — |
| schedule | populated/default | Канонические fixture-данные |  | — |
| handoff | populated/default | Канонические fixture-данные | pass_turn, capability_calendar | — |
| handoff | error | Явная error-вариация | pass_turn, capability_calendar | Повторить без потери локального состояния |
| settings | populated/default | Канонические fixture-данные | capability_fetch, capability_bgtask, capability_autofill | — |
