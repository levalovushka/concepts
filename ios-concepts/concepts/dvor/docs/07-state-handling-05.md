## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| chat | empty | yes | screen.chat.state.empty.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.empty.recovery | fixture.dvor.chat.empty |
| chat | error | yes | screen.chat.state.error.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.error.recovery | fixture.dvor.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.offline.recovery | fixture.dvor.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | send-message<br>attach-photo<br>record-voice<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.commnotif.fallback | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.permission-needed.recovery | fixture.dvor.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | send-message<br>attach-photo<br>record-voice<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.commnotif.fallback | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.permission-denied.recovery | fixture.dvor.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | send-message<br>attach-photo<br>record-voice<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.commnotif.fallback | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.permission-restricted.recovery | fixture.dvor.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | yes | screen.voice.state.loading.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.loading.recovery | fixture.dvor.voice.recording<br>fixture.dvor.voice.transcribing |
| voice | populated/default | yes | screen.voice.state.populated-default.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.populated-default.recovery | fixture.dvor.voice.default<br>fixture.dvor.voice.ready |
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.error.recovery | fixture.dvor.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | send-voice<br>cancel-voice | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.offline.recovery | fixture.dvor.voice.offline |
| voice | permission-needed | yes | screen.voice.state.permission-needed.body | send-voice<br>cancel-voice<br>permission.mic.fallback<br>permission.speech.fallback | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.permission-needed.recovery | fixture.dvor.voice.permission-needed |
| voice | permission-denied | yes | screen.voice.state.permission-denied.body | send-voice<br>cancel-voice<br>permission.mic.fallback<br>permission.speech.fallback | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.permission-denied.recovery | fixture.dvor.voice.denied |
| voice | permission-restricted | yes | screen.voice.state.permission-restricted.body | send-voice<br>cancel-voice<br>permission.mic.fallback<br>permission.speech.fallback | send-voice:mutate<br>cancel-voice:dismiss | screen.voice.state.permission-restricted.recovery | fixture.dvor.voice.permission-restricted |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lockscreen | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| lockscreen | populated/default | yes | screen.lockscreen.state.populated-default.body |  |  | screen.lockscreen.state.populated-default.recovery | fixture.dvor.lockscreen.default |
| lockscreen | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lockscreen | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| lockscreen | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| lockscreen | permission-needed | yes | screen.lockscreen.state.permission-needed.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-needed.recovery | fixture.dvor.lockscreen.permission-needed |
| lockscreen | permission-denied | yes | screen.lockscreen.state.permission-denied.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-denied.recovery | fixture.dvor.lockscreen.permission-denied |
| lockscreen | permission-restricted | yes | screen.lockscreen.state.permission-restricted.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-restricted.recovery | fixture.dvor.lockscreen.permission-restricted |
| lockscreen | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| yard | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| yard | populated/default | yes | screen.yard.state.populated-default.body | open-incident<br>open-yard-event<br>open-guest<br>open-meters<br>open-events | open-incident:navigate→post<br>open-yard-event:navigate→events<br>open-guest:navigate→guest<br>open-meters:navigate→meters<br>open-events:navigate→events | screen.yard.state.populated-default.recovery | fixture.dvor.yard.default |
| yard | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| yard | error | yes | screen.yard.state.error.body | open-incident<br>open-yard-event<br>open-guest<br>open-meters<br>open-events | open-incident:navigate→post<br>open-yard-event:navigate→events<br>open-guest:navigate→guest<br>open-meters:navigate→meters<br>open-events:navigate→events | screen.yard.state.error.recovery | fixture.dvor.yard.error |
| yard | offline | yes | screen.yard.state.offline.body | open-incident<br>open-yard-event<br>open-guest<br>open-meters<br>open-events | open-incident:navigate→post<br>open-yard-event:navigate→events<br>open-guest:navigate→guest<br>open-meters:navigate→meters<br>open-events:navigate→events | screen.yard.state.offline.recovery | fixture.dvor.yard.offline |
| yard | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| yard | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
