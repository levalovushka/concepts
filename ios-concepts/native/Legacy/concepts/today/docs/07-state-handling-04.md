## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| groups | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| groups | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| groups | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chats | loading | yes | screen.chats.state.loading.body | open-chat | open-chat:navigate→chat | screen.chats.state.loading.recovery | fixture.today.chats.loading |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.today.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.today.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.today.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.today.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-voice | open-voice:navigate→voice | screen.chat.state.loading.recovery | fixture.today.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-voice | open-voice:navigate→voice | screen.chat.state.populated-default.recovery | fixture.today.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-voice | open-voice:navigate→voice | screen.chat.state.error.recovery | fixture.today.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-voice | open-voice:navigate→voice | screen.chat.state.offline.recovery | fixture.today.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-needed.recovery | fixture.today.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-denied.recovery | fixture.today.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-voice<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | open-voice:navigate→voice | screen.chat.state.permission-restricted.recovery | fixture.today.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | yes | screen.voice.state.loading.body | complete-voice | complete-voice:mutate | screen.voice.state.loading.recovery | fixture.today.voice.loading |
| voice | populated/default | yes | screen.voice.state.populated-default.body | complete-voice | complete-voice:mutate | screen.voice.state.populated-default.recovery | fixture.today.voice.default |
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | complete-voice | complete-voice:mutate | screen.voice.state.error.recovery | fixture.today.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | complete-voice | complete-voice:mutate | screen.voice.state.offline.recovery | fixture.today.voice.offline |
| voice | permission-needed | yes | screen.voice.state.permission-needed.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-needed.recovery | fixture.today.voice.permission-needed |
| voice | permission-denied | yes | screen.voice.state.permission-denied.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-denied.recovery | fixture.today.voice.denied |
| voice | permission-restricted | yes | screen.voice.state.permission-restricted.body | complete-voice<br>permission.mic.fallback | complete-voice:mutate | screen.voice.state.permission-restricted.recovery | fixture.today.voice.permission-restricted |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| profile | loading | yes | screen.profile.state.loading.body | open-settings | open-settings:navigate→settings | screen.profile.state.loading.recovery | fixture.today.profile.loading |
| profile | populated/default | yes | screen.profile.state.populated-default.body | open-settings | open-settings:navigate→settings | screen.profile.state.populated-default.recovery | fixture.today.profile.default |
