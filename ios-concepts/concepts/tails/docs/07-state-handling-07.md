## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| lock | error | yes | screen.lock.state.error.body | complete-lock | complete-lock:mutate | screen.lock.state.error.recovery | fixture.tails.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | complete-lock | complete-lock:mutate | screen.lock.state.offline.recovery | fixture.tails.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-needed.recovery | fixture.tails.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-denied.recovery | fixture.tails.lock.denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | complete-lock<br>permission.faceid.fallback | complete-lock:mutate | screen.lock.state.permission-restricted.recovery | fixture.tails.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| vetnote | loading | yes | screen.vetnote.state.loading.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.loading.recovery | fixture.tails.vetnote.loading |
| vetnote | populated/default | yes | screen.vetnote.state.populated-default.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.populated-default.recovery | fixture.tails.vetnote.default<br>fixture.tails.vetnote.success |
| vetnote | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| vetnote | error | yes | screen.vetnote.state.error.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.error.recovery | fixture.tails.vetnote.error |
| vetnote | offline | yes | screen.vetnote.state.offline.body | complete-vetnote | complete-vetnote:mutate | screen.vetnote.state.offline.recovery | fixture.tails.vetnote.offline |
| vetnote | permission-needed | yes | screen.vetnote.state.permission-needed.body | complete-vetnote<br>permission.speech.fallback | complete-vetnote:mutate | screen.vetnote.state.permission-needed.recovery | fixture.tails.vetnote.permission-needed |
| vetnote | permission-denied | yes | screen.vetnote.state.permission-denied.body | complete-vetnote<br>permission.speech.fallback | complete-vetnote:mutate | screen.vetnote.state.permission-denied.recovery | fixture.tails.vetnote.permission-denied |
| vetnote | permission-restricted | yes | screen.vetnote.state.permission-restricted.body | complete-vetnote<br>permission.speech.fallback | complete-vetnote:mutate | screen.vetnote.state.permission-restricted.recovery | fixture.tails.vetnote.permission-restricted |
| vetnote | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| course | loading | yes | screen.course.state.loading.body | open-background | open-background:navigate→background | screen.course.state.loading.recovery | fixture.tails.course.loading |
| course | populated/default | yes | screen.course.state.populated-default.body | open-background | open-background:navigate→background | screen.course.state.populated-default.recovery | fixture.tails.course.default |
| course | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| course | error | yes | screen.course.state.error.body | open-background | open-background:navigate→background | screen.course.state.error.recovery | fixture.tails.course.error |
| course | offline | yes | screen.course.state.offline.body | open-background | open-background:navigate→background | screen.course.state.offline.recovery | fixture.tails.course.offline |
| course | permission-needed | yes | screen.course.state.permission-needed.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.course.state.permission-needed.recovery | fixture.tails.course.permission-needed |
| course | permission-denied | yes | screen.course.state.permission-denied.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.course.state.permission-denied.recovery | fixture.tails.course.permission-denied |
| course | permission-restricted | yes | screen.course.state.permission-restricted.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.course.state.permission-restricted.recovery | fixture.tails.course.permission-restricted |
| course | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | complete-background | complete-background:mutate | screen.background.state.loading.recovery | fixture.tails.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | complete-background | complete-background:mutate | screen.background.state.populated-default.recovery | fixture.tails.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | complete-background | complete-background:mutate | screen.background.state.error.recovery | fixture.tails.background.error |
| background | offline | yes | screen.background.state.offline.body | complete-background | complete-background:mutate | screen.background.state.offline.recovery | fixture.tails.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-needed.recovery | fixture.tails.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-denied.recovery | fixture.tails.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | complete-background<br>permission.audio.fallback | complete-background:mutate | screen.background.state.permission-restricted.recovery | fixture.tails.background.permission-restricted |
