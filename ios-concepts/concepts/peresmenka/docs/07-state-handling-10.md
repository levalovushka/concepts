## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| ads | loading | yes | screen.ads.state.loading.body | complete-ads | complete-ads:mutate | screen.ads.state.loading.recovery | fixture.peresmenka.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | complete-ads | complete-ads:mutate | screen.ads.state.populated-default.recovery | fixture.peresmenka.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | complete-ads | complete-ads:mutate | screen.ads.state.error.recovery | fixture.peresmenka.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | complete-ads | complete-ads:mutate | screen.ads.state.offline.recovery | fixture.peresmenka.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-needed.recovery | fixture.peresmenka.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-denied.recovery | fixture.peresmenka.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | complete-ads<br>permission.tracking.fallback | complete-ads:mutate | screen.ads.state.permission-restricted.recovery | fixture.peresmenka.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
