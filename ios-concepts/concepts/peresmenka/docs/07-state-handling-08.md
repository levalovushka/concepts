## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| menu | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.peresmenka.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.peresmenka.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.peresmenka.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.peresmenka.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.peresmenka.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.peresmenka.lock.permission-denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.peresmenka.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| money | loading | yes | screen.money.state.loading.body | complete-money | complete-money:mutate | screen.money.state.loading.recovery | fixture.peresmenka.money.loading |
| money | populated/default | yes | screen.money.state.populated-default.body | complete-money | complete-money:mutate | screen.money.state.populated-default.recovery | fixture.peresmenka.money.default |
| money | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| money | error | yes | screen.money.state.error.body | complete-money | complete-money:mutate | screen.money.state.error.recovery | fixture.peresmenka.money.error |
| money | offline | yes | screen.money.state.offline.body | complete-money | complete-money:mutate | screen.money.state.offline.recovery | fixture.peresmenka.money.offline |
| money | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| money | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| money | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| money | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| passwords | loading | yes | screen.passwords.state.loading.body | open-fill | open-fill:navigate→fill | screen.passwords.state.loading.recovery | fixture.peresmenka.passwords.loading |
| passwords | populated/default | yes | screen.passwords.state.populated-default.body | open-fill | open-fill:navigate→fill | screen.passwords.state.populated-default.recovery | fixture.peresmenka.passwords.default |
| passwords | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| passwords | error | yes | screen.passwords.state.error.body | open-fill | open-fill:navigate→fill | screen.passwords.state.error.recovery | fixture.peresmenka.passwords.error |
| passwords | offline | yes | screen.passwords.state.offline.body | open-fill | open-fill:navigate→fill | screen.passwords.state.offline.recovery | fixture.peresmenka.passwords.offline |
| passwords | permission-needed | yes | screen.passwords.state.permission-needed.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-needed.recovery | fixture.peresmenka.passwords.permission-needed |
| passwords | permission-denied | yes | screen.passwords.state.permission-denied.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-denied.recovery | fixture.peresmenka.passwords.permission-denied |
| passwords | permission-restricted | yes | screen.passwords.state.permission-restricted.body | open-fill<br>permission.autofill.fallback | open-fill:navigate→fill | screen.passwords.state.permission-restricted.recovery | fixture.peresmenka.passwords.permission-restricted |
| passwords | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | yes | screen.fill.state.loading.body | complete-fill | complete-fill:mutate | screen.fill.state.loading.recovery | fixture.peresmenka.fill.loading |
| fill | populated/default | yes | screen.fill.state.populated-default.body | complete-fill | complete-fill:mutate | screen.fill.state.populated-default.recovery | fixture.peresmenka.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | yes | screen.fill.state.error.body | complete-fill | complete-fill:mutate | screen.fill.state.error.recovery | fixture.peresmenka.fill.error |
