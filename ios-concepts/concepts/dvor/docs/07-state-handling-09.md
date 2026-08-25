## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| settings | offline | yes | screen.settings.state.offline.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.offline.recovery | fixture.dvor.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | enable-app-lock<br>open-personalization<br>enable-background-updates<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.faceid.fallback | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.permission-needed.recovery | fixture.dvor.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | enable-app-lock<br>open-personalization<br>enable-background-updates<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.faceid.fallback | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.permission-denied.recovery | fixture.dvor.settings.permission-denied |
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | enable-app-lock<br>open-personalization<br>enable-background-updates<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.faceid.fallback | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.permission-restricted.recovery | fixture.dvor.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | yes | screen.ads.state.loading.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.loading.recovery | fixture.dvor.ads.loading |
| ads | populated/default | yes | screen.ads.state.populated-default.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.populated-default.recovery | fixture.dvor.ads.default<br>fixture.dvor.ads.accepted<br>fixture.dvor.ads.declined |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.error.recovery | fixture.dvor.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | enable-personalization<br>decline-personalization | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.offline.recovery | fixture.dvor.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | enable-personalization<br>decline-personalization<br>permission.tracking.fallback | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.permission-needed.recovery | fixture.dvor.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | enable-personalization<br>decline-personalization<br>permission.tracking.fallback | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.permission-denied.recovery | fixture.dvor.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | enable-personalization<br>decline-personalization<br>permission.tracking.fallback | enable-personalization:request<br>decline-personalization:mutate | screen.ads.state.permission-restricted.recovery | fixture.dvor.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| lock | populated/default | yes | screen.lock.state.populated-default.body |  |  | screen.lock.state.populated-default.recovery | fixture.dvor.lock.locked<br>fixture.dvor.lock.unlocked |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| lock | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | permission.faceid.fallback |  | screen.lock.state.permission-needed.recovery | fixture.dvor.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | permission.faceid.fallback |  | screen.lock.state.permission-denied.recovery | fixture.dvor.lock.permission-denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | permission.faceid.fallback |  | screen.lock.state.permission-restricted.recovery | fixture.dvor.lock.permission-restricted |
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| widget | populated/default | yes | screen.widget.state.populated-default.body |  |  | screen.widget.state.populated-default.recovery | fixture.dvor.widget.current |
| widget | empty | yes | screen.widget.state.empty.body |  |  | screen.widget.state.empty.recovery | fixture.dvor.widget.empty |
| widget | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| widget | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-needed.recovery | fixture.dvor.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-denied.recovery | fixture.dvor.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | permission.appgroups.fallback<br>permission.keychain.fallback |  | screen.widget.state.permission-restricted.recovery | fixture.dvor.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
