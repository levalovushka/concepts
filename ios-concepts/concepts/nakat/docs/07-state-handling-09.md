## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| widget | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | permission.remotenotif.fallback<br>permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-needed.recovery | fixture.nakat.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | permission.remotenotif.fallback<br>permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-denied.recovery | fixture.nakat.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | permission.remotenotif.fallback<br>permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-restricted.recovery | fixture.nakat.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| bg | loading | yes | screen.bg.state.loading.body | complete-bg | complete-bg:mutate | screen.bg.state.loading.recovery | fixture.nakat.bg.loading |
| bg | populated/default | yes | screen.bg.state.populated-default.body | complete-bg | complete-bg:mutate | screen.bg.state.populated-default.recovery | fixture.nakat.bg.default |
| bg | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| bg | error | yes | screen.bg.state.error.body | complete-bg | complete-bg:mutate | screen.bg.state.error.recovery | fixture.nakat.bg.error |
| bg | offline | yes | screen.bg.state.offline.body | complete-bg | complete-bg:mutate | screen.bg.state.offline.recovery | fixture.nakat.bg.offline |
| bg | permission-needed | yes | screen.bg.state.permission-needed.body | complete-bg<br>permission.fetch.fallback<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | complete-bg:mutate | screen.bg.state.permission-needed.recovery | fixture.nakat.bg.permission-needed |
| bg | permission-denied | yes | screen.bg.state.permission-denied.body | complete-bg<br>permission.fetch.fallback<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | complete-bg:mutate | screen.bg.state.permission-denied.recovery | fixture.nakat.bg.permission-denied |
| bg | permission-restricted | yes | screen.bg.state.permission-restricted.body | complete-bg<br>permission.fetch.fallback<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | complete-bg:mutate | screen.bg.state.permission-restricted.recovery | fixture.nakat.bg.permission-restricted |
| bg | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.nakat.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.nakat.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.nakat.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.nakat.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.nakat.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.nakat.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.nakat.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
