## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| docs | permission-limited | yes | screen.docs.state.permission-limited.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-limited.recovery | fixture.nakat.docs.permission-limited |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.nakat.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.nakat.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.nakat.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.nakat.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.nakat.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.nakat.lock.permission-denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.nakat.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| passwords | loading | yes | screen.passwords.state.loading.body | open-fill | open-fill:navigate→fill | screen.passwords.state.loading.recovery | fixture.nakat.passwords.loading |
| passwords | populated/default | yes | screen.passwords.state.populated-default.body | open-fill | open-fill:navigate→fill | screen.passwords.state.populated-default.recovery | fixture.nakat.passwords.default |
| passwords | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| passwords | error | yes | screen.passwords.state.error.body | open-fill | open-fill:navigate→fill | screen.passwords.state.error.recovery | fixture.nakat.passwords.error |
| passwords | offline | yes | screen.passwords.state.offline.body | open-fill | open-fill:navigate→fill | screen.passwords.state.offline.recovery | fixture.nakat.passwords.offline |
| passwords | permission-needed | yes | screen.passwords.state.permission-needed.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-needed.recovery | fixture.nakat.passwords.permission-needed |
| passwords | permission-denied | yes | screen.passwords.state.permission-denied.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-denied.recovery | fixture.nakat.passwords.permission-denied |
| passwords | permission-restricted | yes | screen.passwords.state.permission-restricted.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-restricted.recovery | fixture.nakat.passwords.permission-restricted |
| passwords | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | yes | screen.fill.state.loading.body |  |  | screen.fill.state.loading.recovery | fixture.nakat.fill.loading |
| fill | populated/default | yes | screen.fill.state.populated-default.body |  |  | screen.fill.state.populated-default.recovery | fixture.nakat.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | yes | screen.fill.state.error.body |  |  | screen.fill.state.error.recovery | fixture.nakat.fill.error |
| fill | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | permission.autofill.fallback |  | screen.fill.state.permission-needed.recovery | fixture.nakat.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | permission.autofill.fallback |  | screen.fill.state.permission-denied.recovery | fixture.nakat.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | permission.autofill.fallback |  | screen.fill.state.permission-restricted.recovery | fixture.nakat.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | yes | screen.widget.state.loading.body |  |  | screen.widget.state.loading.recovery | fixture.nakat.widget.loading |
| widget | populated/default | yes | screen.widget.state.populated-default.body |  |  | screen.widget.state.populated-default.recovery | fixture.nakat.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | yes | screen.widget.state.error.body |  |  | screen.widget.state.error.recovery | fixture.nakat.widget.error |
