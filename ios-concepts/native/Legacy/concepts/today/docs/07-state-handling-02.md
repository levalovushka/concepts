## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| home | permission-needed | yes | screen.home.state.permission-needed.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-needed.recovery | fixture.today.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-denied.recovery | fixture.today.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-restricted.recovery | fixture.today.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | open-match<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-match:navigate→match | screen.home.state.permission-limited.recovery | fixture.today.home.permission-limited |
| match | loading | yes | screen.match.state.loading.body | complete-match | complete-match:mutate | screen.match.state.loading.recovery | fixture.today.match.loading |
| match | populated/default | yes | screen.match.state.populated-default.body | complete-match | complete-match:mutate | screen.match.state.populated-default.recovery | fixture.today.match.default |
| match | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| match | error | yes | screen.match.state.error.body | complete-match | complete-match:mutate | screen.match.state.error.recovery | fixture.today.match.error |
| match | offline | yes | screen.match.state.offline.body | complete-match | complete-match:mutate | screen.match.state.offline.recovery | fixture.today.match.offline |
| match | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| match | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| match | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| match | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| nearby | loading | yes | screen.nearby.state.loading.body | open-plan | open-plan:navigate→plan | screen.nearby.state.loading.recovery | fixture.today.nearby.loading |
| nearby | populated/default | yes | screen.nearby.state.populated-default.body | open-plan | open-plan:navigate→plan | screen.nearby.state.populated-default.recovery | fixture.today.nearby.default |
| nearby | empty | yes | screen.nearby.state.empty.body | open-plan | open-plan:navigate→plan | screen.nearby.state.empty.recovery | fixture.today.nearby.empty |
| nearby | error | yes | screen.nearby.state.error.body | open-plan | open-plan:navigate→plan | screen.nearby.state.error.recovery | fixture.today.nearby.error |
| nearby | offline | yes | screen.nearby.state.offline.body | open-plan | open-plan:navigate→plan | screen.nearby.state.offline.recovery | fixture.today.nearby.offline |
| nearby | permission-needed | yes | screen.nearby.state.permission-needed.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-needed.recovery | fixture.today.nearby.permission-needed |
| nearby | permission-denied | yes | screen.nearby.state.permission-denied.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-denied.recovery | fixture.today.nearby.permission-denied |
| nearby | permission-restricted | yes | screen.nearby.state.permission-restricted.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-restricted.recovery | fixture.today.nearby.permission-restricted |
| nearby | permission-limited | yes | screen.nearby.state.permission-limited.body | open-plan<br>permission.location.fallback | open-plan:navigate→plan | screen.nearby.state.permission-limited.recovery | fixture.today.nearby.permission-limited |
| plan | loading | yes | screen.plan.state.loading.body | open-onway | open-onway:navigate→onway | screen.plan.state.loading.recovery | fixture.today.plan.loading |
| plan | populated/default | yes | screen.plan.state.populated-default.body | open-onway | open-onway:navigate→onway | screen.plan.state.populated-default.recovery | fixture.today.plan.default |
| plan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| plan | error | yes | screen.plan.state.error.body | open-onway | open-onway:navigate→onway | screen.plan.state.error.recovery | fixture.today.plan.error |
| plan | offline | yes | screen.plan.state.offline.body | open-onway | open-onway:navigate→onway | screen.plan.state.offline.recovery | fixture.today.plan.offline |
| plan | permission-needed | yes | screen.plan.state.permission-needed.body | open-onway<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback<br>permission.calendar.fallback | open-onway:navigate→onway | screen.plan.state.permission-needed.recovery | fixture.today.plan.permission-needed |
| plan | permission-denied | yes | screen.plan.state.permission-denied.body | open-onway<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback<br>permission.calendar.fallback | open-onway:navigate→onway | screen.plan.state.permission-denied.recovery | fixture.today.plan.permission-denied |
| plan | permission-restricted | yes | screen.plan.state.permission-restricted.body | open-onway<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback<br>permission.calendar.fallback | open-onway:navigate→onway | screen.plan.state.permission-restricted.recovery | fixture.today.plan.permission-restricted |
| plan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| create | loading | yes | screen.create.state.loading.body | open-camera | open-camera:navigate→camera | screen.create.state.loading.recovery | fixture.today.create.loading |
