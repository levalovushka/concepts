## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| shift | populated/default | yes | screen.shift.state.populated-default.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.populated-default.recovery | fixture.peresmenka.shift.default |
| shift | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shift | error | yes | screen.shift.state.error.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.error.recovery | fixture.peresmenka.shift.error |
| shift | offline | yes | screen.shift.state.offline.body | open-checkin | open-checkin:navigate→checkin | screen.shift.state.offline.recovery | fixture.peresmenka.shift.offline |
| shift | permission-needed | yes | screen.shift.state.permission-needed.body | open-checkin<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.calendar.fallback | open-checkin:navigate→checkin | screen.shift.state.permission-needed.recovery | fixture.peresmenka.shift.permission-needed |
| shift | permission-denied | yes | screen.shift.state.permission-denied.body | open-checkin<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.calendar.fallback | open-checkin:navigate→checkin | screen.shift.state.permission-denied.recovery | fixture.peresmenka.shift.permission-denied |
| shift | permission-restricted | yes | screen.shift.state.permission-restricted.body | open-checkin<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.calendar.fallback | open-checkin:navigate→checkin | screen.shift.state.permission-restricted.recovery | fixture.peresmenka.shift.permission-restricted |
| shift | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| checkin | loading | yes | screen.checkin.state.loading.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.loading.recovery | fixture.peresmenka.checkin.loading |
| checkin | populated/default | yes | screen.checkin.state.populated-default.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.populated-default.recovery | fixture.peresmenka.checkin.default |
| checkin | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| checkin | error | yes | screen.checkin.state.error.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.error.recovery | fixture.peresmenka.checkin.error |
| checkin | offline | yes | screen.checkin.state.offline.body | open-netqr | open-netqr:navigate→netqr | screen.checkin.state.offline.recovery | fixture.peresmenka.checkin.offline |
| checkin | permission-needed | yes | screen.checkin.state.permission-needed.body | open-netqr<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.checkin.state.permission-needed.recovery | fixture.peresmenka.checkin.permission-needed |
| checkin | permission-denied | yes | screen.checkin.state.permission-denied.body | open-netqr<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.checkin.state.permission-denied.recovery | fixture.peresmenka.checkin.permission-denied |
| checkin | permission-restricted | yes | screen.checkin.state.permission-restricted.body | open-netqr<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.checkin.state.permission-restricted.recovery | fixture.peresmenka.checkin.permission-restricted |
| checkin | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | open-scan | open-scan:navigate→scan | screen.netqr.state.loading.recovery | fixture.peresmenka.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | open-scan | open-scan:navigate→scan | screen.netqr.state.populated-default.recovery | fixture.peresmenka.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | open-scan | open-scan:navigate→scan | screen.netqr.state.error.recovery | fixture.peresmenka.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | open-scan | open-scan:navigate→scan | screen.netqr.state.offline.recovery | fixture.peresmenka.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | open-scan<br>permission.hotspot.fallback | open-scan:navigate→scan | screen.netqr.state.permission-needed.recovery | fixture.peresmenka.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | open-scan<br>permission.hotspot.fallback | open-scan:navigate→scan | screen.netqr.state.permission-denied.recovery | fixture.peresmenka.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | open-scan<br>permission.hotspot.fallback | open-scan:navigate→scan | screen.netqr.state.permission-restricted.recovery | fixture.peresmenka.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| scan | loading | yes | screen.scan.state.loading.body | complete-scan | complete-scan:mutate | screen.scan.state.loading.recovery | fixture.peresmenka.scan.loading |
| scan | populated/default | yes | screen.scan.state.populated-default.body | complete-scan | complete-scan:mutate | screen.scan.state.populated-default.recovery | fixture.peresmenka.scan.default |
| scan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scan | error | yes | screen.scan.state.error.body | complete-scan | complete-scan:mutate | screen.scan.state.error.recovery | fixture.peresmenka.scan.error |
| scan | offline | yes | screen.scan.state.offline.body | complete-scan | complete-scan:mutate | screen.scan.state.offline.recovery | fixture.peresmenka.scan.offline |
| scan | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
