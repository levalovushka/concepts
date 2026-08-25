## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | complete-fill<br>permission.autofill.fallback | complete-fill:mutate | screen.fill.state.permission-restricted.recovery | fixture.today.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| refresh | loading | yes | screen.refresh.state.loading.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.loading.recovery | fixture.today.refresh.loading |
| refresh | populated/default | yes | screen.refresh.state.populated-default.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.populated-default.recovery | fixture.today.refresh.default |
| refresh | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| refresh | error | yes | screen.refresh.state.error.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.error.recovery | fixture.today.refresh.error |
| refresh | offline | yes | screen.refresh.state.offline.body | complete-refresh | complete-refresh:mutate | screen.refresh.state.offline.recovery | fixture.today.refresh.offline |
| refresh | permission-needed | yes | screen.refresh.state.permission-needed.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-needed.recovery | fixture.today.refresh.permission-needed |
| refresh | permission-denied | yes | screen.refresh.state.permission-denied.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-denied.recovery | fixture.today.refresh.permission-denied |
| refresh | permission-restricted | yes | screen.refresh.state.permission-restricted.body | complete-refresh<br>permission.bgtask.fallback | complete-refresh:mutate | screen.refresh.state.permission-restricted.recovery | fixture.today.refresh.permission-restricted |
| refresh | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| mates | loading | yes | screen.mates.state.loading.body | complete-mates | complete-mates:mutate | screen.mates.state.loading.recovery | fixture.today.mates.loading |
| mates | populated/default | yes | screen.mates.state.populated-default.body | complete-mates | complete-mates:mutate | screen.mates.state.populated-default.recovery | fixture.today.mates.default |
| mates | empty | yes | screen.mates.state.empty.body | complete-mates | complete-mates:mutate | screen.mates.state.empty.recovery | fixture.today.mates.empty |
| mates | error | yes | screen.mates.state.error.body | complete-mates | complete-mates:mutate | screen.mates.state.error.recovery | fixture.today.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | complete-mates | complete-mates:mutate | screen.mates.state.offline.recovery | fixture.today.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-needed.recovery | fixture.today.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-denied.recovery | fixture.today.mates.denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-restricted.recovery | fixture.today.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-limited.recovery | fixture.today.mates.permission-limited |
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.today.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.today.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.today.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.today.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.today.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.today.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.today.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | complete-lock | complete-lock:mutate | screen.lock.state.loading.recovery | fixture.today.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | complete-lock | complete-lock:mutate | screen.lock.state.populated-default.recovery | fixture.today.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
