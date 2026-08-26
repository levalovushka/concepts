## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| reschedule | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| reschedule | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| reschedule | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.loading.recovery | fixture.nakat.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.populated-default.recovery | fixture.nakat.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.error.recovery | fixture.nakat.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.offline.recovery | fixture.nakat.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-needed.recovery | fixture.nakat.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-denied.recovery | fixture.nakat.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-restricted.recovery | fixture.nakat.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lockscreen | loading | yes | screen.lockscreen.state.loading.body |  |  | screen.lockscreen.state.loading.recovery | fixture.nakat.lockscreen.loading |
| lockscreen | populated/default | yes | screen.lockscreen.state.populated-default.body |  |  | screen.lockscreen.state.populated-default.recovery | fixture.nakat.lockscreen.default |
| lockscreen | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lockscreen | error | yes | screen.lockscreen.state.error.body |  |  | screen.lockscreen.state.error.recovery | fixture.nakat.lockscreen.error |
| lockscreen | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| lockscreen | permission-needed | yes | screen.lockscreen.state.permission-needed.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-needed.recovery | fixture.nakat.lockscreen.permission-needed |
| lockscreen | permission-denied | yes | screen.lockscreen.state.permission-denied.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-denied.recovery | fixture.nakat.lockscreen.permission-denied |
| lockscreen | permission-restricted | yes | screen.lockscreen.state.permission-restricted.body | permission.commnotif.fallback |  | screen.lockscreen.state.permission-restricted.recovery | fixture.nakat.lockscreen.permission-restricted |
| lockscreen | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| notif | loading | yes | screen.notif.state.loading.body | complete-notif | complete-notif:mutate | screen.notif.state.loading.recovery | fixture.nakat.notif.loading |
| notif | populated/default | yes | screen.notif.state.populated-default.body | complete-notif | complete-notif:mutate | screen.notif.state.populated-default.recovery | fixture.nakat.notif.default |
| notif | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| notif | error | yes | screen.notif.state.error.body | complete-notif | complete-notif:mutate | screen.notif.state.error.recovery | fixture.nakat.notif.error |
| notif | offline | yes | screen.notif.state.offline.body | complete-notif | complete-notif:mutate | screen.notif.state.offline.recovery | fixture.nakat.notif.offline |
| notif | permission-needed | yes | screen.notif.state.permission-needed.body | complete-notif<br>permission.push.fallback | complete-notif:mutate | screen.notif.state.permission-needed.recovery | fixture.nakat.notif.permission-needed |
| notif | permission-denied | yes | screen.notif.state.permission-denied.body | complete-notif<br>permission.push.fallback | complete-notif:mutate | screen.notif.state.permission-denied.recovery | fixture.nakat.notif.permission-denied |
| notif | permission-restricted | yes | screen.notif.state.permission-restricted.body | complete-notif<br>permission.push.fallback | complete-notif:mutate | screen.notif.state.permission-restricted.recovery | fixture.nakat.notif.permission-restricted |
| notif | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| theory | loading | yes | screen.theory.state.loading.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.loading.recovery | fixture.nakat.theory.loading |
| theory | populated/default | yes | screen.theory.state.populated-default.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.populated-default.recovery | fixture.nakat.theory.default |
