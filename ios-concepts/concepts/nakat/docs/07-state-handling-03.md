## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| scan | populated/default | yes | screen.scan.state.populated-default.body | complete-scan | complete-scan:mutate | screen.scan.state.populated-default.recovery | fixture.nakat.scan.default |
| scan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scan | error | yes | screen.scan.state.error.body | complete-scan | complete-scan:mutate | screen.scan.state.error.recovery | fixture.nakat.scan.error |
| scan | offline | yes | screen.scan.state.offline.body | complete-scan | complete-scan:mutate | screen.scan.state.offline.recovery | fixture.nakat.scan.offline |
| scan | permission-needed | yes | screen.scan.state.permission-needed.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-needed.recovery | fixture.nakat.scan.permission-needed |
| scan | permission-denied | yes | screen.scan.state.permission-denied.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-denied.recovery | fixture.nakat.scan.permission-denied |
| scan | permission-restricted | yes | screen.scan.state.permission-restricted.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-restricted.recovery | fixture.nakat.scan.permission-restricted |
| scan | permission-limited | yes | screen.scan.state.permission-limited.body | complete-scan<br>permission.camera.fallback | complete-scan:mutate | screen.scan.state.permission-limited.recovery | fixture.nakat.scan.permission-limited |
| drive | loading | yes | screen.drive.state.loading.body | open-note | open-note:navigate→note | screen.drive.state.loading.recovery | fixture.nakat.drive.loading |
| drive | populated/default | yes | screen.drive.state.populated-default.body | open-note | open-note:navigate→note | screen.drive.state.populated-default.recovery | fixture.nakat.drive.default |
| drive | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| drive | error | yes | screen.drive.state.error.body | open-note | open-note:navigate→note | screen.drive.state.error.recovery | fixture.nakat.drive.error |
| drive | offline | yes | screen.drive.state.offline.body | open-note | open-note:navigate→note | screen.drive.state.offline.recovery | fixture.nakat.drive.offline |
| drive | permission-needed | yes | screen.drive.state.permission-needed.body | open-note<br>permission.mic.fallback<br>permission.speech.fallback | open-note:navigate→note | screen.drive.state.permission-needed.recovery | fixture.nakat.drive.permission-needed |
| drive | permission-denied | yes | screen.drive.state.permission-denied.body | open-note<br>permission.mic.fallback<br>permission.speech.fallback | open-note:navigate→note | screen.drive.state.permission-denied.recovery | fixture.nakat.drive.permission-denied |
| drive | permission-restricted | yes | screen.drive.state.permission-restricted.body | open-note<br>permission.mic.fallback<br>permission.speech.fallback | open-note:navigate→note | screen.drive.state.permission-restricted.recovery | fixture.nakat.drive.permission-restricted |
| drive | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| note | loading | yes | screen.note.state.loading.body | complete-note | complete-note:mutate | screen.note.state.loading.recovery | fixture.nakat.note.loading |
| note | populated/default | yes | screen.note.state.populated-default.body | complete-note | complete-note:mutate | screen.note.state.populated-default.recovery | fixture.nakat.note.default |
| note | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| note | error | yes | screen.note.state.error.body | complete-note | complete-note:mutate | screen.note.state.error.recovery | fixture.nakat.note.error |
| note | offline | yes | screen.note.state.offline.body | complete-note | complete-note:mutate | screen.note.state.offline.recovery | fixture.nakat.note.offline |
| note | permission-needed | yes | screen.note.state.permission-needed.body | complete-note<br>permission.mic.fallback<br>permission.speech.fallback | complete-note:mutate | screen.note.state.permission-needed.recovery | fixture.nakat.note.permission-needed |
| note | permission-denied | yes | screen.note.state.permission-denied.body | complete-note<br>permission.mic.fallback<br>permission.speech.fallback | complete-note:mutate | screen.note.state.permission-denied.recovery | fixture.nakat.note.permission-denied |
| note | permission-restricted | yes | screen.note.state.permission-restricted.body | complete-note<br>permission.mic.fallback<br>permission.speech.fallback | complete-note:mutate | screen.note.state.permission-restricted.recovery | fixture.nakat.note.permission-restricted |
| note | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| reschedule | loading | yes | screen.reschedule.state.loading.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.loading.recovery | fixture.nakat.reschedule.loading |
| reschedule | populated/default | yes | screen.reschedule.state.populated-default.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.populated-default.recovery | fixture.nakat.reschedule.default |
| reschedule | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| reschedule | error | yes | screen.reschedule.state.error.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.error.recovery | fixture.nakat.reschedule.error |
| reschedule | offline | yes | screen.reschedule.state.offline.body | complete-reschedule | complete-reschedule:mutate | screen.reschedule.state.offline.recovery | fixture.nakat.reschedule.offline |
| reschedule | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
