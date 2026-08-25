## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| lessons | permission-needed | yes | screen.lessons.state.permission-needed.body | open-lesson<br>permission.fetch.fallback<br>permission.keychain.fallback | open-lesson:navigate→lesson | screen.lessons.state.permission-needed.recovery | fixture.nakat.lessons.permission-needed |
| lessons | permission-denied | yes | screen.lessons.state.permission-denied.body | open-lesson<br>permission.fetch.fallback<br>permission.keychain.fallback | open-lesson:navigate→lesson | screen.lessons.state.permission-denied.recovery | fixture.nakat.lessons.permission-denied |
| lessons | permission-restricted | yes | screen.lessons.state.permission-restricted.body | open-lesson<br>permission.fetch.fallback<br>permission.keychain.fallback | open-lesson:navigate→lesson | screen.lessons.state.permission-restricted.recovery | fixture.nakat.lessons.permission-restricted |
| lessons | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lesson | loading | yes | screen.lesson.state.loading.body | open-call | open-call:navigate→call | screen.lesson.state.loading.recovery | fixture.nakat.lesson.loading |
| lesson | populated/default | yes | screen.lesson.state.populated-default.body | open-call | open-call:navigate→call | screen.lesson.state.populated-default.recovery | fixture.nakat.lesson.default |
| lesson | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lesson | error | yes | screen.lesson.state.error.body | open-call | open-call:navigate→call | screen.lesson.state.error.recovery | fixture.nakat.lesson.error |
| lesson | offline | yes | screen.lesson.state.offline.body | open-call | open-call:navigate→call | screen.lesson.state.offline.recovery | fixture.nakat.lesson.offline |
| lesson | permission-needed | yes | screen.lesson.state.permission-needed.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-needed.recovery | fixture.nakat.lesson.permission-needed |
| lesson | permission-denied | yes | screen.lesson.state.permission-denied.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-denied.recovery | fixture.nakat.lesson.permission-denied |
| lesson | permission-restricted | yes | screen.lesson.state.permission-restricted.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-restricted.recovery | fixture.nakat.lesson.permission-restricted |
| lesson | permission-limited | yes | screen.lesson.state.permission-limited.body | open-call<br>permission.voip.fallback<br>permission.camera.fallback<br>permission.location.fallback<br>permission.calendar.fallback | open-call:navigate→call | screen.lesson.state.permission-limited.recovery | fixture.nakat.lesson.permission-limited |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.nakat.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.nakat.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.nakat.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.nakat.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.nakat.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.nakat.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.nakat.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| pickup | loading | yes | screen.pickup.state.loading.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.loading.recovery | fixture.nakat.pickup.loading |
| pickup | populated/default | yes | screen.pickup.state.populated-default.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.populated-default.recovery | fixture.nakat.pickup.default |
| pickup | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| pickup | error | yes | screen.pickup.state.error.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.error.recovery | fixture.nakat.pickup.error |
| pickup | offline | yes | screen.pickup.state.offline.body | complete-pickup | complete-pickup:mutate | screen.pickup.state.offline.recovery | fixture.nakat.pickup.offline |
| pickup | permission-needed | yes | screen.pickup.state.permission-needed.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-needed.recovery | fixture.nakat.pickup.permission-needed |
| pickup | permission-denied | yes | screen.pickup.state.permission-denied.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-denied.recovery | fixture.nakat.pickup.permission-denied |
| pickup | permission-restricted | yes | screen.pickup.state.permission-restricted.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-restricted.recovery | fixture.nakat.pickup.permission-restricted |
| pickup | permission-limited | yes | screen.pickup.state.permission-limited.body | complete-pickup<br>permission.location.fallback | complete-pickup:mutate | screen.pickup.state.permission-limited.recovery | fixture.nakat.pickup.permission-limited |
| scan | loading | yes | screen.scan.state.loading.body | complete-scan | complete-scan:mutate | screen.scan.state.loading.recovery | fixture.nakat.scan.loading |
