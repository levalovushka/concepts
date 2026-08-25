## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.tails.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.tails.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.tails.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.tails.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.tails.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.tails.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.tails.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| vaccine | loading | yes | screen.vaccine.state.loading.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.loading.recovery | fixture.tails.vaccine.loading |
| vaccine | populated/default | yes | screen.vaccine.state.populated-default.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.populated-default.recovery | fixture.tails.vaccine.default |
| vaccine | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| vaccine | error | yes | screen.vaccine.state.error.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.error.recovery | fixture.tails.vaccine.error |
| vaccine | offline | yes | screen.vaccine.state.offline.body | complete-vaccine | complete-vaccine:mutate | screen.vaccine.state.offline.recovery | fixture.tails.vaccine.offline |
| vaccine | permission-needed | yes | screen.vaccine.state.permission-needed.body | complete-vaccine<br>permission.calendar.fallback | complete-vaccine:mutate | screen.vaccine.state.permission-needed.recovery | fixture.tails.vaccine.permission-needed |
| vaccine | permission-denied | yes | screen.vaccine.state.permission-denied.body | complete-vaccine<br>permission.calendar.fallback | complete-vaccine:mutate | screen.vaccine.state.permission-denied.recovery | fixture.tails.vaccine.permission-denied |
| vaccine | permission-restricted | yes | screen.vaccine.state.permission-restricted.body | complete-vaccine<br>permission.calendar.fallback | complete-vaccine:mutate | screen.vaccine.state.permission-restricted.recovery | fixture.tails.vaccine.permission-restricted |
| vaccine | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.loading.recovery | fixture.tails.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.populated-default.recovery | fixture.tails.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.error.recovery | fixture.tails.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.offline.recovery | fixture.tails.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-needed.recovery | fixture.tails.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-denied.recovery | fixture.tails.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-restricted.recovery | fixture.tails.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shareext | loading | yes | screen.shareext.state.loading.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.loading.recovery | fixture.tails.shareext.loading |
| shareext | populated/default | yes | screen.shareext.state.populated-default.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.populated-default.recovery | fixture.tails.shareext.default<br>fixture.tails.shareext.success |
| shareext | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shareext | error | yes | screen.shareext.state.error.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.error.recovery | fixture.tails.shareext.error |
