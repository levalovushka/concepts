## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.today.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.today.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body | complete-call | complete-call:mutate | screen.call.state.error.recovery | fixture.today.call.error |
| call | offline | yes | screen.call.state.offline.body | complete-call | complete-call:mutate | screen.call.state.offline.recovery | fixture.today.call.offline |
| call | permission-needed | yes | screen.call.state.permission-needed.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-needed.recovery | fixture.today.call.permission-needed |
| call | permission-denied | yes | screen.call.state.permission-denied.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-denied.recovery | fixture.today.call.permission-denied |
| call | permission-restricted | yes | screen.call.state.permission-restricted.body | complete-call<br>permission.voip.fallback | complete-call:mutate | screen.call.state.permission-restricted.recovery | fixture.today.call.permission-restricted |
| call | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| netqr | loading | yes | screen.netqr.state.loading.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.loading.recovery | fixture.today.netqr.loading |
| netqr | populated/default | yes | screen.netqr.state.populated-default.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.populated-default.recovery | fixture.today.netqr.default |
| netqr | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| netqr | error | yes | screen.netqr.state.error.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.error.recovery | fixture.today.netqr.error |
| netqr | offline | yes | screen.netqr.state.offline.body | complete-netqr | complete-netqr:mutate | screen.netqr.state.offline.recovery | fixture.today.netqr.offline |
| netqr | permission-needed | yes | screen.netqr.state.permission-needed.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-needed.recovery | fixture.today.netqr.permission-needed |
| netqr | permission-denied | yes | screen.netqr.state.permission-denied.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-denied.recovery | fixture.today.netqr.permission-denied |
| netqr | permission-restricted | yes | screen.netqr.state.permission-restricted.body | complete-netqr<br>permission.hotspot.fallback | complete-netqr:mutate | screen.netqr.state.permission-restricted.recovery | fixture.today.netqr.permission-restricted |
| netqr | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| shareext | loading | yes | screen.shareext.state.loading.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.loading.recovery | fixture.today.shareext.loading |
| shareext | populated/default | yes | screen.shareext.state.populated-default.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.populated-default.recovery | fixture.today.shareext.default<br>fixture.today.shareext.success |
| shareext | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shareext | error | yes | screen.shareext.state.error.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.error.recovery | fixture.today.shareext.error |
| shareext | offline | yes | screen.shareext.state.offline.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.offline.recovery | fixture.today.shareext.offline |
| shareext | permission-needed | yes | screen.shareext.state.permission-needed.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-needed.recovery | fixture.today.shareext.permission-needed |
| shareext | permission-denied | yes | screen.shareext.state.permission-denied.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-denied.recovery | fixture.today.shareext.permission-denied |
| shareext | permission-restricted | yes | screen.shareext.state.permission-restricted.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-restricted.recovery | fixture.today.shareext.permission-restricted |
| shareext | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
