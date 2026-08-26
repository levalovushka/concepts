## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.peresmenka.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.peresmenka.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.peresmenka.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.peresmenka.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.peresmenka.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| chat | loading | yes | screen.chat.state.loading.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.loading.recovery | fixture.peresmenka.chat.loading |
| chat | populated/default | yes | screen.chat.state.populated-default.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.populated-default.recovery | fixture.peresmenka.chat.default |
| chat | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| chat | error | yes | screen.chat.state.error.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.error.recovery | fixture.peresmenka.chat.error |
| chat | offline | yes | screen.chat.state.offline.body | open-lockscreen | open-lockscreen:navigate→lockscreen | screen.chat.state.offline.recovery | fixture.peresmenka.chat.offline |
| chat | permission-needed | yes | screen.chat.state.permission-needed.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-needed.recovery | fixture.peresmenka.chat.permission-needed |
| chat | permission-denied | yes | screen.chat.state.permission-denied.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-denied.recovery | fixture.peresmenka.chat.permission-denied |
| chat | permission-restricted | yes | screen.chat.state.permission-restricted.body | open-lockscreen<br>permission.commnotif.fallback | open-lockscreen:navigate→lockscreen | screen.chat.state.permission-restricted.recovery | fixture.peresmenka.chat.permission-restricted |
| chat | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lockscreen | loading | yes | screen.lockscreen.state.loading.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.loading.recovery | fixture.peresmenka.lockscreen.loading |
| lockscreen | populated/default | yes | screen.lockscreen.state.populated-default.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.populated-default.recovery | fixture.peresmenka.lockscreen.default |
| lockscreen | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lockscreen | error | yes | screen.lockscreen.state.error.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.error.recovery | fixture.peresmenka.lockscreen.error |
| lockscreen | offline | yes | screen.lockscreen.state.offline.body | complete-lockscreen | complete-lockscreen:mutate | screen.lockscreen.state.offline.recovery | fixture.peresmenka.lockscreen.offline |
| lockscreen | permission-needed | yes | screen.lockscreen.state.permission-needed.body | complete-lockscreen<br>permission.commnotif.fallback | complete-lockscreen:mutate | screen.lockscreen.state.permission-needed.recovery | fixture.peresmenka.lockscreen.permission-needed |
| lockscreen | permission-denied | yes | screen.lockscreen.state.permission-denied.body | complete-lockscreen<br>permission.commnotif.fallback | complete-lockscreen:mutate | screen.lockscreen.state.permission-denied.recovery | fixture.peresmenka.lockscreen.permission-denied |
| lockscreen | permission-restricted | yes | screen.lockscreen.state.permission-restricted.body | complete-lockscreen<br>permission.commnotif.fallback | complete-lockscreen:mutate | screen.lockscreen.state.permission-restricted.recovery | fixture.peresmenka.lockscreen.permission-restricted |
| lockscreen | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| menu | loading | yes | screen.menu.state.loading.body | open-lock | open-lock:navigate→lock | screen.menu.state.loading.recovery | fixture.peresmenka.menu.loading |
| menu | populated/default | yes | screen.menu.state.populated-default.body | open-lock | open-lock:navigate→lock | screen.menu.state.populated-default.recovery | fixture.peresmenka.menu.default |
| menu | empty | yes | screen.menu.state.empty.body | open-lock | open-lock:navigate→lock | screen.menu.state.empty.recovery | fixture.peresmenka.menu.empty |
| menu | error | yes | screen.menu.state.error.body | open-lock | open-lock:navigate→lock | screen.menu.state.error.recovery | fixture.peresmenka.menu.error |
| menu | offline | yes | screen.menu.state.offline.body | open-lock | open-lock:navigate→lock | screen.menu.state.offline.recovery | fixture.peresmenka.menu.offline |
| menu | permission-needed | yes | screen.menu.state.permission-needed.body | open-lock<br>permission.faceid.fallback<br>permission.tracking.fallback | open-lock:navigate→lock | screen.menu.state.permission-needed.recovery | fixture.peresmenka.menu.permission-needed |
| menu | permission-denied | yes | screen.menu.state.permission-denied.body | open-lock<br>permission.faceid.fallback<br>permission.tracking.fallback | open-lock:navigate→lock | screen.menu.state.permission-denied.recovery | fixture.peresmenka.menu.permission-denied |
| menu | permission-restricted | yes | screen.menu.state.permission-restricted.body | open-lock<br>permission.faceid.fallback<br>permission.tracking.fallback | open-lock:navigate→lock | screen.menu.state.permission-restricted.recovery | fixture.peresmenka.menu.permission-restricted |
