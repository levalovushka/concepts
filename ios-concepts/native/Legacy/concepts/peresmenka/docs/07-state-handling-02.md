## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| join | permission-needed | yes | screen.join.state.permission-needed.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-needed.recovery | fixture.peresmenka.join.permission-needed |
| join | permission-denied | yes | screen.join.state.permission-denied.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-denied.recovery | fixture.peresmenka.join.permission-denied |
| join | permission-restricted | yes | screen.join.state.permission-restricted.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-restricted.recovery | fixture.peresmenka.join.permission-restricted |
| join | permission-limited | yes | screen.join.state.permission-limited.body | open-manual<br>permission.location.fallback | open-manual:navigate→manual | screen.join.state.permission-limited.recovery | fixture.peresmenka.join.permission-limited |
| manual | loading | yes | screen.manual.state.loading.body | complete-manual | complete-manual:mutate | screen.manual.state.loading.recovery | fixture.peresmenka.manual.loading |
| manual | populated/default | yes | screen.manual.state.populated-default.body | complete-manual | complete-manual:mutate | screen.manual.state.populated-default.recovery | fixture.peresmenka.manual.default |
| manual | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| manual | error | yes | screen.manual.state.error.body | complete-manual | complete-manual:mutate | screen.manual.state.error.recovery | fixture.peresmenka.manual.error |
| manual | offline | yes | screen.manual.state.offline.body | complete-manual | complete-manual:mutate | screen.manual.state.offline.recovery | fixture.peresmenka.manual.offline |
| manual | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| manual | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shifts | loading | yes | screen.shifts.state.loading.body | open-import | open-import:navigate→import | screen.shifts.state.loading.recovery | fixture.peresmenka.shifts.loading |
| shifts | populated/default | yes | screen.shifts.state.populated-default.body | open-import | open-import:navigate→import | screen.shifts.state.populated-default.recovery | fixture.peresmenka.shifts.default |
| shifts | empty | yes | screen.shifts.state.empty.body | open-import | open-import:navigate→import | screen.shifts.state.empty.recovery | fixture.peresmenka.shifts.empty |
| shifts | error | yes | screen.shifts.state.error.body | open-import | open-import:navigate→import | screen.shifts.state.error.recovery | fixture.peresmenka.shifts.error |
| shifts | offline | yes | screen.shifts.state.offline.body | open-import | open-import:navigate→import | screen.shifts.state.offline.recovery | fixture.peresmenka.shifts.offline |
| shifts | permission-needed | yes | screen.shifts.state.permission-needed.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-needed.recovery | fixture.peresmenka.shifts.permission-needed |
| shifts | permission-denied | yes | screen.shifts.state.permission-denied.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-denied.recovery | fixture.peresmenka.shifts.permission-denied |
| shifts | permission-restricted | yes | screen.shifts.state.permission-restricted.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-restricted.recovery | fixture.peresmenka.shifts.permission-restricted |
| shifts | permission-limited | yes | screen.shifts.state.permission-limited.body | open-import<br>permission.photos.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-import:navigate→import | screen.shifts.state.permission-limited.recovery | fixture.peresmenka.shifts.permission-limited |
| import | loading | yes | screen.import.state.loading.body | complete-import | complete-import:mutate | screen.import.state.loading.recovery | fixture.peresmenka.import.loading |
| import | populated/default | yes | screen.import.state.populated-default.body | complete-import | complete-import:mutate | screen.import.state.populated-default.recovery | fixture.peresmenka.import.default |
| import | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| import | error | yes | screen.import.state.error.body | complete-import | complete-import:mutate | screen.import.state.error.recovery | fixture.peresmenka.import.error |
| import | offline | yes | screen.import.state.offline.body | complete-import | complete-import:mutate | screen.import.state.offline.recovery | fixture.peresmenka.import.offline |
| import | permission-needed | yes | screen.import.state.permission-needed.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-needed.recovery | fixture.peresmenka.import.permission-needed |
| import | permission-denied | yes | screen.import.state.permission-denied.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-denied.recovery | fixture.peresmenka.import.permission-denied |
| import | permission-restricted | yes | screen.import.state.permission-restricted.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-restricted.recovery | fixture.peresmenka.import.permission-restricted |
| import | permission-limited | yes | screen.import.state.permission-limited.body | complete-import<br>permission.photos.fallback | complete-import:mutate | screen.import.state.permission-limited.recovery | fixture.peresmenka.import.permission-limited |
| shift | loading | yes | screen.shift.state.loading.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.loading.recovery | fixture.peresmenka.shift.loading |
