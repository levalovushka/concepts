## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| call | offline | yes | screen.call.state.offline.body |  |  | screen.call.state.offline.recovery | fixture.looks.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | permission.voip.fallback |  | screen.call.state.permission-needed.recovery | fixture.looks.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | permission.voip.fallback |  | screen.call.state.permission-denied.recovery | fixture.looks.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | permission.voip.fallback |  | screen.call.state.permission-restricted.recovery | fixture.looks.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| swap | loading | yes | screen.swap.state.loading.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.loading.recovery | fixture.looks.swap.loading |
| swap | populated/default | yes | screen.swap.state.populated-default.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.populated-default.recovery | fixture.looks.swap.default |
| swap | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| swap | error | yes | screen.swap.state.error.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.error.recovery | fixture.looks.swap.error |
| swap | offline | yes | screen.swap.state.offline.body | add-swap-calendar | add-swap-calendar:request | screen.swap.state.offline.recovery | fixture.looks.swap.offline |
| swap | permission-needed | yes | screen.swap.state.permission-needed.body | add-swap-calendar<br>permission.calendar.fallback | add-swap-calendar:request | screen.swap.state.permission-needed.recovery | fixture.looks.swap.permission-needed |
| swap | permission-denied | yes | screen.swap.state.permission-denied.body | add-swap-calendar<br>permission.calendar.fallback | add-swap-calendar:request | screen.swap.state.permission-denied.recovery | fixture.looks.swap.permission-denied |
| swap | permission-restricted | yes | screen.swap.state.permission-restricted.body | add-swap-calendar<br>permission.calendar.fallback | add-swap-calendar:request | screen.swap.state.permission-restricted.recovery | fixture.looks.swap.permission-restricted |
| swap | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| checkin | loading | yes | screen.checkin.state.loading.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.loading.recovery | fixture.looks.checkin.loading |
| checkin | populated/default | yes | screen.checkin.state.populated-default.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.populated-default.recovery | fixture.looks.checkin.default |
| checkin | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| checkin | error | yes | screen.checkin.state.error.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.error.recovery | fixture.looks.checkin.error |
| checkin | offline | yes | screen.checkin.state.offline.body | confirm-swap-checkin | confirm-swap-checkin:request | screen.checkin.state.offline.recovery | fixture.looks.checkin.offline |
| checkin | permission-needed | yes | screen.checkin.state.permission-needed.body | confirm-swap-checkin<br>permission.wifiinfo.fallback | confirm-swap-checkin:request | screen.checkin.state.permission-needed.recovery | fixture.looks.checkin.permission-needed |
| checkin | permission-denied | yes | screen.checkin.state.permission-denied.body | confirm-swap-checkin<br>permission.wifiinfo.fallback | confirm-swap-checkin:request | screen.checkin.state.permission-denied.recovery | fixture.looks.checkin.denied |
| checkin | permission-restricted | yes | screen.checkin.state.permission-restricted.body | confirm-swap-checkin<br>permission.wifiinfo.fallback | confirm-swap-checkin:request | screen.checkin.state.permission-restricted.recovery | fixture.looks.checkin.permission-restricted |
| checkin | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | join-venue-network | join-venue-network:request | screen.netqr.state.loading.recovery | fixture.looks.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | join-venue-network | join-venue-network:request | screen.netqr.state.populated-default.recovery | fixture.looks.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | join-venue-network | join-venue-network:request | screen.netqr.state.error.recovery | fixture.looks.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | join-venue-network | join-venue-network:request | screen.netqr.state.offline.recovery | fixture.looks.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | join-venue-network<br>permission.hotspot.fallback | join-venue-network:request | screen.netqr.state.permission-needed.recovery | fixture.looks.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | join-venue-network<br>permission.hotspot.fallback | join-venue-network:request | screen.netqr.state.permission-denied.recovery | fixture.looks.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | join-venue-network<br>permission.hotspot.fallback | join-venue-network:request | screen.netqr.state.permission-restricted.recovery | fixture.looks.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
