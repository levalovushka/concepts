## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| camera | permission-denied | yes | screen.camera.state.permission-denied.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-denied.recovery | fixture.looks.camera.denied |
| camera | permission-restricted | yes | screen.camera.state.permission-restricted.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-restricted.recovery | fixture.looks.camera.permission-restricted |
| camera | permission-limited | yes | screen.camera.state.permission-limited.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-limited.recovery | fixture.looks.camera.permission-limited |
| media | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| media | populated/default | yes | screen.media.state.populated-default.body |  |  | screen.media.state.populated-default.recovery | fixture.looks.media.default |
| media | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| media | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| media | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| media | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| media | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| media | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| media | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chats | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.looks.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.looks.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.looks.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.looks.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| chat | populated/default | yes | screen.chat.state.populated-default.body | send-message | send-message:mutate | screen.chat.state.populated-default.recovery | fixture.looks.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | send-message | send-message:mutate | screen.chat.state.error.recovery | fixture.looks.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | send-message | send-message:mutate | screen.chat.state.offline.recovery | fixture.looks.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | send-message<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | send-message:mutate | screen.chat.state.permission-needed.recovery | fixture.looks.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | send-message<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | send-message:mutate | screen.chat.state.permission-denied.recovery | fixture.looks.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | send-message<br>permission.mic.fallback<br>permission.commnotif.fallback<br>permission.voip.fallback | send-message:mutate | screen.chat.state.permission-restricted.recovery | fixture.looks.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| voice | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| voice | populated/default | yes | screen.voice.state.populated-default.body | send-voice | send-voice:mutate | screen.voice.state.populated-default.recovery | fixture.looks.voice.default |
