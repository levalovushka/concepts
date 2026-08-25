## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | permission.audio.fallback |  | screen.background.state.permission-restricted.recovery | fixture.nakat.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| checklist | loading | yes | screen.checklist.state.loading.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.loading.recovery | fixture.nakat.checklist.loading |
| checklist | populated/default | yes | screen.checklist.state.populated-default.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.populated-default.recovery | fixture.nakat.checklist.default |
| checklist | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| checklist | error | yes | screen.checklist.state.error.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.error.recovery | fixture.nakat.checklist.error |
| checklist | offline | yes | screen.checklist.state.offline.body | complete-checklist | complete-checklist:mutate | screen.checklist.state.offline.recovery | fixture.nakat.checklist.offline |
| checklist | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| checklist | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| checklist | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| checklist | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| classroom | loading | yes | screen.classroom.state.loading.body | open-attend | open-attend:navigate→attend | screen.classroom.state.loading.recovery | fixture.nakat.classroom.loading |
| classroom | populated/default | yes | screen.classroom.state.populated-default.body | open-attend | open-attend:navigate→attend | screen.classroom.state.populated-default.recovery | fixture.nakat.classroom.default |
| classroom | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| classroom | error | yes | screen.classroom.state.error.body | open-attend | open-attend:navigate→attend | screen.classroom.state.error.recovery | fixture.nakat.classroom.error |
| classroom | offline | yes | screen.classroom.state.offline.body | open-attend | open-attend:navigate→attend | screen.classroom.state.offline.recovery | fixture.nakat.classroom.offline |
| classroom | permission-needed | yes | screen.classroom.state.permission-needed.body | open-attend<br>permission.wifiinfo.fallback | open-attend:navigate→attend | screen.classroom.state.permission-needed.recovery | fixture.nakat.classroom.permission-needed |
| classroom | permission-denied | yes | screen.classroom.state.permission-denied.body | open-attend<br>permission.wifiinfo.fallback | open-attend:navigate→attend | screen.classroom.state.permission-denied.recovery | fixture.nakat.classroom.permission-denied |
| classroom | permission-restricted | yes | screen.classroom.state.permission-restricted.body | open-attend<br>permission.wifiinfo.fallback | open-attend:navigate→attend | screen.classroom.state.permission-restricted.recovery | fixture.nakat.classroom.permission-restricted |
| classroom | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| attend | loading | yes | screen.attend.state.loading.body | complete-attend | complete-attend:mutate | screen.attend.state.loading.recovery | fixture.nakat.attend.loading |
| attend | populated/default | yes | screen.attend.state.populated-default.body | complete-attend | complete-attend:mutate | screen.attend.state.populated-default.recovery | fixture.nakat.attend.default |
| attend | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| attend | error | yes | screen.attend.state.error.body | complete-attend | complete-attend:mutate | screen.attend.state.error.recovery | fixture.nakat.attend.error |
| attend | offline | yes | screen.attend.state.offline.body | complete-attend | complete-attend:mutate | screen.attend.state.offline.recovery | fixture.nakat.attend.offline |
| attend | permission-needed | yes | screen.attend.state.permission-needed.body | complete-attend<br>permission.wifiinfo.fallback | complete-attend:mutate | screen.attend.state.permission-needed.recovery | fixture.nakat.attend.permission-needed |
| attend | permission-denied | yes | screen.attend.state.permission-denied.body | complete-attend<br>permission.wifiinfo.fallback | complete-attend:mutate | screen.attend.state.permission-denied.recovery | fixture.nakat.attend.permission-denied |
| attend | permission-restricted | yes | screen.attend.state.permission-restricted.body | complete-attend<br>permission.wifiinfo.fallback | complete-attend:mutate | screen.attend.state.permission-restricted.recovery | fixture.nakat.attend.permission-restricted |
| attend | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| guestnet | loading | yes | screen.guestnet.state.loading.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.loading.recovery | fixture.nakat.guestnet.loading |
| guestnet | populated/default | yes | screen.guestnet.state.populated-default.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.populated-default.recovery | fixture.nakat.guestnet.default |
| guestnet | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
