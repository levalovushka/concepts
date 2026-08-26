## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.today.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.today.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.today.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.today.lock.denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.today.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| sayplan | loading | yes | screen.sayplan.state.loading.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.loading.recovery | fixture.today.sayplan.loading |
| sayplan | populated/default | yes | screen.sayplan.state.populated-default.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.populated-default.recovery | fixture.today.sayplan.default<br>fixture.today.sayplan.success |
| sayplan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| sayplan | error | yes | screen.sayplan.state.error.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.error.recovery | fixture.today.sayplan.error |
| sayplan | offline | yes | screen.sayplan.state.offline.body | complete-sayplan | complete-sayplan:mutate | screen.sayplan.state.offline.recovery | fixture.today.sayplan.offline |
| sayplan | permission-needed | yes | screen.sayplan.state.permission-needed.body | complete-sayplan<br>permission.speech.fallback | complete-sayplan:mutate | screen.sayplan.state.permission-needed.recovery | fixture.today.sayplan.permission-needed |
| sayplan | permission-denied | yes | screen.sayplan.state.permission-denied.body | complete-sayplan<br>permission.speech.fallback | complete-sayplan:mutate | screen.sayplan.state.permission-denied.recovery | fixture.today.sayplan.permission-denied |
| sayplan | permission-restricted | yes | screen.sayplan.state.permission-restricted.body | complete-sayplan<br>permission.speech.fallback | complete-sayplan:mutate | screen.sayplan.state.permission-restricted.recovery | fixture.today.sayplan.permission-restricted |
| sayplan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| onway | loading | yes | screen.onway.state.loading.body | open-background | open-background:navigate→background | screen.onway.state.loading.recovery | fixture.today.onway.loading |
| onway | populated/default | yes | screen.onway.state.populated-default.body | open-background | open-background:navigate→background | screen.onway.state.populated-default.recovery | fixture.today.onway.default |
| onway | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| onway | error | yes | screen.onway.state.error.body | open-background | open-background:navigate→background | screen.onway.state.error.recovery | fixture.today.onway.error |
| onway | offline | yes | screen.onway.state.offline.body | open-background | open-background:navigate→background | screen.onway.state.offline.recovery | fixture.today.onway.offline |
| onway | permission-needed | yes | screen.onway.state.permission-needed.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.onway.state.permission-needed.recovery | fixture.today.onway.permission-needed |
| onway | permission-denied | yes | screen.onway.state.permission-denied.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.onway.state.permission-denied.recovery | fixture.today.onway.permission-denied |
| onway | permission-restricted | yes | screen.onway.state.permission-restricted.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.onway.state.permission-restricted.recovery | fixture.today.onway.permission-restricted |
| onway | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | complete-background | complete-background:mutate | screen.background.state.loading.recovery | fixture.today.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | complete-background | complete-background:mutate | screen.background.state.populated-default.recovery | fixture.today.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | complete-background | complete-background:mutate | screen.background.state.error.recovery | fixture.today.background.error |
| background | offline | yes | screen.background.state.offline.body | complete-background | complete-background:mutate | screen.background.state.offline.recovery | fixture.today.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-needed.recovery | fixture.today.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-denied.recovery | fixture.today.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-restricted.recovery | fixture.today.background.permission-restricted |
