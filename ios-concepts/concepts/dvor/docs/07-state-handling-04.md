## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| problem | permission-denied | yes | screen.problem.state.permission-denied.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-denied.recovery | fixture.dvor.problem.permission-denied |
| problem | permission-restricted | yes | screen.problem.state.permission-restricted.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-restricted.recovery | fixture.dvor.problem.permission-restricted |
| problem | permission-limited | yes | screen.problem.state.permission-limited.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-limited.recovery | fixture.dvor.problem.permission-limited |
| shoot | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| shoot | populated/default | yes | screen.shoot.state.populated-default.body |  |  | screen.shoot.state.populated-default.recovery | fixture.dvor.shoot.default |
| shoot | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shoot | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| shoot | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| shoot | permission-needed | yes | screen.shoot.state.permission-needed.body | permission.camera.fallback |  | screen.shoot.state.permission-needed.recovery | fixture.dvor.shoot.permission-needed |
| shoot | permission-denied | yes | screen.shoot.state.permission-denied.body | permission.camera.fallback |  | screen.shoot.state.permission-denied.recovery | fixture.dvor.shoot.denied |
| shoot | permission-restricted | yes | screen.shoot.state.permission-restricted.body | permission.camera.fallback |  | screen.shoot.state.permission-restricted.recovery | fixture.dvor.shoot.permission-restricted |
| shoot | permission-limited | yes | screen.shoot.state.permission-limited.body | permission.camera.fallback |  | screen.shoot.state.permission-limited.recovery | fixture.dvor.shoot.permission-limited |
| chronicle | loading | yes | screen.chronicle.state.loading.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.loading.recovery | fixture.dvor.chronicle.scanning |
| chronicle | populated/default | yes | screen.chronicle.state.populated-default.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.populated-default.recovery | fixture.dvor.chronicle.default<br>fixture.dvor.chronicle.populated<br>fixture.dvor.chronicle.selected |
| chronicle | empty | yes | screen.chronicle.state.empty.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.empty.recovery | fixture.dvor.chronicle.empty |
| chronicle | error | yes | screen.chronicle.state.error.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.error.recovery | fixture.dvor.chronicle.error |
| chronicle | offline | yes | screen.chronicle.state.offline.body | select-photos<br>share-chronicle | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.offline.recovery | fixture.dvor.chronicle.offline |
| chronicle | permission-needed | yes | screen.chronicle.state.permission-needed.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-needed.recovery | fixture.dvor.chronicle.permission-needed |
| chronicle | permission-denied | yes | screen.chronicle.state.permission-denied.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-denied.recovery | fixture.dvor.chronicle.denied |
| chronicle | permission-restricted | yes | screen.chronicle.state.permission-restricted.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-restricted.recovery | fixture.dvor.chronicle.permission-restricted |
| chronicle | permission-limited | yes | screen.chronicle.state.permission-limited.body | select-photos<br>share-chronicle<br>permission.photos.fallback | select-photos:request<br>share-chronicle:mutate | screen.chronicle.state.permission-limited.recovery | fixture.dvor.chronicle.permission-limited |
| chats | loading | yes | screen.chats.state.loading.body | open-chat | open-chat:navigate→chat | screen.chats.state.loading.recovery | fixture.dvor.chats.loading |
| chats | populated/default | yes | screen.chats.state.populated-default.body | open-chat | open-chat:navigate→chat | screen.chats.state.populated-default.recovery | fixture.dvor.chats.default |
| chats | empty | yes | screen.chats.state.empty.body | open-chat | open-chat:navigate→chat | screen.chats.state.empty.recovery | fixture.dvor.chats.empty |
| chats | error | yes | screen.chats.state.error.body | open-chat | open-chat:navigate→chat | screen.chats.state.error.recovery | fixture.dvor.chats.error |
| chats | offline | yes | screen.chats.state.offline.body | open-chat | open-chat:navigate→chat | screen.chats.state.offline.recovery | fixture.dvor.chats.offline |
| chats | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| chats | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.loading.recovery | fixture.dvor.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | send-message<br>attach-photo<br>record-voice | send-message:mutate<br>attach-photo:request<br>record-voice:request | screen.chat.state.populated-default.recovery | fixture.dvor.chat.default |
